const anchorBoxRouter = require('express-promise-router')();
const {
  findBoxId,
  createAnchorBox,
  createAnchorBoxes,
  deleteAnchorBox,
  getAnchorBoxesByLocation,
  getAllAnchorBoxesOnMap,
  getAllLocationInfo,
  getBoxesForSearch,
  getAnchorBoxCountInLocation,
} = require('../services/anchorBoxService');

anchorBoxRouter.get('/', async (req, res) => {
  try {
    const { zipCode, country, pageIndex, pageSize } = req.query;
    if (zipCode === undefined || country === undefined) {
      const anchorBoxes = await getAllAnchorBoxesOnMap();
      res.status(200).send(anchorBoxes);
      return;
    }
    const anchorBoxes = await getAnchorBoxesByLocation(zipCode, country, pageIndex, pageSize);
    res.status(200).send(anchorBoxes);
  } catch (error) {
    res.status(500).send(error);
  }
});

anchorBoxRouter.get('/boxCount', async (req, res) => {
  try {
    const { pageSize, zipCode, country } = req.query;
    const boxCount = await getAnchorBoxCountInLocation(zipCode, country, pageSize);
    res.status(200).send(boxCount);
  } catch (err) {
    res.status(500).send(err.message);
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
 *  - custom: An attribute to indicate that this search is custom (used in frontend to conditionally render AdminMarkerInfo)
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

// upload a single box
anchorBoxRouter.post('/box', async (req, res) => {
  try {
    const {
      boxNumber,
      date,
      zipcode,
      boxLocation,
      country,
      message,
      picture,
      comments,
      launchedOrganically,
      latitude,
      longitude,
    } = req.body;
    // Create anchor box
    const newAnchorBox = await createAnchorBox(
      boxNumber,
      message,
      zipcode,
      picture,
      boxLocation,
      date,
      launchedOrganically,
      comments,
      country,
      latitude,
      longitude,
    );
    res.status(200).send(newAnchorBox);
  } catch (error) {
    res.status(500).send(error);
  }
});

// upload multiple anchor boxes
anchorBoxRouter.post('/boxes', async (req, res) => {
  try {
    const response = await createAnchorBoxes(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

// delete box by id
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
