const express = require('express');

const boxHistoryRouter = express();
const {
  updateBox,
  addBox,
  getTransactionByID,
  getBoxesWithStatusOrPickup,
  approveTransactionInBoxHistory,
  copyTransactionInfoToAnchorBox,
  getLatLongOfBox,
  getHistoryOfBox,
  deleteBox,
  deleteTransaction,
  getMostRecentTransaction,
  getBoxCountUnderStatus,
} = require('../services/boxHistoryService');
const { findBoxId } = require('../services/anchorBoxService');
const verifyToken = require('../services/authService');

boxHistoryRouter.use(express.json());

// update status of pick up box
boxHistoryRouter.put('/update', verifyToken, async (req, res) => {
  try {
    const {
      status,
      approved,
      boxID,
      transactionID,
      boxHolderName,
      boxHolderEmail,
      zipCode,
      country,
      generalLocation,
      message,
      changesRequested,
      rejectionReason,
      messageStatus,
      launchedOrganically,
      imageStatus,
      admin,
    } = req.body;
    const response = await updateBox(
      status,
      approved,
      boxID,
      transactionID,
      boxHolderName,
      boxHolderEmail,
      zipCode,
      country,
      generalLocation,
      message,
      changesRequested,
      rejectionReason,
      messageStatus,
      launchedOrganically,
      imageStatus,
      admin,
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
      country,
      date,
      launchedOrganically,
      imageStatus,
      verificationPicture,
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
      country,
      date,
      launchedOrganically,
      imageStatus,
      verificationPicture,
    );
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get all boxes that fulfill either the status requirement or pickup requirement (or both)
boxHistoryRouter.get('/', async (req, res) => {
  try {
    let { status } = req.query;
    const { pageIndex, pageSize } = req.query;
    status = status === undefined ? '' : status;
    const allBoxes = await getBoxesWithStatusOrPickup(status, pageIndex, pageSize);
    res.status(200).send(allBoxes);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get box count of boxes under a status.
boxHistoryRouter.get('/boxCount', async (req, res) => {
  try {
    let { status } = req.query;
    const { pageSize } = req.query;
    status = status === undefined ? '' : status;
    const boxCount = await getBoxCountUnderStatus(status, pageSize);
    res.status(200).send(boxCount);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

boxHistoryRouter.get('/latLong', async (req, res) => {
  try {
    const { zipCode, country } = req.query;
    const response = getLatLongOfBox(zipCode, country);
    res.status(200).send(response);
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
boxHistoryRouter.put('/approveBox', verifyToken, async (req, res) => {
  try {
    const { transactionID, latitude, longitude, isMostRecentDate } = req.body;
    const approvedBox = await approveTransactionInBoxHistory(transactionID);
    if (isMostRecentDate) {
      await copyTransactionInfoToAnchorBox(
        approvedBox[0].message_status === 'rejected' ? null : approvedBox[0].message,
        approvedBox[0].zip_code,
        approvedBox[0].country,
        approvedBox[0].image_status === 'rejected' ? null : approvedBox[0].picture,
        approvedBox[0].general_location,
        approvedBox[0].date,
        approvedBox[0].launched_organically,
        approvedBox[0].box_id,
        latitude,
        longitude,
        approvedBox[0].boxholder_name,
        approvedBox[0].boxholder_email,
        approvedBox[0].pickup,
      );
    }
    res.status(200).send('Successfully approved box');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

boxHistoryRouter.delete('/box/:boxID', verifyToken, async (req, res) => {
  try {
    const { boxID } = req.params;
    await deleteBox(boxID);
    res.status(200).send(`Successfully deleted box ${boxID}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

boxHistoryRouter.delete('/transaction/:transactionID', verifyToken, async (req, res) => {
  try {
    const { transactionID } = req.params;
    await deleteTransaction(transactionID);
    res.status(200).send(`Successfully deleted transaction ${transactionID}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

boxHistoryRouter.get('/mostRecentTransaction/:boxID', async (req, res) => {
  try {
    const { boxID } = req.params;
    const mostRecentTransaction = await getMostRecentTransaction(boxID);
    res.status(200).send(mostRecentTransaction);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = boxHistoryRouter;
