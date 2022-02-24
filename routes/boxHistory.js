const express = require('express');

const boxRouter = express();
const pgp = require('pg-promise')({});
const { db } = require('../config');

const cn = `postgresql://${process.env.REACT_APP_DATABASE_USER}:${process.env.REACT_APP_DATABASE_PASSWORD}@${process.env.REACT_APP_DATABASE_HOST}:${process.env.REACT_APP_DATABASE_PORT}/${process.env.REACT_APP_DATABASE_NAME}?ssl=true`; // For pgp

const database = pgp(cn);

boxRouter.use(express.json());

const SQLQueries = {
  UpdateBox: (
    status,
    boxHolderName,
    boxHolderEmail,
    zipCode,
    generalLocation,
    message,
    changesRequested,
    rejectionReason,
    messageStatus,
    launchedOrganically,
  ) =>
    `UPDATE "Box_History" SET
        box_id = $(boxID)
        ${status !== undefined ? ', status = $(status)' : ''}
        ${boxHolderName !== undefined ? ', boxholder_name = $(boxHolderName)' : ''}
        ${boxHolderEmail !== undefined ? ', boxholder_email = $(boxHolderEmail)' : ''}
        ${zipCode !== undefined ? ', zip_code = $(zipCode)' : ''}
        ${generalLocation !== undefined ? ', general_location = $(generalLocation)' : ''}
        ${message !== undefined ? ', message = $(message)' : ''}
        ${changesRequested !== undefined ? ', changes_requested = $(changesRequested)' : ''}
        ${rejectionReason !== undefined ? ', rejection_reason = $(rejectionReason)' : ''}
        ${messageStatus !== undefined ? ', message_status = $(messageStatus)' : ''}
        ${
          launchedOrganically !== undefined ? ', launched_organically = $(launchedOrganically)' : ''
        }
        WHERE
          box_id = $(boxID)`,
  Return: 'Returning *',
  GetBoxes: (pickup) =>
    `SELECT * FROM "Box_History" WHERE
      ($(status) = '' OR status = $(status))
      ${pickup ? 'AND pickup = $(pickup)' : ''}`,
  GetBox: 'SELECT * FROM "Box_History" WHERE box_id = $1',
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
    const response = await database.query(
      SQLQueries.UpdateBox(
        status,
        boxHolderName,
        boxHolderEmail,
        zipCode,
        generalLocation,
        message,
        changesRequested,
        rejectionReason,
        messageStatus,
        launchedOrganically,
      ) + SQLQueries.Return,
      {
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
      },
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
    const allBoxes = await database.query(SQLQueries.GetBoxes(pickup), { status, pickup });
    res.status(200).send(allBoxes);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get a box
boxRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const box = await db.query(SQLQueries.GetBox, [id]);
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
