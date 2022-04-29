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
    if (status === 'evaluated') {
      res = await db.query(
        `SELECT *
        FROM "Box_History" boxHistory1
        INNER JOIN (
            SELECT box_id, max(transaction_id) as MaxId
            FROM "Box_History"
            GROUP BY box_id
        ) boxHistory2 ON boxHistory1.box_id = boxHistory2.box_id AND boxHistory1.transaction_id = boxHistory2.MaxId
        WHERE
          status='evaluated'
          ${pickup ? 'AND pickup = $(pickup)' : ''}
        ORDER BY
          pickup, boxHistory1.box_id`,
        { status, pickup },
      );
    } else {
      res = await db.query(
        `SELECT * FROM "Box_History"
        WHERE
          ($(status) = '' OR status = $(status))
          ${pickup ? 'AND pickup = $(pickup)' : ''}
        ORDER BY
          pickup, box_id;`,
        { status, pickup },
      );
    }
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
  country,
  generalLocation,
  message,
  changesRequested,
  rejectionReason,
  messageStatus,
  launchedOrganically,
  imageStatus,
  admin,
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
        ${country !== undefined ? ', country = $(country)' : ''}
        ${generalLocation !== undefined ? ', general_location = $(generalLocation)' : ''}
        ${message !== undefined ? ', message = $(message)' : ''}
        ${changesRequested !== undefined ? ', changes_requested = $(changesRequested)' : ''}
        ${rejectionReason !== undefined ? ', rejection_reason = $(rejectionReason)' : ''}
        ${messageStatus !== undefined ? ', message_status = $(messageStatus)' : ''}
        ${
          launchedOrganically !== undefined ? ', launched_organically = $(launchedOrganically)' : ''
        }
        ${imageStatus !== undefined ? ', image_status = $(imageStatus)' : ''}
        ${admin !== undefined ? ', admin = $(admin)' : ''}
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
        country,
        generalLocation,
        message,
        changesRequested,
        rejectionReason,
        messageStatus,
        launchedOrganically,
        imageStatus,
        admin,
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
  country,
  picture,
  generalLocation,
  date,
  launchedOrganically,
  boxID,
  latitude,
  longitude,
  boxHolderName,
  boxHolderEmail,
  pickup,
) => {
  let res = null;
  try {
    res = await db.query(
      `UPDATE "Anchor_Box"
      SET message = $1, zip_code = $2,
        picture = $3, general_location = $4,
        date=$5, launched_organically=$6, country=$12, latitude=$8, longitude=$9,
        boxholder_name=$10, boxholder_email=$11, pickup = $12
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
        boxHolderName,
        boxHolderEmail,
        country,
        pickup,
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
      'SELECT * FROM "Box_History" WHERE status = \'evaluated\' AND approved = TRUE AND box_id = $1 ORDER BY date DESC',
      [boxID],
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
  country,
  date,
  launchedOrganically,
  imageStatus,
  verificationPicture,
) => {
  let res = null;
  try {
    res = await db.query(
      `INSERT INTO "Box_History" (
        box_id, message, boxholder_email, boxholder_name,
        general_location, picture, approved, status,
        pickup, changes_requested, rejection_reason, message_status,
        zip_code, date, launched_organically, image_status, country, verification_picture
      )
      VALUES (
        $(boxID), $(message), $(boxholderEmail), $(boxholderName),
        $(generalLocation), $(picture), $(approved), $(status),
        $(pickup), $(changesRequested), $(rejectionReason), $(messageStatus),
        $(zipcode), $(date), $(launchedOrganically), $(imageStatus), $(country), $(verificationPicture)
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
        imageStatus,
        country,
        verificationPicture,
      },
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const deleteBox = async (boxID) => {
  let res = null;
  try {
    res = await db.query('DELETE FROM "Box_History" WHERE box_id = $1', [boxID]);
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
  addBox,
  approveTransactionInBoxHistory,
  copyTransactionInfoToAnchorBox,
  deleteBox,
};
