const express = require('express');

const boxHistoryRouter = express();
const {
  updateBox,
  getTransactionByID,
  getBoxesWithStatusOrPickup,
  approveTransactionInBoxHistory,
  copyTransactionInfoToAnchorBox,
} = require('../services/boxHistoryService');

boxHistoryRouter.use(express.json());

// update status of pick up box
boxHistoryRouter.put('/update', async (req, res) => {
  try {
    const {
      status,
      approved,
      boxID,
      transactionID,
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
      approved,
      boxID,
      transactionID,
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
boxHistoryRouter.get('/', async (req, res) => {
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

// get a box
boxHistoryRouter.get('/:transactionID', async (req, res) => {
  const { transactionID } = req.params;
  try {
    const box = await getTransactionByID(transactionID);
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
boxHistoryRouter.put('/approveBox', async (req, res) => {
  try {
    const { transactionID } = req.body;
    const approvedBox = await approveTransactionInBoxHistory(transactionID);
    await copyTransactionInfoToAnchorBox(
      approvedBox.rows[0].message,
      approvedBox.rows[0].zip_code,
      approvedBox.rows[0].picture,
      approvedBox.rows[0].general_location,
      approvedBox.rows[0].date,
      approvedBox.rows[0].launched_organically,
      approvedBox.rows[0].transactionID,
    );
    res.status(200).send('Successfully approved box');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = boxHistoryRouter;
