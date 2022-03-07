const { db } = require('../config');

const SQLQueries = {
  CreateAnchorBox:
    'INSERT INTO "Anchor_Box"(box_id, approved, message, zip_code, picture, general_location, date, launched_organically, additional_comments) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
  FindBoxId: 'SELECT box_id FROM "Anchor_Box" WHERE box_id = $1',
  GetBoxesByFilters: (selectClauseSQL, whereClauseSQL, orderBySQL) =>
    `SELECT ${selectClauseSQL} FROM "Anchor_Box" WHERE ${whereClauseSQL} ORDER BY ${orderBySQL}`,
  Return: 'RETURNING *',
};

// helper functions not related to querying the database
const sortbyToSQL = (sortBy) => {
  switch (sortBy) {
    case 'ascend-box-num':
      return 'box_id ASC';
    case 'descend-box-num':
      return 'box_id DESC';
    case 'chronologic':
      return 'date ASC';
    case 'ascend-zip-code':
      return 'zip_code ASC';
    case 'descend-zip-code':
      return 'zip_code DESC';
    default:
      return 'box_id ASC';
  }
};

const boxesToSQL = (boxRange) => {
  const boxIdsSQL = [];
  const values = boxRange.split(',');
  values.forEach((val) => {
    const valTrimmed = val.trim();
    if (valTrimmed.includes('-')) {
      const range = valTrimmed.split('-');
      boxIdsSQL.push(`box_id BETWEEN ${range[0]} AND ${range[1]}`);
    } else {
      boxIdsSQL.push(`box_id = ${valTrimmed}`);
    }
  });
  return boxIdsSQL.join(' OR ');
};

const zipcodeToSQL = (zipCode) => {
  const zipCodesSQL = [];
  const values = zipCode.split(',');
  values.forEach((val) => {
    zipCodesSQL.push(`'${val.trim()}'`);
  });
  return `zip_code IN (${zipCodesSQL.join(', ')})`;
};

const boxDetailsToSQL = (boxDetails) => {
  return boxDetails.length > 0 ? boxDetails.join(', ') : '*';
};

// functions for querying the database
const getBoxById = async (boxId) => {
  const res = await db.query(SQLQueries.FindBoxId, [boxId]);
  return res.rows;
};

const getBoxesByFilters = async (req) => {
  const {
    sortBy,
    boxOption,
    boxRange,
    dateOption,
    singleDate,
    startDate,
    endDate,
    zipOption,
    zipCode,
    launchOrg,
    boxDetails,
  } = req;

  try {
    const whereClauseConditions = [];
    if (boxOption === 'boxes-custom') {
      whereClauseConditions.push(boxesToSQL(boxRange));
    }
    if (zipOption === 'zip-code-custom') {
      whereClauseConditions.push(zipcodeToSQL(zipCode));
    }
    if (dateOption === 'date-single') {
      whereClauseConditions.push(`date = ${singleDate}`);
    } else if (dateOption === 'date-range') {
      whereClauseConditions.push(`date BETWEEN ${startDate} AND ${endDate}`);
    }
    whereClauseConditions.push(`launched_organically = ${launchOrg === 'yes'}`);

    const whereClauseSQL = whereClauseConditions.join(' AND '); // combine all the conditions in the where clause
    const orderBySQL = sortbyToSQL(sortBy);
    const selectClauseSQL = boxDetailsToSQL(boxDetails);

    const res = await db.query(
      SQLQueries.GetBoxesByFilters(selectClauseSQL, whereClauseSQL, orderBySQL),
    );

    return res.rows;
  } catch (err) {
    throw new Error(err.message);
  }
};

const createBox = async (req) => {
  const { boxNumber, date, zipCode, launchedOrganically } = req;

  let res = null;
  try {
    // check if boxNumber exists
    const box = await getBoxById(boxNumber);
    if (box.length > 0) {
      throw new Error('box number exists already');
    }

    // create new Anchor_Box if boxNumber does not exist
    res = await db.query(SQLQueries.CreateAnchorBox + SQLQueries.Return, [
      boxNumber,
      true,
      req.message || '',
      zipCode,
      req.picture || '',
      req.boxLocation || '',
      date,
      launchedOrganically,
      req.additionalComments || '',
    ]);
  } catch (err) {
    throw new Error(err.message);
  }
  return res.rows;
};

module.exports = {
  getBoxById,
  getBoxesByFilters,
  createBox,
};
