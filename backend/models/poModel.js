// models/poModel.js
const pool = require("../config/db");

exports.createPurchaseOrder = async ({ calcRunId, poDate, items, createdBy }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const originalTotal = items.reduce(
      (sum, i) => sum + (i.quantity || 0) * (i.unitPrice || 0), 0
    );

    const seqResult = await client.query("SELECT nextval('bill_number_seq') AS num");
    const billNumber = String(seqResult.rows[0].num).padStart(6, "0");

    const poResult = await client.query(
      `INSERT INTO purchase_orders
        (calc_run_id, po_date, bill_number, status, original_total, created_by)
       VALUES ($1, $2, $3, 'draft', $4, $5)
       RETURNING *`,
      [calcRunId, poDate, billNumber, originalTotal, createdBy]
    );
    const po = poResult.rows[0];

    for (const item of items) {
      const totalPrice = Math.round((item.quantity || 0) * (item.unitPrice || 0) * 100) / 100;
      const isPriceChanged = item.unitPrice !== item.defaultPrice;

      await client.query(
        `INSERT INTO po_items
          (po_id, item_id, category_id, quantity, unit, unit_price, default_price,
           total_price, is_price_changed, for_breakfast, for_lunch, for_dinner, for_extra, for_kanda)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          po.id, item.itemId, item.categoryId,
          item.quantity, item.unit, item.unitPrice, item.defaultPrice,
          totalPrice, isPriceChanged,
          item.forBreakfast || false, item.forLunch || false, item.forDinner || false,
          item.forExtra || false, item.forKanda || false,
        ]
      );
    }

    await client.query("COMMIT");
    return { ...po, billNumber, itemCount: items.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.updatePurchaseOrder = async (poId, { items }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const poCheck = await client.query(
      "SELECT id, status FROM purchase_orders WHERE id = $1", [poId]
    );
    if (!poCheck.rows[0]) throw new Error("Purchase order not found");
    if (poCheck.rows[0].status !== "draft") {
      throw new Error("Can only edit draft purchase orders");
    }

    await client.query("DELETE FROM po_items WHERE po_id = $1", [poId]);

    let originalTotal = 0;
    for (const item of items) {
      const totalPrice = Math.round((item.quantity || 0) * (item.unitPrice || 0) * 100) / 100;
      originalTotal += totalPrice;
      const isPriceChanged = item.unitPrice !== item.defaultPrice;

      await client.query(
        `INSERT INTO po_items
          (po_id, item_id, category_id, quantity, unit, unit_price, default_price,
           total_price, is_price_changed, for_breakfast, for_lunch, for_dinner, for_extra, for_kanda)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          poId, item.itemId, item.categoryId,
          item.quantity, item.unit, item.unitPrice, item.defaultPrice,
          totalPrice, isPriceChanged,
          item.forBreakfast || false, item.forLunch || false, item.forDinner || false,
          item.forExtra || false, item.forKanda || false,
        ]
      );
    }

    await client.query(
      `UPDATE purchase_orders SET original_total = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [originalTotal, poId]
    );

    await client.query("COMMIT");
    return { poId, itemCount: items.length, originalTotal };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.submitForApproval = async (poId, userId) => {
  const result = await pool.query(
    `UPDATE purchase_orders
     SET status = 'pending', submitted_at = CURRENT_TIMESTAMP, submitted_by = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND status = 'draft'
     RETURNING *`,
    [userId, poId]
  );
  if (result.rowCount === 0) throw new Error("PO not found or not in draft status");
  return result.rows[0];
};

exports.approvePurchaseOrder = async (poId, userId, { revisions = {} } = {}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const poCheck = await client.query(
      "SELECT id, status FROM purchase_orders WHERE id = $1", [poId]
    );
    if (!poCheck.rows[0]) throw new Error("Purchase order not found");
    if (poCheck.rows[0].status !== "pending") {
      throw new Error("Can only approve pending purchase orders");
    }

    let revisedTotal = 0;
    const poItems = await client.query(
      "SELECT * FROM po_items WHERE po_id = $1", [poId]
    );

    for (const item of poItems.rows) {
      const rev = revisions[String(item.item_id)] || revisions[String(item.id)];
      if (rev) {
        const rQty = rev.qty != null ? rev.qty : item.quantity;
        const rPrice = rev.price != null ? rev.price : item.unit_price;
        const rTotal = Math.round(rQty * rPrice * 100) / 100;

        await client.query(
          `UPDATE po_items
           SET revised_qty = $1, revised_price = $2, revised_total = $3
           WHERE id = $4`,
          [rQty, rPrice, rTotal, item.id]
        );
        revisedTotal += rTotal;
      } else {
        revisedTotal += parseFloat(item.total_price);
      }
    }

    await client.query(
      `UPDATE purchase_orders
       SET status = 'approved',
           revised_total = $1,
           reviewed_at = CURRENT_TIMESTAMP,
           reviewed_by = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [revisedTotal, userId, poId]
    );

    await client.query("COMMIT");
    return { poId, status: "approved", revisedTotal };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.rejectPurchaseOrder = async (poId, userId, reason) => {
  const result = await pool.query(
    `UPDATE purchase_orders
     SET status = 'rejected',
         rejection_reason = $1,
         reviewed_at = CURRENT_TIMESTAMP,
         reviewed_by = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND status = 'pending'
     RETURNING *`,
    [reason, userId, poId]
  );
  if (result.rowCount === 0) throw new Error("PO not found or not in pending status");
  return result.rows[0];
};

exports.revisePurchaseOrder = async (poId) => {
  const result = await pool.query(
    `UPDATE purchase_orders
     SET status = 'draft',
         rejection_reason = NULL,
         reviewed_at = NULL,
         reviewed_by = NULL,
         submitted_at = NULL,
         submitted_by = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status = 'rejected'
     RETURNING *`,
    [poId]
  );
  if (result.rowCount === 0) throw new Error("PO not found or not in rejected status");
  return result.rows[0];
};

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

exports.getAllPurchaseOrders = async () => {
  const result = await pool.query(`
    SELECT
      po.*,
      (SELECT COUNT(*) FROM po_items pi WHERE pi.po_id = po.id) AS item_count,
      u1.full_name AS created_by_name,
      u2.full_name AS submitted_by_name,
      u3.full_name AS reviewed_by_name
    FROM purchase_orders po
    LEFT JOIN users u1 ON u1.id = po.created_by
    LEFT JOIN users u2 ON u2.id = po.submitted_by
    LEFT JOIN users u3 ON u3.id = po.reviewed_by
    ORDER BY po.po_date DESC, po.id DESC
  `);
  return result.rows.map(mapPoRow);
};

exports.getPurchaseOrdersByStatus = async (status) => {
  const result = await pool.query(`
    SELECT
      po.*,
      (SELECT COUNT(*) FROM po_items pi WHERE pi.po_id = po.id) AS item_count,
      (SELECT COUNT(*) FROM po_items pi WHERE pi.po_id = po.id AND pi.is_price_changed = TRUE) AS price_changes,
      u1.full_name AS created_by_name,
      u2.full_name AS submitted_by_name
    FROM purchase_orders po
    LEFT JOIN users u1 ON u1.id = po.created_by
    LEFT JOIN users u2 ON u2.id = po.submitted_by
    WHERE po.status = $1
    ORDER BY po.po_date DESC
  `, [status]);
  return result.rows.map(mapPoRow);
};

exports.getPurchaseOrderById = async (poId) => {
  const poResult = await pool.query(`
    SELECT
      po.*,
      u1.full_name AS created_by_name,
      u2.full_name AS submitted_by_name,
      u3.full_name AS reviewed_by_name
    FROM purchase_orders po
    LEFT JOIN users u1 ON u1.id = po.created_by
    LEFT JOIN users u2 ON u2.id = po.submitted_by
    LEFT JOIN users u3 ON u3.id = po.reviewed_by
    WHERE po.id = $1
  `, [poId]);

  if (poResult.rows.length === 0) return null;
  const po = mapPoRow(poResult.rows[0]);

  const itemsResult = await pool.query(`
    SELECT
      pi.*,
      i.name_en, i.name_si, i.unit AS item_unit,
      c.name AS category_name
    FROM po_items pi
    JOIN items i ON i.id = pi.item_id
    JOIN categories c ON c.id = pi.category_id
    WHERE pi.po_id = $1
    ORDER BY pi.category_id ASC, i.name_en ASC
  `, [poId]);

  const categoriesMap = {};
  const flatItems = []; // <-- ADDED: Create a flat list for the Invoice view

  for (const row of itemsResult.rows) {
    const mappedItem = mapPoItemRow(row);
    
    flatItems.push(mappedItem); // Push to flat list

    const catId = row.category_id;
    if (!categoriesMap[catId]) {
      categoriesMap[catId] = {
        id: catId,
        name: row.category_name,
        items: [],
      };
    }
    categoriesMap[catId].items.push(mappedItem); // Push to grouped list
  }

  po.categories = Object.values(categoriesMap);
  po.items = flatItems; // <-- ADDED: Attach the flat list to the response payload
  
  po.itemCount = itemsResult.rows.length;
  po.priceChanges = itemsResult.rows.filter((r) => r.is_price_changed).length;

  return po;
};

exports.getPurchaseOrderByDate = async (date) => {
  const result = await pool.query(
    "SELECT * FROM purchase_orders WHERE po_date = $1", [date]
  );
  return result.rows[0] ? mapPoRow(result.rows[0]) : null;
};

// ──────────────────────────────────────────────
// Row mappers
// ──────────────────────────────────────────────

function mapPoRow(row) {
  return {
    id: row.id,
    calcRunId: row.calc_run_id,
    date: row.po_date,
    billNumber: row.bill_number,
    status: row.status,
    originalTotal: parseFloat(row.original_total) || 0,
    revisedTotal: row.revised_total ? parseFloat(row.revised_total) : null,
    rejectionReason: row.rejection_reason,
    createdBy: row.created_by,
    createdByName: row.created_by_name || null,
    submittedAt: row.submitted_at,
    submittedBy: row.submitted_by,
    submittedByName: row.submitted_by_name || null,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewedByName: row.reviewed_by_name || null,
    itemCount: parseInt(row.item_count) || 0,
    priceChanges: parseInt(row.price_changes) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPoItemRow(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    nameEn: row.name_en,
    nameSi: row.name_si,
    unit: row.unit || row.item_unit,
    quantity: parseFloat(row.quantity) || 0,
    unitPrice: parseFloat(row.unit_price) || 0,
    defaultPrice: parseFloat(row.default_price) || 0,
    totalPrice: parseFloat(row.total_price) || 0,
    isPriceChanged: row.is_price_changed || false,
    forBreakfast: row.for_breakfast || false,
    forLunch: row.for_lunch || false,
    forDinner: row.for_dinner || false,
    forExtra: row.for_extra || false,
    forKanda: row.for_kanda || false,
    revisedQty: row.revised_qty ? parseFloat(row.revised_qty) : null,
    revisedPrice: row.revised_price ? parseFloat(row.revised_price) : null,
    revisedTotal: row.revised_total ? parseFloat(row.revised_total) : null,
  };
}