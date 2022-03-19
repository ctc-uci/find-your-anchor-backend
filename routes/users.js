// Routes relating to accounts here
const express = require('express');

const userRouter = express();
const admin = require('../firebase');
const { db } = require('../config');

userRouter.use(express.json());

const SQLQueries = {
  GetAllUsers: `SELECT * FROM "Users"`,
  GetSpecificUserByUserId: 'SELECT * FROM "Users" WHERE user_id = $1',
  GetSpecificUserByEmail: 'SELECT * FROM "Users" WHERE email = $1',
  DeleteUser: 'DELETE FROM "Users" WHERE user_id = $1',
  CreateUser: 'INSERT INTO "Users" (first_name, last_name, email, user_id) VALUES ($1, $2, $3, $4)',
  UpdateUser: 'UPDATE "Users" SET first_name = $1, last_name = $2 WHERE user_id = $3',
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
    const user = await db.query(SQLQueries.GetAllUsers);
    res.send({
      account: user.rows,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a specific user by ID
userRouter.get('/userId/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric

    const user = await db.query(SQLQueries.GetSpecificUserByUserId, [userId]);
    res.send({
      user: user.rows[0],
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Gets a specific user by email
userRouter.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await db.query(SQLQueries.GetSpecificUserByEmail, [email]);
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
    await db.query(SQLQueries.DeleteUser, [userId]);

    res.status(200).send(`Deleted user with ID: ${userId}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Add user to database
userRouter.post('/create', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = await admin.auth().createUser({
      email,
      emailVerified: true,
      password,
    });

    const newUser = await db.query(SQLQueries.CreateUser + SQLQueries.Return, [
      firstName,
      lastName,
      email,
      user.uid,
    ]);

    res.status(200).send({
      newUser: newUser.rows[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add user to database
userRouter.put('/:userId', async (req, res) => {
  try {
    const { firstName, lastName, userId } = req.body;
    isAlphaNumeric(userId); // ID must be alphanumeric
    const newUser = await db.query(SQLQueries.UpdateUser + SQLQueries.Return, [
      firstName,
      lastName,
      userId,
    ]);
    res.status(200).send({
      newUser: newUser.rows[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = userRouter;
