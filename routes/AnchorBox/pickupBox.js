const express = require('express');

const boxRouter = express();
const { db } = require('../../config');

boxRouter.use(express.json());

// update status of pick up box
boxRouter.put('/updateStatus', async (req, res) => {
  try {
    const boxID = req.body.box_id;
    const { status } = req.body;
    const approvedBoxes = await db.query(
      'UPDATE "Box_History" SET status = $1 WHERE box_id = $2',
      status,
      boxID,
    );
    res.status(200).send(approvedBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all boxes under a single status
boxRouter.get('/getBoxes', async (req, res) => {
  try {
    const { status } = req.body;
    const pickup = req.body.pickup == null ? -1 : req.body.pickup; // If 'pickup' is null, get all boxes
    const allBoxes = await db.query(
      'SELECT * FROM "Box_History" WHERE status = $1, (pickup = -1 OR pickup = $2)',
      [status, pickup],
    );
    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get a pickup box
boxRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const box = await db.query('SELECT * FROM "Box_History" WHERE box_id = $1', [id]);
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

module.exports = boxRouter;
