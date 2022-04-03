const anchorBoxRouter = require('express-promise-router')();
const {
  findBoxId,
  createAnchorBox,
  deleteAnchorBox,
  getAnchorBoxesByLocation,
  updateAnchorBox,
  getAllAnchorBoxesOnMap,
  getAllLocationInfo,
} = require('../services/anchorBoxService');

anchorBoxRouter.get('/', async (req, res) => {
  try {
    const { zipCode, country } = req.query;
    if (zipCode === undefined || country === undefined) {
      const anchorBoxes = await getAllAnchorBoxesOnMap();
      res.status(200).send(anchorBoxes);
      return;
    }
    const anchorBoxes = await getAnchorBoxesByLocation(zipCode, country);
    res.status(200).send(anchorBoxes);
  } catch (error) {
    res.status(500).send(error);
  }
});

anchorBoxRouter.get('/box/:boxId', async (req, res) => {
  try {
    const { boxId } = req.params;
    const anchorBox = await findBoxId(boxId);
    return res.status(200).send(anchorBox);
  } catch (error) {
    return res.status(500).send(error);
  }
});

anchorBoxRouter.get('/locations', async (req, res) => {
  try {
    const locationInfo = await getAllLocationInfo();
    res.status(200).send(locationInfo);
  } catch (error) {
    res.status(500).send(error);
  }
});

anchorBoxRouter.post('/box', async (req, res) => {
  try {
    const {
      boxNumber,
      date,
      zipCode,
      boxLocation,
      message,
      picture,
      comments,
      launchedOrganically,
    } = req.body;
    // Create anchor box
    const newAnchorBox = await createAnchorBox(
      boxNumber,
      message,
      zipCode,
      picture,
      boxLocation,
      date,
      launchedOrganically,
      comments,
    );
    res.status(200).send(newAnchorBox);
  } catch (error) {
    res.status(500).send(error);
  }
});

// TODO: Convert this route to use pg-promise's multi-query string feature: http://vitaly-t.github.io/pg-promise/Database.html#multi
anchorBoxRouter.post('/boxes', async (req, res) => {
  try {
    const formDatas = req.body;
    formDatas.forEach(async (formData) => {
      // Create anchor box
      await createAnchorBox(
        formData.boxNumber,
        formData.message,
        formData.picture,
        formData.boxLocation,
        formData.date,
        formData.launchedOrganically,
        formData.additionalComments,
      );
    });
    res.status(200).send('upload success');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

anchorBoxRouter.delete('/:boxId', async (req, res) => {
  try {
    const { boxId } = req.params;
    const response = await deleteAnchorBox(boxId);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

anchorBoxRouter.put('/update', async (req, res) => {
  try {
    const { boxID, showOnMap } = req.body;
    const response = await updateAnchorBox(boxID, showOnMap);
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = anchorBoxRouter;
