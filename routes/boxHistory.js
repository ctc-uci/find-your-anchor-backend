const express = require('express');

const boxHistoryRouter = express();
const {
  updateBox,
  addBox,
  getTransactionByID,
  getBoxesWithStatusOrPickup,
  approveTransactionInBoxHistory,
  copyTransactionInfoToAnchorBox,
  getHistoryOfBox,
} = require('../services/boxHistoryService');
const { findBoxId } = require('../services/anchorBoxService');

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
      imageStatus,
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
      imageStatus,
    );
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Adds a box to the Box History table
boxHistoryRouter.post('/', async (req, res) => {
  try {
    const {
      boxID,
      message,
      boxholderEmail,
      boxholderName,
      generalLocation,
      picture,
      status,
      pickup,
      changesRequested,
      rejectionReason,
      messageStatus,
      zipcode,
      date,
      launchedOrganically,
      imageStatus,
    } = req.body;
    // Check for required parameters
    const requiredParams = ['boxID', 'boxholderEmail', 'zipcode', 'date'];
    const missingParams = !requiredParams.every((param) =>
      Object.prototype.hasOwnProperty.call(req.body, param),
    );
    if (missingParams) return res.status(400).send('Missing a required parameter');

    // Check if box exists in anchor box
    const matchingBox = await findBoxId(boxID);
    if (matchingBox.length === 0) return res.status(400).send('Could not a find box with that ID');

    const response = await addBox(
      boxID,
      message,
      boxholderEmail,
      boxholderName,
      generalLocation,
      picture,
      status,
      pickup,
      changesRequested,
      rejectionReason,
      messageStatus,
      zipcode,
      date,
      launchedOrganically,
      imageStatus,
    );
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send(err.message);
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
boxHistoryRouter.get('/transaction/:transactionID', async (req, res) => {
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

// Gets a box's history
boxHistoryRouter.get('/history/:boxID', async (req, res) => {
  const { boxID } = req.params;
  try {
    const history = await getHistoryOfBox(boxID);
    res.status(200).send(history);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Approves a row in box history and then copies the relevant box information into Anchor Box
boxHistoryRouter.put('/approveBox', async (req, res) => {
  try {
    const { transactionID, latitude, longitude } = req.body;
    const approvedBox = await approveTransactionInBoxHistory(transactionID);
    await copyTransactionInfoToAnchorBox(
      approvedBox[0].message,
      approvedBox[0].zip_code,
      approvedBox[0].picture,
      approvedBox[0].general_location,
      approvedBox[0].date,
      approvedBox[0].launched_organically,
      approvedBox[0].box_id,
      latitude,
      longitude,
      approvedBox[0].boxholder_name,
      approvedBox[0].boxholder_email,
    );
    res.status(200).send('Successfully approved box');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = boxHistoryRouter;
