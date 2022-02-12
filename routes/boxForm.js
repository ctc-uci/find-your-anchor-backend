// eslint-disable no-console

const router = require('express-promise-router')();
const { db } = require('../config');

const SQLQueries = {
  CreateAnchorBox:
    'INSERT INTO public."Anchor_Box"(box_id, approved, message, zip_code, picture, general_location, date, launched_organically, additional_comments) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
  Return: 'RETURNING *',
};

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

    // insert into Anchor_Box
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
    res.status(200).send(allBoxes.rows);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
});

module.exports = router;

// information obtained:
// date
// box number
// zip code
// box location
// message
// box photo
// comments
// launched organically?
