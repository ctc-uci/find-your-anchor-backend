const router = require('express-promise-router')();
const { db } = require('../config');

const SQLQueries = {
  CreateAnchorBox:
    'INSERT INTO "Anchor_Box"(box_id, approved, message, zip_code, picture, general_location, date, launched_organically, additional_comments) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
  FindBoxId: 'SELECT box_id FROM "Anchor_Box" WHERE box_id = $1',
  Return: 'RETURNING *',
};

router.get('/exists/:boxId', async (req, res) => {
  try {
    const anchorBox = await db.query(SQLQueries.FindBoxId, [req.params.boxId]);
    if (anchorBox.rows.length > 0) {
      return res.status(200).send(true);
    }
    return res.status(200).send(false);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      boxNumber,
      date,
      zipCode,
      boxLocation,
      message,
      picture,
      additionalComments,
      launchedOrganically,
    } = req.body;

    // 1. check if boxNumber already exists
    const anchorBox = await db.query(SQLQueries.FindBoxId, [boxNumber]);

    if (anchorBox.rows.length > 0) {
      return res.status(400).json({ message: `box number ${boxNumber} already exists` });
    }
    // 2. create new Anchor_Box if boxNumber does not exist
    const allBoxes = await db.query(SQLQueries.CreateAnchorBox + SQLQueries.Return, [
      boxNumber,
      true,
      message,
      zipCode,
      picture,
      boxLocation,
      date,
      launchedOrganically,
      additionalComments,
    ]);
    return res.status(200).send(allBoxes.rows);
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
