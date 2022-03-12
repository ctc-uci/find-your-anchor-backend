const express = require('express');
const {
  getBoxByID,
  getBoxesWithStatusOrPickup,
  updateBox,
  approveBoxInBoxHistory,
  copyBoxInfoToAnchorBox,
  addBox,
} = require('../services/boxHistoryService');
const { findBoxId } = require('../services/boxFormService');

const boxRouter = express();
boxRouter.use(express.json());

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

// Adds a box to the Box History table
boxRouter.post('/', async (req, res) => {
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
    const approvedBox = await approveBoxInBoxHistory(boxID);
    await copyBoxInfoToAnchorBox(
      approvedBox[0].message,
      approvedBox[0].zip_code,
      approvedBox[0].picture,
      approvedBox[0].general_location,
      approvedBox[0].date,
      approvedBox[0].launched_organically,
      approvedBox[0].box_id,
    );
    res.status(200).send('Successfully approved box');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = boxRouter;
