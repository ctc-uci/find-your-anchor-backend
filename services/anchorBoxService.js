const countryCodeLookup = require('country-code-lookup');
const zipcodeDataDump = require('../zipcodeDataDump.json');
const db = require('../config');

// This returns pageSize boxes at a location
const getAnchorBoxesByLocation = async (zipCode, country, pageIndex, pageSize) => {
  let res = null;
  const offset = (pageIndex - 1) * pageSize;
  try {
    res = await db.query(
      'SELECT * FROM "Anchor_Box" WHERE zip_code = $(zipCode) AND country = $(country) ORDER BY box_id LIMIT $(pageSize) OFFSET $(offset);',
      { zipCode, country, pageSize, offset },
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const getAnchorBoxCountInLocation = async (zipCode, country, pageSize) => {
  let res = null;
  try {
    res = await db.query(
      'SELECT COUNT(*) FROM "Anchor_Box" WHERE zip_code = $(zipCode) AND country = $(country)',
      { zipCode, country },
    );
  } catch (err) {
    throw new Error(err.message);
  }
  const totalNumberOfPages = Math.ceil(parseInt(res[0].count, 10) / pageSize);
  return [{ totalNumberOfPages }];
};

const findBoxId = async (id) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT * FROM "Anchor_Box"
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
  country,
  latitude,
  longitude,
) => {
  let res = null;
  try {
    res = await db.query(
      `INSERT INTO "Anchor_Box"
        (box_id, message,
        zip_code, picture, general_location,
        date, launched_organically, additional_comments, country, latitude, longitude)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        country,
        latitude,
        longitude,
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
        country,
        date,
        launchedOrganically,
        additionalComments,
      }) => {
        const countryCode = countryCodeLookup.byCountry(country).iso2;
        const latitude = zipcodeDataDump[countryCode][zipCode].lat;
        const longitude = zipcodeDataDump[countryCode][zipCode].long;
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
        ${`'${countryCode}'`},
        ${`'${latitude}'`},
        ${`'${longitude}'`});
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
    res = await db.query(
      `SELECT * FROM "Anchor_Box"
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND zip_code IS NOT NULL AND country IS NOT NULL`,
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
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND country IS NOT NULL AND zip_code IS NOT NULL
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
      AND latitude IS NOT NULL AND longitude IS NOT NULL AND country is NOT NULL AND zip_code IS NOT NULL
      ORDER BY box_id::bigint`,
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
  createAnchorBoxes,
  deleteAnchorBox,
  getAnchorBoxesByLocation,
  getAllAnchorBoxesOnMap,
  getAllLocationInfo,
  getBoxesForSearch,
  getAnchorBoxCountInLocation,
};
