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
      }) => {
        multiBoxesQuery += `INSERT INTO "Anchor_Box"
        (box_id, message,
        zip_code, picture, general_location,
        date, launched_organically, additional_comments)
        VALUES(
        ${boxNumber || `''`},
        ${message || `''`},
        ${`'${zipCode}'`},
        ${picture || `''`},
        ${boxLocation || `''`},
        ${`'${date}'`},
        ${launchedOrganically},
        ${additionalComments || `''`});
      `;
      },
    );
    res = await db.multi(multiBoxesQuery);
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

  const locationsByCountry = {};
  res.forEach((location) => {
    if (location.country in locationsByCountry) {
      locationsByCountry[location.country].push(location);
    } else {
      locationsByCountry[location.country] = [location];
    }
  });

  // locationsByCountry returns a dictionary where each key
  // is a country and the value is the list of locations in that country
  // {
  //   country: [
  //     {
  //       zip_code,
  //       country,
  //       latitude,
  //       longitude,
  //       box_count
  //     }
  //   ]
  // }

  return locationsByCountry;
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
