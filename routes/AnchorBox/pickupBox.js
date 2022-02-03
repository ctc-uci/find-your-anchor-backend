const express = require('express');

const pickupBoxRouter = express();
const { db } = require('../../config');

pickupBoxRouter.use(express.json());

// get all pickup boxes
pickupBoxRouter.get('/', async (req, res) => {
  try {
    console.log('hello world');
    console.log(db);
    const allBoxes = await db.query('SELECT * FROM "Anchor_Box";');
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
    const box = await db.query('SELECT * FROM "Anchor_Box" WHERE box_id = $1', [id]);
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
