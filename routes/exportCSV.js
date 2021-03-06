const router = require('express-promise-router')();
const verifyToken = require('../services/authService');
const exportCSVService = require('../services/exportCSVService');

// get boxes by filters
router.post('/boxes', verifyToken, async (req, res) => {
  try {
    return res.status(200).send(await exportCSVService.getBoxesByFilters(req.body));
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
