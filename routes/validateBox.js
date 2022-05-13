const router = require('express-promise-router')();
const validateBoxService = require('../services/validateBoxService');

// validates the fields in a given object via yup
router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const resp = await validateBoxService.validateBoxWithYup(req.body);
    return res.status(200).send(resp);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
