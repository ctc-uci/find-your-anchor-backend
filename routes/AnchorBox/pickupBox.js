const express = require('express');

const pickupBoxRouter = express();
const { db } = require('../../config');

pickupBoxRouter.use(express.json());

// move box from under review to evaluated (approved box)
pickupBoxRouter.put('/approved', async (req, res) => {
  try {
    const boxID = req.body.box_id;
    const approvedBoxes = await db.query(
      'UPDATE "Anchor_Box" SET under_review = false, evaluated = true WHERE box_id = $1',
      [boxID],
    );
    res.status(200).send(approvedBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// move box from under review to evaluated (rejected box)
pickupBoxRouter.put('/rejected', async (req, res) => {
  try {
    const boxID = req.body.box_id;
    const rejectedBoxes = await db.query(
      'UPDATE "Anchor_Box" SET under_review = false, evaluated = true WHERE box_id = $1',
      [boxID],
    );
    res.status(200).send(rejectedBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// // move box from under review to pending
// pickupBoxRouter.put('/updatePending', async (req, res) => {
//   try {
//     const boxID = req.body.box_id;
//     const rejectedBoxes = await db.query(
//       'UPDATE "Anchor_Box" SET under_review = false AND pending_changes = true WHERE box_id = $1',
//       [boxID],
//     );
//     res.status(200).send(rejectedBoxes);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send(err.message);
//   }
// });

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
