const pool = require("../config/db");

const mapUserRow = (row) => ({
  id: row.id,
  name: row.full_name,
  username: row.email,
  email: row.email,
  role: row.role,
  status: row.is_active ? "active" : "deactivated",
  lastLogin: "Never",
  twoFA: false,
  password_hash: row.password_hash,
  must_change_password: row.must_change_password, 
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const getAllUsers = async () => {
  const query = `
    SELECT 
      id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows.map(mapUserRow);
};

const getUserById = async (id) => {
  const query = `
    SELECT 
      id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const findByEmail = async (email) => {
  const query = `
    SELECT
      id,
      full_name,
      email,
      password_hash,
      role,
      is_active,
      must_change_password,
      created_at,
      updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const createUser = async ({ name, email, role, passwordHash }) => {
  const query = `
    INSERT INTO users (
      full_name,
      email,
      password_hash,
      role,
      is_active
    )
    VALUES ($1, $2, $3, $4, true)
    RETURNING
      id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      updated_at
  `;
  const values = [name, email, passwordHash, role];
  const result = await pool.query(query, values);
  return mapUserRow(result.rows[0]);
};

const updateUser = async (id, { name, email, role }) => {
  const query = `
    UPDATE users
    SET
      full_name = $1,
      email = $2,
      role = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING
      id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      updated_at
  `;
  const values = [name, email, role, id];
  const result = await pool.query(query, values);
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const updateUserStatus = async (id, isActive) => {
  const query = `
    UPDATE users
    SET
      is_active = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      updated_at
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const resetUserPassword = async (id, passwordHash) => {
  const query = `
    UPDATE users
    SET
      password_hash = $1,
      must_change_password = true,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, full_name, email
  `;
  const result = await pool.query(query, [passwordHash, id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllUsers,
  getUserById,
  findByEmail,
  createUser,
  updateUser,
  updateUserStatus,
  resetUserPassword,
};