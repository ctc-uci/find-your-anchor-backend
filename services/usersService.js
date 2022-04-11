const db = require('../config');

const getAllUsers = async () => {
  let res = null;
  try {
    res = await db.query(`SELECT * FROM "Users"`);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getUserByUserId = async (userId) => {
  let res = null;
  try {
    res = await db.query(`SELECT * FROM "Users" WHERE user_id = $1`, [userId]);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getUserByEmail = async (email) => {
  let res = null;
  try {
    res = await db.query(`SELECT * FROM "Users" WHERE email = $1`, [email]);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const deleteUser = async (userId) => {
  let res = null;
  try {
    res = await db.query(`DELETE FROM "Users" WHERE user_id = $1`, [userId]);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const createUser = async (firstName, lastName, email, userId) => {
  let res = null;
  try {
    res = await db.query(
      `INSERT INTO "Users" (first_name, last_name, email, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [firstName, lastName, email, userId],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const updateUser = async (firstName, lastName, userId) => {
  let res = null;
  try {
    res = await db.query(
      `UPDATE "Users" SET first_name = $1, last_name = $2 WHERE user_id = $3 RETURNING *`,
      [firstName, lastName, userId],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

module.exports = {
  getAllUsers,
  getUserByUserId,
  getUserByEmail,
  deleteUser,
  createUser,
  updateUser,
};
