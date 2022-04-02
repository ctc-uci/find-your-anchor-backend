const express = require('express');

const adminInviteRouter = express();
const {
  addAdminInvite,
  getAdminInvite,
  deleteAdminInvite,
} = require('../services/adminInviteService');

adminInviteRouter.use(express.json());

adminInviteRouter.post('/', async (req, res) => {
  const { email, inviteId } = req.body;
  try {
    const admin = await addAdminInvite(email, inviteId);
    res.status(200).send({
      admin: admin[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get a specific admin by invite ID
adminInviteRouter.get('/:inviteId', async (req, res) => {
  try {
    const { inviteId } = req.params;
    const admin = await getAdminInvite(inviteId);
    res.status(200).send({
      admin: admin[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete an admin invite
adminInviteRouter.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    await deleteAdminInvite(email);
    res.status(200).send(`Deleted user with email ${email}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = adminInviteRouter;
