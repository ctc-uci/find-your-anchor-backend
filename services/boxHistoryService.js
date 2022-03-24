const db = require('../config');

const getTransactionByID = async (transactionID) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT * FROM "Box_History"
      WHERE transaction_id = $1`,
      [transactionID],
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
        ${pickup ? 'AND pickup = $(pickup)' : ''}
      ORDER BY
        pickup, box_id;`,
      { status, pickup },
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const updateBox = async (
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
) => {
  let res = null;
  try {
    res = await db.query(
      `UPDATE "Box_History" SET
        box_id = $(boxID)
        ${status !== undefined ? ', status = $(status)' : ''}
        ${approved !== undefined ? ', approved = $(approved)' : ''}
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
        transaction_id = $(transactionID)
      RETURNING *`,
      {
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
      },
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const approveTransactionInBoxHistory = async (id) => {
  let res = null;
  try {
    res = await db.query(
      `UPDATE "Box_History"
      SET approved = TRUE, status = 'evaluated'
      WHERE transaction_id = $1
      RETURNING *;`,
      [id],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const copyTransactionInfoToAnchorBox = async (
  message,
  zipCode,
  picture,
  generalLocation,
  date,
  launchedOrganically,
  boxID,
  latitude,
  longitude,
) => {
  let res = null;
  try {
    res = await db.query(
      `UPDATE "Anchor_Box"
      SET message = $1, zip_code = $2,
        picture = $3, general_location = $4,
        date=$5, launched_organically=$6, latitude=$8, longitude=$9, show_on_map=TRUE
      WHERE
        box_id = $7`,
      [
        message,
        zipCode,
        picture,
        generalLocation,
        date,
        launchedOrganically,
        boxID,
        latitude,
        longitude,
      ],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getHistoryOfBox = async (boxID) => {
  let res = null;
  try {
    res = await db.query(
      'SELECT * FROM "Box_History" WHERE status = \'evaluated\' AND approved = TRUE AND box_id = $1 AND pickup = FALSE ORDER BY date DESC',
      [boxID],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

module.exports = {
  getTransactionByID,
  getHistoryOfBox,
  getBoxesWithStatusOrPickup,
  updateBox,
  approveTransactionInBoxHistory,
  copyTransactionInfoToAnchorBox,
};
