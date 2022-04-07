const db = require('../config');

// the following are helper functions
const sortbyToSQL = (sortBy) => {
  switch (sortBy) {
    case 'ascend-box-num':
      return 'box_id::int ASC';
    case 'descend-box-num':
      return 'box_id::int DESC';
    case 'chronologic':
      return `TO_DATE(date, 'MM/DD/YYYY') ASC`;
    case 'ascend-zip-code':
      return 'zip_code ASC';
    case 'descend-zip-code':
      return 'zip_code DESC';
    default:
      return 'box_id::int ASC';
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
  /* eslint-disable prefer-template */
  return '(' + boxIdsSQL.join(' OR ') + ')';
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
  return boxDetails.length > 0
    ? boxDetails.join(', ')
    : 'date, box_id, zip_code, picture, general_location, launched_organically, message';
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
    launchedOrganically,
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
      whereClauseConditions.push(`date = '${singleDate}'`);
    } else if (dateOption === 'date-range') {
      whereClauseConditions.push(
        `TO_DATE(date, 'MM/DD/YYYY') BETWEEN (DATE '${startDate}') AND (DATE '${endDate}')`,
      );
    }
    whereClauseConditions.push(`launched_organically = ${launchedOrganically === 'yes'}`);

    const whereClauseSQL = whereClauseConditions.join(' AND '); // combine all the conditions in the where clause
    const orderBySQL = sortbyToSQL(sortBy);
    const selectClauseSQL = boxDetailsToSQL(boxDetails);

    const res = await db.query(
      `SELECT ${selectClauseSQL} FROM "Anchor_Box" WHERE ${whereClauseSQL} ORDER BY ${orderBySQL}`,
    );

    return res;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getBoxesByFilters,
};
