const router = require('express-promise-router')();
const multer = require('multer');
const uploadCSVService = require('../services/uploadCSVService');

const upload = multer({ storage: multer.memoryStorage() }); // Middleware for passing files to route

// Upload, parse, and validate CSV file => array of objects representing each row
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const resp = await uploadCSVService.parseCSV(req);

    // this is to measure how much memory the csv file takes up
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

    return res.status(200).send(resp);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
