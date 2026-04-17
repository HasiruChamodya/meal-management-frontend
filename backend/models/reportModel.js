const pool = require("../config/db");

exports.getAccountantDashboardData = async (timeframe) => {
  const client = await pool.connect();
  try {
    // 1. Determine the date filter based on the dropdown selection
    let dateFilter = "CURRENT_DATE - INTERVAL '6 months'";
    if (timeframe === '1d') dateFilter = "CURRENT_DATE"; // Today
    else if (timeframe === '1w') dateFilter = "CURRENT_DATE - INTERVAL '7 days'";
    else if (timeframe === '1m') dateFilter = "CURRENT_DATE - INTERVAL '1 month'";
    else if (timeframe === '3m') dateFilter = "CURRENT_DATE - INTERVAL '3 months'";
    else if (timeframe === '6m') dateFilter = "CURRENT_DATE - INTERVAL '6 months'";
    else if (timeframe === '1y') dateFilter = "CURRENT_DATE - INTERVAL '1 year'";
    else if (timeframe === 'all') dateFilter = "'2000-01-01'"; // Catch everything!

    // 2. Expenditure by Category (Filtered by timeframe)
    const categoryRes = await client.query(`
      SELECT 
        c.name, 
        SUM(ii.total_price) as value
      FROM invoice_items ii
      JOIN items i ON ii.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      JOIN invoices inv ON ii.invoice_id = inv.id
      WHERE inv.status = 'received' AND inv.invoice_date >= ${dateFilter}
      GROUP BY c.name
      ORDER BY value DESC
    `);

    // 3. Invoice Spending Trend (Dynamically grouped by Day or Month)
    let trendQuery = "";
    if (timeframe === '1d' || timeframe === '1w' || timeframe === '1m') {
      // For short timeframes: Group by exact date
      trendQuery = `
        SELECT TO_CHAR(invoice_date, 'DD Mon') as label, invoice_date as sort_date, SUM(billed_total) as total
        FROM invoices WHERE status = 'received' AND invoice_date >= ${dateFilter}
        GROUP BY invoice_date ORDER BY sort_date ASC
      `;
    } else if (timeframe === 'all') {
      // For All Time: Group by Month and Year
      trendQuery = `
        SELECT TO_CHAR(invoice_date, 'Mon YYYY') as label, TO_CHAR(invoice_date, 'YYYY-MM') as sort_date, SUM(billed_total) as total
        FROM invoices WHERE status = 'received' AND invoice_date >= ${dateFilter}
        GROUP BY TO_CHAR(invoice_date, 'Mon YYYY'), TO_CHAR(invoice_date, 'YYYY-MM')
        ORDER BY sort_date ASC
      `;
    } else {
      // For 3m, 6m, 1y: Group by Month
      trendQuery = `
        SELECT TO_CHAR(invoice_date, 'Mon') as label, EXTRACT(MONTH FROM invoice_date) as sort_date, SUM(billed_total) as total
        FROM invoices WHERE status = 'received' AND invoice_date >= ${dateFilter}
        GROUP BY TO_CHAR(invoice_date, 'Mon'), EXTRACT(MONTH FROM invoice_date)
        ORDER BY sort_date ASC
      `;
    }

    const trendRes = await client.query(trendQuery);

    return {
      categorySpend: categoryRes.rows.map((r, index) => ({ 
        name: r.name, 
        value: Number(r.value),
        color: `hsl(var(--chart-${(index % 5) + 1}))` 
      })),
      spendingTrend: trendRes.rows.map(r => ({
        label: r.label,
        total: Number(r.total) || 0
      }))
    };
  } finally {
    client.release();
  }
};