const anchorBoxRouter = require('express-promise-router')();
const { findBoxId, createAnchorBox, deleteAnchorBox } = require('../services/anchorBoxService');

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

module.exports = anchorBoxRouter;
