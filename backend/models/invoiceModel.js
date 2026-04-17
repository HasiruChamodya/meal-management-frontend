const pool = require("../config/db");

// Get POs that are approved and waiting for delivery
exports.getPendingDeliveries = async () => {
  const result = await pool.query(`
    SELECT id, bill_number, po_date, original_total, revised_total, status 
    FROM purchase_orders 
    WHERE status = 'approved' OR status = 'partially_delivered'
    ORDER BY po_date DESC
  `);
  return result.rows;
};

// Save the invoice and all checked-off items
exports.createInvoice = async (invoiceData, itemsData) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert the Invoice Header (Notice the $6 added here!)
    const invRes = await client.query(`
      INSERT INTO invoices 
        (po_id, invoice_number, invoice_date, status, billed_total, received_by, notes, received_at)
      VALUES 
        ($1, $2, $3, 'received', $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      invoiceData.poId, 
      invoiceData.invoiceNumber, 
      invoiceData.invoiceDate, 
      invoiceData.billedTotal, 
      invoiceData.receivedBy,
      invoiceData.notes 
    ]);

    const newInvoice = invRes.rows[0];

    // 2. Insert all Invoice Line Items
    for (const item of itemsData) {
      await client.query(`
        INSERT INTO invoice_items 
          (invoice_id, po_item_id, item_id, ordered_qty, received_qty, unit_price, total_price, status, notes)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        newInvoice.id,
        item.poItemId,
        item.itemId,
        item.orderedQty,
        item.receivedQty,
        item.unitPrice,
        item.totalPrice,
        item.status,
        item.notes || null
      ]);
    }

    // 3. Update the original Purchase Order status
    await client.query(`
      UPDATE purchase_orders 
      SET status = 'delivered', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [invoiceData.poId]);

    await client.query("COMMIT");
    return newInvoice;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


exports.getIssueReports = async () => {
  const result = await pool.query(`
    SELECT
      inv.id,
      inv.invoice_number as "orderNo",
      inv.invoice_date as date,
      inv.notes as "overallNotes",
      po.bill_number as "poBillNumber",
      (
        SELECT COUNT(*) FROM invoice_items ii 
        WHERE ii.invoice_id = inv.id AND ii.received_qty != ii.ordered_qty
      ) as "qtyIssues",
      (
        SELECT COUNT(*) FROM invoice_items ii 
        WHERE ii.invoice_id = inv.id AND ii.notes IS NOT NULL AND ii.notes != ''
      ) as "qualityIssues",
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'name', i.name_en,
              'orderedQty', ii.ordered_qty,
              'receivedQty', ii.received_qty,
              'unit', i.unit,
              'issue', CASE 
                         WHEN ii.received_qty < ii.ordered_qty THEN 'Shortage'
                         WHEN ii.received_qty > ii.ordered_qty THEN 'Excess'
                         ELSE 'Quality Issue' 
                       END,
              'details', ii.notes
            )
          )
          FROM invoice_items ii
          JOIN items i ON i.id = ii.item_id
          WHERE ii.invoice_id = inv.id AND (ii.received_qty != ii.ordered_qty OR ii.notes IS NOT NULL)
        ), '[]'::json
      ) as items
    FROM invoices inv
    JOIN purchase_orders po ON po.id = inv.po_id
    WHERE EXISTS (
      SELECT 1 FROM invoice_items ii
      WHERE ii.invoice_id = inv.id AND (ii.received_qty != ii.ordered_qty OR ii.notes IS NOT NULL)
    ) OR inv.notes IS NOT NULL
    ORDER BY inv.received_at DESC
  `);
  
  return result.rows;
};