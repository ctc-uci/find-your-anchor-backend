// eslint-disable no-console

const router = require('express-promise-router')();
const { db } = require('../config');

const SQLQueries = {
  CreateAnchorBox:
    'INSERT INTO public."Anchor_Box"(box_id, approved, message, current_location, pickup, picture, evaluated, under_review, pending_changes, name, email, general_location, date, launched_organically) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
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
      comments,
      launchedOrganically,
    } = req.body;

    console.log(req.body);
    console.log(comments);

    // insert into Anchor_Box
    const allBoxes = await db.query(SQLQueries.CreateAnchorBox + SQLQueries.Return, [
      boxNumber,
      true,
      message,
      zipCode,
      false,
      picture,
      false,
      false,
      false,
      'hello',
      'hello@uci.edu',
      boxLocation,
      date,
      launchedOrganically,
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
