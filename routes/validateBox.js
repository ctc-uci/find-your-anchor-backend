const router = require('express-promise-router')();
const validateBoxService = require('../services/validateBoxService');

// Validates the fields for a SINGLE box object via yup
router.post('/', async (req, res) => {
  try {
    const { box } = req.body;
    const resp = await validateBoxService.validateBoxWithYup(box);
    return res.status(200).send(resp);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
