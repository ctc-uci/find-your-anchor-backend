const router = require('express-promise-router')();
const dbService = require('../services/databaseService');

router.get('/:boxId', async (req, res) => {
  try {
    return res.status(200).send(await dbService.getBoxById(req.params.boxId));
  } catch (error) {
    return res.status(500).send(error);
  }
});

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

router.post('/box', async (req, res) => {
  try {
    const boxes = await dbService.createBox(req.body);
    return res.status(200).send(boxes);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
