// eslint-disable no-console

const router = require('express-promise-router')();
const { db } = require('../config');

const SQLQueries = {
  CreateAnchorBox:
    'INSERT INTO public."Anchor_Box"(box_id, approved, message, current_location, pickup, picture) VALUES ($1, $2, $3, $4, $5, $6)',
  Return: 'RETURNING *',
};

router.post('/', async (req, res) => {
  try {
    const { boxNumber, date, zipCode, boxLocation, message, picture, comments } = req.body;

    console.log(date, boxLocation, comments);
    console.log(req.body);

    // insert into Anchor_Box
    const allBoxes = await db.query(SQLQueries.CreateAnchorBox + SQLQueries.Return, [
      boxNumber,
      false,
      message,
      zipCode,
      false,
      picture,
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
