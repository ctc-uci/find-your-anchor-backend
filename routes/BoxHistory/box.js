const express = require('express');

const boxRouter = express();
const pgp = require('pg-promise')({});
const { db } = require('../../config');

const cn = `postgresql://${process.env.REACT_APP_DATABASE_USER}:${process.env.REACT_APP_DATABASE_PASSWORD}@${process.env.REACT_APP_DATABASE_HOST}:${process.env.REACT_APP_DATABASE_PORT}/${process.env.REACT_APP_DATABASE_NAME}?ssl=true`; // For pgp

const database = pgp(cn);

boxRouter.use(express.json());

// update status of pick up box
boxRouter.put('/relocationBoxes/update', async (req, res) => {
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
      dropOffMethod,
    } = req.body;
    const response = await database.query(
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
      ${dropOffMethod !== undefined ? ', drop_off_method = $(dropOffMethod)' : ''}
      WHERE
        box_id = $(boxID)
      RETURNING *`,
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
        dropOffMethod,
      },
    );
    res.status(200).send(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all boxes under a single status
boxRouter.get('/getBoxes', async (req, res) => {
  try {
    let { status, pickup } = req.query;
    status = status === undefined ? '' : status;
    pickup = pickup === undefined ? '' : pickup;
    const allBoxes = await database.query(
      `SELECT * FROM "Box_History" WHERE
        ($(status) = '' OR status = $(status))
      ${pickup ? 'AND pickup = $(pickup)' : ''}`,
      {
        status,
        pickup,
      },
    );

    res.status(200).send(allBoxes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get a box
boxRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const box = await db.query('SELECT * FROM "Box_History" WHERE box_id = $1', [id]);
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
      'UPDATE "Anchor_Box" SET message = $1, zip_code = $2, picture = $3, general_location = $4, date=$5 WHERE box_id = $6',
      [
        toCopy.rows[0].message,
        toCopy.rows[0].zip_code,
        toCopy.rows[0].picture,
        toCopy.rows[0].general_location,
        toCopy.rows[0].date,
        toCopy.rows[0].box_id,
      ],
    );
    res.status(200).send('Successfully approved box');
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = boxRouter;
