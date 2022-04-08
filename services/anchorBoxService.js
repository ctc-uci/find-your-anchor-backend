const db = require('../config');

const getAnchorBoxesByLocation = async (zipCode, country) => {
  let res = null;
  try {
    res = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE zip_code = $1 AND country = $2 AND show_on_map = TRUE ORDER BY box_id',
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
      `SELECT * FROM "Anchor_Box"
      WHERE box_id = $1`,
      [id],
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

const deleteAnchorBox = async (boxID) => {
  let res = null;
  try {
    res = await db.query('DELETE FROM "Anchor_Box" WHERE box_id = $1 RETURNING *;', [boxID]);
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const updateAnchorBox = async (boxID, showOnMap) => {
  let res = null;
  try {
    res = await db.query(
      'UPDATE "Anchor_Box" SET show_on_map = $2 WHERE box_id = $1 RETURNING *;',
      [boxID, showOnMap],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getAllAnchorBoxesOnMap = async () => {
  let res = null;
  try {
    res = await db.query(
      `SELECT * FROM "Anchor_Box"
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND zip_code IS NOT NULL AND country IS NOT NULL AND show_on_map=TRUE`,
    );
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
      WHERE show_on_map=TRUE AND latitude IS NOT NULL AND longitude IS NOT NULL AND country IS NOT NULL AND zip_code IS NOT NULL
      GROUP BY zip_code, country, latitude, longitude`,
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getBoxesForSearch = async (query) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT latitude as lat, longitude as lon, box_id as display_name, zip_code, country FROM "Anchor_Box" WHERE box_id LIKE '%' || $1 || '%'
      AND latitude IS NOT NULL AND longitude IS NOT NULL`,
      [query],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

module.exports = {
  findBoxId,
  createAnchorBox,
  deleteAnchorBox,
  getAnchorBoxesByLocation,
  updateAnchorBox,
  getAllAnchorBoxesOnMap,
  getAllLocationInfo,
  getBoxesForSearch,
};
