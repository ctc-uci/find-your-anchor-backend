const express = require('express');

const pickupBoxRouter = express();
const { db } = require('../../config');

pickupBoxRouter.use(express.json());

// when user pushes arrow button, under_review = false and pending changes = true (put request)
// when user pushes approve or reject, underreview = false exaluated = true
// get all pickup boxes under review, evaluated, pending_changes
// get all relocation boxes under review, evaluated, pending_changes

// get all pickupboxes under review
pickupBoxRouter.get('/underReview', async (req, res) => {
  try {
    const allBoxes = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE pickup = true AND under_review = TRUE',
    );
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all pickupboxes pending
pickupBoxRouter.get('/pending', async (req, res) => {
  try {
    const allBoxes = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE pickup = true AND pending_changes = TRUE',
    );
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all pickupboxes evaluated
pickupBoxRouter.get('/evaluated', async (req, res) => {
  try {
    const allBoxes = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE pickup = true AND evaluated = TRUE',
    );
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all pickup boxes
pickupBoxRouter.get('/', async (req, res) => {
  try {
    const allBoxes = await db.query('SELECT * FROM "Anchor_Box" WHERE pickup = true');
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get a pickup box
pickupBoxRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const box = await db.query('SELECT * FROM "Anchor_Box" WHERE box_id = $1 AND pickup = true', [
      id,
    ]);
    console.log(box.rows);
    console.log(box);
    if (box.length === 0) {
      res.status(400).send(box);
    } else {
      res.status(200).send(box);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = pickupBoxRouter;
