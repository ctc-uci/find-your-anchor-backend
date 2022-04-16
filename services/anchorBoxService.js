const db = require('../config');

const getAnchorBoxesByLocation = async (zipCode, country) => {
  let res = null;
  try {
    res = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE zip_code = $1 AND country = $2 ORDER BY box_id',
      [zipCode, country],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const findBoxId = async (id) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT box_id FROM "Anchor_Box"
      WHERE box_id = $1`,
      [id.toString()],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const createAnchorBox = async (
  boxNumber,
  message,
  zipCode,
  picture,
  boxLocation,
  date,
  launchedOrganically,
  additionalComments,
) => {
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

const createAnchorBoxes = async (formDatas) => {
  let res = null;
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
        country,
        latitude,
        longitude,
      }) => {
        multiBoxesQuery += `INSERT INTO "Anchor_Box"
        (box_id, message,
        zip_code, picture, general_location,
        date, launched_organically, additional_comments, country, latitude, longitude)
        VALUES(
        ${boxNumber || `''`},
        ${message || `''`},
        ${`'${zipCode}'`},
        ${picture || `''`},
        ${boxLocation || `''`},
        ${`'${date}'`},
        ${launchedOrganically},
        ${additionalComments || `''`},
        ${`'${country}'`},
        ${`'${latitude}'`},
        ${`'${longitude}'`});
      `;
      },
    );
    console.log(multiBoxesQuery);
    res = await db.multi(multiBoxesQuery);
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
  return res;
};

const deleteAnchorBox = async (boxID) => {
  let res = null;
  try {
    res = await db.query('DELETE FROM "Anchor_Box" WHERE box_id = $1 RETURNING *;', [boxID]);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getAllAnchorBoxesOnMap = async () => {
  let res = null;
  try {
    res = await db.query(`SELECT * FROM "Anchor_Box"`);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getAllLocationInfo = async () => {
  let res = null;
  try {
    res = await db.query(
      `SELECT DISTINCT zip_code, country, latitude, longitude, COUNT (box_id) AS box_count FROM "Anchor_Box"
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND country IS NOT NULL
      GROUP BY zip_code, country, latitude, longitude`,
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

module.exports = {
  findBoxId,
  createAnchorBox,
  createAnchorBoxes,
  deleteAnchorBox,
  getAnchorBoxesByLocation,
  getAllAnchorBoxesOnMap,
  getAllLocationInfo,
};
