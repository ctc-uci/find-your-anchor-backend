const anchorBoxRouter = require('express-promise-router')();
const {
  findBoxId,
  createAnchorBox,
  deleteAnchorBox,
  getAnchorBoxesByLocation,
  updateAnchorBox,
  getAllAnchorBoxes,
  getAllLocationInfo,
} = require('../services/anchorBoxService');

anchorBoxRouter.get('/', async (req, res) => {
  try {
    const { zipCode, country } = req.query;
    if (zipCode === undefined || country === undefined) {
      const anchorBoxes = await getAllAnchorBoxes();
      res.status(200).send(anchorBoxes);
      return;
    }
    const anchorBoxes = await getAnchorBoxesByLocation(zipCode, country);
    res.status(200).send(anchorBoxes);
  } catch (error) {
    res.status(400).send(error);
  }
});

anchorBoxRouter.get('/locations', async (req, res) => {
  try {
    const locationInfo = await getAllLocationInfo();
    res.status(200).send(locationInfo);
  } catch (error) {
    res.status(400).send(error);
  }
});

anchorBoxRouter.post('/', async (req, res) => {
  try {
    const {
      boxNumber,
      date,
      zipCode,
      boxLocation,
      message,
      picture,
      additionalComments,
      launchedOrganically,
    } = req.body;

    // 1. check if boxNumber already exists
    const anchorBox = await findBoxId(boxNumber);

    if (anchorBox.length > 0) {
      res.status(400).json({ message: `box number ${boxNumber} already exists` });
      return;
    }

    // 2. create new Anchor_Box if boxNumber does not exist
    const allBoxes = await createAnchorBox(
      boxNumber,
      message,
      zipCode,
      picture,
      boxLocation,
      date,
      launchedOrganically,
      additionalComments,
    );
    res.status(200).send(allBoxes);
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
    res.status(400).send(error);
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
