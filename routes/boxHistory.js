const express = require('express');
const { db } = require('../config');
const {
  getBoxByID,
  getBoxesWithStatusOrPickup,
  updateBox,
} = require('../services/boxHistoryService');

const boxRouter = express();
boxRouter.use(express.json());

const SQLQueries = {
  Return: 'Returning *',
  CopyBoxInfoToAnchorBox:
    'UPDATE "Anchor_Box" SET message = $1, zip_code = $2, picture = $3, general_location = $4, date=$5, launched_organically=$6 WHERE box_id = $7',
  ApproveBoxInBoxHistory:
    'UPDATE "Box_History" SET approved = TRUE, status = \'evaluated\' WHERE box_id = $1',
};

// update status of pick up box
boxRouter.put('/update', async (req, res) => {
  try {
    const {
      status,
      boxID,
      boxHolderName,
      boxHolderEmail,
      zipCode,
      generalLocation,
      message,
      changesRequested,
      rejectionReason,
      messageStatus,
      launchedOrganically,
    } = req.body;
    const response = await updateBox(
      status,
      boxID,
      boxHolderName,
      boxHolderEmail,
      zipCode,
      generalLocation,
      message,
      changesRequested,
      rejectionReason,
      messageStatus,
      launchedOrganically,
    );
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get all boxes that fulfill either the status requirement or pickup requirement (or both)
boxRouter.get('/', async (req, res) => {
  try {
    let { status, pickup } = req.query;
    status = status === undefined ? '' : status;
    pickup = pickup === undefined ? '' : pickup;
    const allBoxes = await getBoxesWithStatusOrPickup(status, pickup);
    res.status(200).send(allBoxes);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get a box by id
boxRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const box = await getBoxByID(id);
    if (box.length === 0) {
      res.status(400).send(box);
    } else {
      res.status(200).send(box);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Approves a row in box history and then copies the relevant box information into Anchor Box
boxRouter.put('/approveBox', async (req, res) => {
  try {
    const { boxID } = req.body;
    const approvedBox = await db.query(SQLQueries.ApproveBoxInBoxHistory + SQLQueries.Return, [
      boxID,
    ]);
    await db.query(SQLQueries.CopyBoxInfoToAnchorBox, [
      approvedBox.rows[0].message,
      approvedBox.rows[0].zip_code,
      approvedBox.rows[0].picture,
      approvedBox.rows[0].general_location,
      approvedBox.rows[0].date,
      approvedBox.rows[0].launched_organically,
      approvedBox.rows[0].box_id,
    ]);
    res.status(200).send('Successfully approved box');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = boxRouter;
