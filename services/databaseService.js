const { db } = require('../config');

const SQLQueries = {
  CreateAnchorBox:
    'INSERT INTO "Anchor_Box"(box_id, approved, message, zip_code, picture, general_location, date, launched_organically, additional_comments) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
  FindBoxId: 'SELECT box_id FROM "Anchor_Box" WHERE box_id = $1',
  GetBoxesByFilters: (selectClauseSQL, whereClauseSQL, orderBySQL) =>
    `SELECT ${selectClauseSQL} FROM "Anchor_Box WHERE ${whereClauseSQL} ORDER BY ${orderBySQL}`,
  Return: 'RETURNING *',
};

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

  let orderBySQL = 'ORDER BY ';
  switch (sortBy) {
    case 'ascend-box-num':
      orderBySQL += 'box_id ASC';
      break;
    case 'descend-box-num':
      orderBySQL += 'box_id DESC';
      break;
    case 'chronologic':
      orderBySQL += 'date ASC';
      break;
    case 'ascend-zip-code':
      orderBySQL += 'zip_code ASC';
      break;
    case 'descend-zip-code':
      orderBySQL += 'zip_code DESC';
      break;
    default:
      break;
  }

  const whereClauseConditions = [];

  // box option
  if (boxOption === 'boxes-custom') {
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
    whereClauseConditions.push(boxIdsSQL.join(' OR '));
  }

  // zip code option
  if (zipOption === 'zip-code-custom') {
    const zipCodesSQL = [];
    const values = zipCode.split(',');
    values.forEach((val) => {
      zipCodesSQL.push(`'${val.trim()}'`);
    });
    whereClauseConditions.push(`zip_code IN (${zipCodesSQL.join(', ')})`);
  }

  // launched organically option
  whereClauseConditions.push(launchOrg === 'yes');

  // date option
  if (dateOption === 'date-single') {
    whereClauseConditions.push(`date = ${singleDate}`);
  } else if (dateOption === 'date-range') {
    whereClauseConditions.push(`date BETWEEN ${startDate} AND ${endDate}`);
  }

  // combine all predicates
  const whereClauseSQL = whereClauseConditions.join(' AND ');

  // select clause
  let selectClauseSQL = '*';
  if (boxDetails.length > 0) {
    selectClauseSQL = boxDetails.join(', ');
  }

  const res = await db.query(
    SQLQueries.GetBoxesByFilters(selectClauseSQL, whereClauseSQL, orderBySQL),
  );

  return res.rows;
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
