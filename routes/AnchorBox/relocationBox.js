const express = require('express');

const relocationBoxRouter = express();
const { db } = require('../../config');

relocationBoxRouter.use(express.json());

// get all relocation boxes under review
relocationBoxRouter.get('/underReview', async (req, res) => {
  try {
    const allBoxes = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE pickup = false AND under_review = TRUE',
    );
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all relocation boxes pending
relocationBoxRouter.get('/pending', async (req, res) => {
  try {
    const allBoxes = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE pickup = false AND pending_changes = TRUE',
    );
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all relocation boxes evaluated
relocationBoxRouter.get('/evaluated', async (req, res) => {
  try {
    const allBoxes = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE pickup = false AND evaluated = TRUE',
    );
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all relocation boxes
relocationBoxRouter.get('/', async (req, res) => {
  try {
    console.log('hello world');
    console.log(db);
    const allBoxes = await db.query('SELECT * FROM "Anchor_Box" WHERE pickup = false');
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get a relocation box
relocationBoxRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const box = await db.query('SELECT * FROM "Anchor_Box" WHERE box_id = $1 AND pickup = false', [
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

module.exports = relocationBoxRouter;
