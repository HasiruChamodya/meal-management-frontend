const pool = require("../config/db");

// Gets the cycle for the specific date, or the most recent one before it
const getCycleForDate = async (date) => {
  const query = `
    SELECT * FROM daily_meal_cycles
    WHERE date <= $1
    ORDER BY date DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [date]);
  
  if (result.rows.length === 0) return null;

  return {
    date: result.rows[0].date,
    patientCycle: result.rows[0].patient_cycle,
    staffCycle: result.rows[0].staff_cycle,
    updatedAt: result.rows[0].updated_at
  };
};

const upsertCycle = async (date, patientCycle, staffCycle) => {
  const query = `
    INSERT INTO daily_meal_cycles (date, patient_cycle, staff_cycle)
    VALUES ($1, $2, $3)
    ON CONFLICT (date) 
    DO UPDATE SET 
      patient_cycle = EXCLUDED.patient_cycle,
      staff_cycle = EXCLUDED.staff_cycle,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const values = [date, patientCycle, staffCycle];
  const result = await pool.query(query, values);
  
  return {
    date: result.rows[0].date,
    patientCycle: result.rows[0].patient_cycle,
    staffCycle: result.rows[0].staff_cycle,
    updatedAt: result.rows[0].updated_at
  };
};

module.exports = {
  getCycleForDate,
  upsertCycle
};