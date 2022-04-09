const anchorBoxRouter = require('express-promise-router')();
const {
  findBoxId,
  createAnchorBox,
  deleteAnchorBox,
  getAnchorBoxesByLocation,
  updateAnchorBox,
  getAllAnchorBoxesOnMap,
  getAllLocationInfo,
  getBoxesForSearch,
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

/**
 * This route 'extends' the nominatim API and is used as a provider for box searching
 * Provided queries:
 *  - q: search query (box ID)
 *  - format: json
 * REQUIRED output attributes (names MUST be as follows):
 *  - lat: latitude
 *  - lon: longitude
 *  - boundingbox: The rectangular section of the map to zoom to (not used in our case)
 *  - display_name: The label of the box to display in the search dropdown (MUST be equal to box_id, so no extra text)
 * ADDITIONAL output attributes:
 *  - zip_code: The box's zip code
 *  - country: The box's country
 */
anchorBoxRouter.get('/search/', async (req, res) => {
  try {
    const { q } = req.query;
    const results = await getBoxesForSearch(q.toString());
    // Put dummy boundingbox attribute (MUST be array of length 4 with stringified numbers)
    for (let i = 0; i < results.length; i += 1) {
      results[i].custom = true;
      results[i].boundingbox = [
        results[i].lat.toString(),
        results[i].lat.toString(),
        results[i].lon.toString(),
        results[i].lon.toString(),
      ];
    }
    res.send(results);
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
