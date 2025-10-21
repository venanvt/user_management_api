import pool from '../config/db.js';

// --- Create User ---
export const createUser = async ({ username, email, password, role = 'user' }) => {
  const q = `
    INSERT INTO users (username, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, role, avatar_url, created_at, updated_at
  `;
  const { rows } = await pool.query(q, [username, email, password, role]);
  return rows[0];
};

// --- Find User by Email ---
export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

// --- Find User by ID ---
export const findUserById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
};

// --- Get All Users ---
export const getAllUsers = async () => {
  const { rows } = await pool.query(
    'SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users'
  );
  return rows;
};

// --- Update User by ID ---
export const updateUserById = async (id, username, email) => {
  const q = `
    UPDATE users
    SET 
      username = COALESCE($1, username),
      email = COALESCE($2, email),
      updated_at = NOW()
    WHERE id = $3
    RETURNING id, username, email, role, avatar_url, updated_at
  `;
  const { rows } = await pool.query(q, [username, email, id]);
  return rows[0];
};

// --- Delete User by ID ---
export const deleteUserById = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};