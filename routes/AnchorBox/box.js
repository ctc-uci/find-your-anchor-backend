const express = require('express');

const boxRouter = express();
const { db } = require('../../config');

boxRouter.use(express.json());

// update status of pick up box
boxRouter.put('/updateStatus', async (req, res) => {
  try {
    const { status, boxID } = req.params;
    const approvedBoxes = await db.query(
      'UPDATE "Box_History" SET status = $1 WHERE box_id = $2 RETURNING *',
      [status, boxID],
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
    const { status, pickup } = req.query;
    const allBoxes = await db.query(
      'SELECT * FROM "Box_History" WHERE status = $1 AND (pickup = null OR pickup = $2)',
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

boxRouter.put('/approveBox', async (req, res) => {
  try {
    const { boxID } = req.body;
    const toCopy = await db.query(
      'UPDATE "Box_History" SET approved = TRUE, status = \'evaluated\' WHERE box_id = $1 RETURNING *',
      [boxID],
    );
    await db.query(
      'UPDATE "Anchor_Box" SET message = $1, zip_code = $2, picture = $3, general_location = $4 WHERE box_id = $5',
      [
        toCopy.rows[0].message,
        toCopy.rows[0].zip_code,
        toCopy.rows[0].picture,
        toCopy.rows[0].general_location,
        toCopy.rows[0].box_id,
      ],
    );
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = boxRouter;
