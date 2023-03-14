/* eslint-disable*/
const countryCodeLookup = require('country-code-lookup');
const axios = require('axios');
const db = require('../config');
require('dotenv').config('..');

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

// This returns pageSize boxes of a certain status
const getBoxesWithStatusOrPickup = async (status, pageIndex, pageSize) => {
  let res = null;
  const offset = (pageIndex - 1) * pageSize;
  try {
    if (status === 'evaluated') {
      res = await db.query(
        `SELECT *
        FROM "Box_History" boxHistory1
        INNER JOIN (
            SELECT box_id, max(transaction_id) as MaxId
            FROM "Box_History"
            WHERE
              status='evaluated'
            GROUP BY box_id
        ) boxHistory2 ON boxHistory1.box_id = boxHistory2.box_id AND boxHistory1.transaction_id = boxHistory2.MaxId

        ORDER BY
          pickup, boxHistory1.box_id
        LIMIT $(pageSize) OFFSET $(offset);`,
        { pageSize, offset },
      );
    } else {
      res = await db.query(
        `SELECT * FROM "Box_History"
        WHERE
          ($(status) = '' OR status = $(status))
        ORDER BY
          pickup, box_id
        LIMIT $(pageSize) OFFSET $(offset);`,
        { status, pageSize, offset },
      );
    }
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getBoxCountUnderStatus = async (status, pageSize) => {
  let res = null;
  try {
    if (status === 'evaluated') {
      res = await db.query(
        `SELECT COUNT(DISTINCT box_id)
        FROM "Box_History"
        WHERE
          status='evaluated'`,
        {},
      );
    } else {
      res = await db.query(
        `SELECT COUNT(*) FROM "Box_History"
        WHERE
          ($(status) = '' OR status = $(status))`,
        { status },
      );
    }
  } catch (err) {
    throw new Error(err.message);
  }
  const totalNumberOfPages = Math.ceil(parseInt(res[0].count, 10) / pageSize);
  return [{ totalNumberOfPages }];
};

const getLatLongOfBox = async (zipCode, country) => {
  const res = await axios.get(
    `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=${country}&format=json`,
  );
  return res;
};

const getLatLongOfBoxes = async (locations) => {
  let results = [];
  // Split this into chunks because Positionstack can't handle when batch is too big
  // const chunkSize = 5;
  // for (let i = 0; i < locations.length; i += chunkSize) {
  //   try {
  //     const chunk = locations.slice(i, i + chunkSize);
  //     const requests = chunk.map(({ zipCode, country }) => axios.get(`http://api.positionstack.com/v1/forward?access_key=${process.env.GEOCODER_API_KEY}&query=${encodeURIComponent(zipCode)}&country=${encodeURIComponent(country)}&limit=1`));
  //     // do whatever
  //     // eslint-disable-next-line no-await-in-loop
  //     const tempResults = await Promise.all(requests);
  //     results = results.concat(tempResults.map(result => result.data.data.length ? { latitude: result.data.data[0].latitude, longitude: result.data.data[0].longitude } : { latitude: null, longitude: null }))
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // const start = new Date();
  for (const { zipCode, country } of locations) {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=${country}&format=json`,
      );
      results.push(
        res.data.length
          ? { latitude: res.data[0]?.lat, longitude: res.data[0]?.lon }
          : { latitude: null, longitude: null },
      );
    } catch (err) {
      console.log(err.message);
    }
  }
  return results;
};

const getMostRecentTransaction = async (boxId) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT *
        FROM "Box_History" boxHistory1
        INNER JOIN (
            SELECT box_id, TO_CHAR(max(TO_DATE(date, 'MM/DD/YYYY')), 'MM/DD/YYYY') as mostRecentDate
            FROM "Box_History"
            WHERE status = 'evaluated' AND approved = TRUE
            GROUP BY box_id
        ) boxHistory2 ON boxHistory1.box_id = boxHistory2.box_id AND boxHistory1.date = boxHistory2.mostRecentDate
        WHERE
          boxHistory1.box_id = $1`,
      [boxId],
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
        boxholder_name=$10, boxholder_email=$11, pickup = $13
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
      `SELECT * FROM "Box_History" WHERE status = 'evaluated' AND approved = TRUE AND box_id = $1 ORDER BY TO_DATE(date, 'MM/DD/YYYY') DESC, transaction_id DESC`,
      [boxID],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const addBox = async (
  boxID,
  approved,
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
        approved: approved !== undefined,
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

const addBoxHistories = async (formDatas) => {
  let res = null;
  try {
    let multiBoxesQuery = '';
    formDatas.forEach(
      ({
        boxNumber,
        message,
        zipCode,
        picture,
        boxLocation,
        country,
        date,
        launchedOrganically,
      }) => {
        const countryCode = countryCodeLookup.byCountry(country).iso2;
        multiBoxesQuery += `INSERT INTO "Box_History"
        (box_id, message,
        zip_code, picture, general_location,
        date, launched_organically, country, approved, status)
        VALUES(
        ${boxNumber || `''`},
        ${message || `''`},
        ${`'${zipCode}'`},
        ${picture || `''`},
        ${boxLocation || `''`},
        ${`'${date}'`},
        ${launchedOrganically},
        ${`'${countryCode}'`},
        TRUE,
        'evaluated');
      `;
      },
    );
    res = await db.multi(multiBoxesQuery);
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

const deleteTransaction = async (transactionID) => {
  let res = null;
  try {
    res = await db.query('DELETE FROM "Box_History" WHERE transaction_id = $1', [transactionID]);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

module.exports = {
  getTransactionByID,
  getHistoryOfBox,
  getBoxesWithStatusOrPickup,
  getLatLongOfBox,
  getLatLongOfBoxes,
  updateBox,
  addBox,
  addBoxHistories,
  approveTransactionInBoxHistory,
  copyTransactionInfoToAnchorBox,
  deleteBox,
  deleteTransaction,
  getMostRecentTransaction,
  getBoxCountUnderStatus,
};
