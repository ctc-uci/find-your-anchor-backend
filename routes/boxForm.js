// eslint-disable no-console
const router = require('express-promise-router')();
// const multer = require('multer');
const { db } = require('../config');

// const upload = multer({ dest: 'uploads/' });

const SQLQueries = {
  CreateAnchorBox:
    'INSERT INTO public."Anchor_Box"(box_id, picture, approved, message, current_location) VALUES ($1, $2, $3, $4, $5)',
  Return: 'RETURNING *',
};

router.post('/', async (req, res) => {
  try {
    console.log(req.file);

    const { date, boxId, boxLocation, message } = req.body;

    console.log(date);

    // insert into Anchor_Box
    const array = [1, 2];
    await db.query(
      SQLQueries.CreateAnchorBox + SQLQueries.Return,
      [boxId, array, false, message, boxLocation],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.send(results.rows);
      },
    );
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

// await db.query('SELECT * FROM "Admin"', (error, results) => {
//   if (error) {
//     throw error;
//   }
//   res.send(results.rows)
// });
