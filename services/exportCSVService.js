const { db } = require('../config');

const SQLQueries = {
  GetBoxesByFilters: (selectClauseSQL, whereClauseSQL, orderBySQL) =>
    `SELECT ${selectClauseSQL} FROM "Anchor_Box" WHERE ${whereClauseSQL} ORDER BY ${orderBySQL}`,
};

// the following are helper functions
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
  return boxDetails.length > 0
    ? boxDetails.join(', ')
    : 'date, box_id, zip_code, picture, general_location, launched_organically, message';
};

module.exports = {
  getBoxesByFilters: async (req) => {
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
  },
};
