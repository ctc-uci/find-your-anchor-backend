const router = require('express-promise-router')();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const csv = require('csv');
const uploadCSVService = require('../services/uploadCSVService');

const upload = multer({ storage: multer.memoryStorage() });

// Upload, parse, and validate CSV file => array of objects representing each row
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('Req File: ', req.file);

    csv.parse(req.file.buffer, { columns: true }, function (err, data) {
      const result = data.map((row) => {
        const uid = uuidv4(); // generates an id to uniquely identify each row
        const boxNumber = Number(row['Box No']);
        const CSVRow = {
          id: uid,
          boxNumber,
          date: row.Date,
          zipCode: row['Zip Code'],
          country: row.Country,
          launchedOrganically: row['Launched Organically?'].toLowerCase() === 'yes',
          error: false,
        };

        return CSVRow;
      });

      console.log('result: ', result);
    });

    return res.status(200).send(await uploadCSVService.getBoxesByFilters(req.body));
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
