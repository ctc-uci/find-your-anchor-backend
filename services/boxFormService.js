const { db } = require('../config');

const SQLQueries = {
  CreateAnchorBox:
    'INSERT INTO "Anchor_Box"(box_id, approved, message, zip_code, picture, general_location, date, launched_organically, additional_comments) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
  FindBoxId: 'SELECT box_id FROM "Anchor_Box" WHERE box_id = $1',
  Return: 'RETURNING *',
};

// functions for querying the database
const getBoxById = async (boxId) => {
  const res = await db.query(SQLQueries.FindBoxId, [boxId]);
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
  createBox,
};
