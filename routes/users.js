// Routes relating to accounts here
const express = require('express');

const userRouter = express();
const admin = require('../firebase');
const pool = require('../config');

userRouter.use(express.json());

const SQLQueries = {
  GetAllUsers: `SELECT * FROM "Users"`,
  GetSpecificUser: 'SELECT * FROM "Users" WHERE user_id = $1',
  DeleteUser: 'DELETE FROM "Users" WHERE user_id = $1',
  CreateUser: 'INSERT INTO "Users" (email, user_id) VALUES ($1, $2)',
  Return: ' RETURNING *',
};

const isAlphaNumeric = (value) => {
  if (!/^[0-9a-zA-Z]+$/.test(value)) {
    throw new Error('User ID must be alphanumeric');
  }
};

// Get all users
userRouter.get('/', async (req, res) => {
  try {
    const user = await pool.query(SQLQueries.GetAllUsers);
    res.send({
      account: user.rows,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a specific user by ID
userRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric

    const user = await pool.query(SQLQueries.GetSpecificUser, [userId]);
    res.send({
      user: user.rows[0],
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete a specific user by ID, both in Firebase and NPO DB
userRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric

    // Firebase delete
    await admin.auth().deleteUser(userId);
    // DB delete
    await pool.query(SQLQueries.DeleteUser, [userId]);

    res.status(200).send(`Deleted user with ID: ${userId}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Add user to database
userRouter.post('/create', async (req, res) => {
  try {
    const { email, userId } = req.body;
    isAlphaNumeric(userId); // ID must be alphanumeric

    const newUser = await pool.query(SQLQueries.CreateUser + SQLQueries.Return, [email, userId]);

    res.status(200).send({
      newUser: newUser.rows[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = userRouter;
