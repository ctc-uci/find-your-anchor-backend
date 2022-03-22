const pgp = require('pg-promise')({});

const cn = `postgresql://${process.env.REACT_APP_DATABASE_USER}:${process.env.REACT_APP_DATABASE_PASSWORD}@${process.env.REACT_APP_DATABASE_HOST}:${process.env.REACT_APP_DATABASE_PORT}/${process.env.REACT_APP_DATABASE_NAME}?ssl=true`; // For pgp
const db = pgp(cn);

const addAdminInvite = async (email, inviteId) => {
  let res = null;
  try {
    res = await db.query(
      'INSERT INTO "Admin_Invite" (email, invite_id, expire_time, valid_invite) VALUES ($1, $2, NOW() + INTERVAL \'7 days\', $3)',
      [email, inviteId, true],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getAdminInvite = async (inviteId) => {
  let res = null;
  try {
    res = await db.query(
      'SELECT * FROM "Admin_Invite" WHERE invite_id = $1 AND valid_invite = TRUE AND NOW() < expire_time',
      [inviteId],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const deleteAdminInvite = async (email) => {
  let res = null;
  try {
    res = await db.query(`DELETE from "Admin_Invite" WHERE email = $1`, [email]);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

module.exports = { addAdminInvite, getAdminInvite, deleteAdminInvite };
