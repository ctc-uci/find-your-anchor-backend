const router = require('express-promise-router')();
const boxFormService = require('../services/boxFormService');

router.get('/:boxId', async (req, res) => {
  try {
    return res.status(200).send(await boxFormService.findBoxId(req.params.boxId));
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post('/boxes', async (req, res) => {
  try {
    const formDatas = req.body;
    await boxFormService.createMultipleAnchorBoxes(formDatas);
    // formDatas.forEach(async (formData) => {
    //   await boxFormService.createAnchorBox(formData);
    // });
    return res.status(200).send('upload success');
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.post('/box', async (req, res) => {
  try {
    const boxes = await boxFormService.createAnchorBox(req.body);
    return res.status(200).send(boxes);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
