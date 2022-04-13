const anchorBoxRouter = require('express-promise-router')();
const {
  findBoxId,
  createAnchorBox,
  createAnchorBoxes,
  deleteAnchorBox,
  getAnchorBoxesByLocation,
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

anchorBoxRouter.post('/boxes', async (req, res) => {
  try {
    const response = await createAnchorBoxes(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error);
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

module.exports = anchorBoxRouter;
