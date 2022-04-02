const db = require('../config');

const findBoxId = async (id) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT box_id FROM "Anchor_Box"
      WHERE box_id = $1`,
      [id],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const createAnchorBox = async ({
  boxNumber,
  message,
  zipCode,
  picture,
  boxLocation,
  date,
  launchedOrganically,
  additionalComments,
}) => {
  let res = null;
  try {
    res = await db.query(
      `INSERT INTO "Anchor_Box"
        (box_id, message,
        zip_code, picture, general_location,
        date, launched_organically, additional_comments)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;`,
      [
        boxNumber,
        message,
        zipCode,
        picture,
        boxLocation,
        date,
        launchedOrganically,
        additionalComments,
      ],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const createMultipleAnchorBoxes = async (formDatas) => {
  try {
    let multiBoxesQuery = ``;
    formDatas.forEach(
      ({
        boxNumber,
        message,
        zipCode,
        picture,
        boxLocation,
        date,
        launchedOrganically,
        additionalComments,
      }) => {
        multiBoxesQuery += `INSERT INTO "Anchor_Box"
        (box_id, message,
        zip_code, picture, general_location,
        date, launched_organically, additional_comments)
        VALUES(
        ${boxNumber || `''`},
        ${message || `''`},
        ${zipCode || `''`},
        ${picture || `''`},
        ${boxLocation || `''`},
        ${date || `''`},
        ${launchedOrganically},
        ${additionalComments || `''`});
      `;
      },
    );
    await db.multi(multiBoxesQuery);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { findBoxId, createAnchorBox, createMultipleAnchorBoxes };
