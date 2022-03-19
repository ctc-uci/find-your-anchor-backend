const express = require('express');

const adminInviteRouter = express();
const { db } = require('../config');

adminInviteRouter.use(express.json());

adminInviteRouter.post('/', async (req, res) => {
  const { email, inviteId } = req.body;
  try {
    const admin = await db.query(
      'INSERT INTO "Admin_Invite" (email, invite_id, expire_time, valid_invite) VALUES ($1, $2, NOW() + INTERVAL \'7 days\', $3)',
      [email, inviteId, true],
    );
    res.send({
      admin: admin.rows[0],
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a specific admin by invite ID
adminInviteRouter.get('/:inviteId', async (req, res) => {
  try {
    const { inviteId } = req.params;
    const admin = await db.query(
      'SELECT * FROM "Admin_Invite" WHERE invite_id = $1 AND valid_invite = TRUE',
      [inviteId],
    );
    res.send({
      admin: admin.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

module.exports = adminInviteRouter;
