const router = require('express-promise-router')();
const dbService = require('../services/databaseService');

// get box by id
router.get('/:boxId', async (req, res) => {
  try {
    return res.status(200).send(await dbService.getBoxById(req.params.boxId));
  } catch (err) {
    return res.status(500).send(err);
  }
});

// get boxes by filters
router.get('/:boxes', async (req, res) => {
  try {
    return res.status(200).send(await dbService.getBoxesByFilters(req.body));
  } catch (err) {
    return res.status(500).send(err);
  }
});

// upload multiple boxes
router.post('/boxes', (req, res) => {
  try {
    const formDatas = req.body;
    formDatas.forEach(async (formData) => {
      await dbService.createBox(formData);
    });
    return res.status(200).send('upload success');
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// upload one box
router.post('/box', async (req, res) => {
  try {
    const boxes = await dbService.createBox(req.body);
    return res.status(200).send(boxes);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
