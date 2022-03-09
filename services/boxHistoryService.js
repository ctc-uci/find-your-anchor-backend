const pgp = require('pg-promise')({});

const cn = `postgresql://${process.env.REACT_APP_DATABASE_USER}:${process.env.REACT_APP_DATABASE_PASSWORD}@${process.env.REACT_APP_DATABASE_HOST}:${process.env.REACT_APP_DATABASE_PORT}/${process.env.REACT_APP_DATABASE_NAME}?ssl=true`; // For pgp
const db = pgp(cn);

const getBoxByID = async (id) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT * FROM "Box_History"
      WHERE box_id = $1`,
      [id],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getBoxesWithStatusOrPickup = async (status, pickup) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT * FROM "Box_History"
      WHERE
        ($(status) = '' OR status = $(status))
        ${pickup ? 'AND pickup = $(pickup)' : ''};`,
      { status, pickup },
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const updateBox = async (
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
) => {
  let res = null;
  try {
    res = await db.query(
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
        launchedOrganically,
      },
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const approveBoxInBoxHistory = async (id) => {
  let res = null;
  try {
    res = await db.query(
      `UPDATE "Box_History"
      SET approved = TRUE, status = 'evaluated'
      WHERE box_id = $1
      RETURNING *;`,
      [id],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const copyBoxInfoToAnchorBox = async (
  message,
  zipCode,
  picture,
  generalLocation,
  date,
  launchedOrganically,
  boxID,
) => {
  let res = null;
  try {
    res = await db.query(
      `UPDATE "Anchor_Box"
      SET message = $1, zip_code = $2,
        picture = $3, general_location = $4,
        date=$5, launched_organically=$6
      WHERE
        box_id = $7`,
      [message, zipCode, picture, generalLocation, date, launchedOrganically, boxID],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const addBox = async (
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
) => {
  let res = null;
  try {
    // Check if box exists in anchor box
    const matchingBox = await db.query(
      `
        SELECT box_id FROM "Anchor_Box"
        WHERE box_id = $(boxID);
      `,
      { boxID },
    );
    if (matchingBox.length === 0) return res.status(400).send('Could not a find box with that ID');
    res = await db.query(
      `INSERT INTO "Box_History" (
        box_id, message, boxholder_email, boxholder_name,
        general_location, picture, approved, status,
        pickup, changes_requested, rejection_reason, message_status,
        zip_code, date, launched_organically
      )
      VALUES (
        $(boxID), $(message), $(boxholderEmail), $(boxholderName),
        $(generalLocation), $(picture), $(approved), $(status),
        $(pickup), $(changesRequested), $(rejectionReason), $(messageStatus),
        $(zipcode), $(date), $(launchedOrganically)
      )
      RETURNING *;`,
      {
        boxID,
        message,
        boxholderEmail,
        boxholderName,
        generalLocation,
        picture,
        approved: false,
        status,
        pickup,
        changesRequested,
        rejectionReason,
        messageStatus,
        zipcode,
        date,
        launchedOrganically,
      },
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

module.exports = {
  getBoxByID,
  getBoxesWithStatusOrPickup,
  updateBox,
  approveBoxInBoxHistory,
  copyBoxInfoToAnchorBox,
  addBox,
};
