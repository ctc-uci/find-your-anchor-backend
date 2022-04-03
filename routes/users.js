// Routes relating to accounts here
const express = require('express');

const userRouter = express();
const admin = require('../firebase');
const {
  getUserByUserId,
  getUserByEmail,
  deleteUser,
  createUser,
  updateUser,
} = require('../services/usersService');

userRouter.use(express.json());

const isAlphaNumeric = (value) => {
  if (!/^[0-9a-zA-Z]+$/.test(value)) {
    throw new Error('User ID must be alphanumeric');
  }
};

// Get a specific user by ID
userRouter.get('/userId/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric

    const user = await getUserByUserId(userId);
    res.send({
      user: user[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Gets a specific user by email
userRouter.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await getUserByEmail(email);
    res.send({
      user: user[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
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
    await deleteUser(userId);

    res.status(200).send(`Deleted user with ID: ${userId}`);
  } catch (err) {
    res.status(500).send(err.message);
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

    const newUser = await createUser(firstName, lastName, email, user.uid);

    res.status(200).send({
      newUser: newUser[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Edit user in database
userRouter.put('/:userId', async (req, res) => {
  try {
    const { firstName, lastName, userId } = req.body;
    isAlphaNumeric(userId); // ID must be alphanumeric
    const newUser = await updateUser(firstName, lastName, userId);
    res.status(200).send({
      newUser: newUser[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = userRouter;
