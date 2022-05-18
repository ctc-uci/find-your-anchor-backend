const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line import/no-unresolved
const { parse } = require('csv-parse/sync');
const validateBoxService = require('./validateBoxService');
const db = require('../config');

const parseCSV = async (req) => {
  const data = await parse(req.file.buffer, { columns: true });
  const boxNumbers = {};
  const results = data.map((row) => {
    const uid = uuidv4(); // generates an id to uniquely identify each row
    const boxNumber = Number(row['Box No']);
    const CSVRow = {
      id: uid,
      boxNumber,
      date: row.Date,
      zipCode: row['Zip Code'],
      country: row.Country,
      launchedOrganically: row['Launched Organically?'].toLowerCase() === 'yes',
      error: false,
    };

    if (!(boxNumber in boxNumbers)) {
      boxNumbers[boxNumber] = 0;
    }
    boxNumbers[boxNumber] += 1;

    return CSVRow;
  });

  // Begin validation on data here
  let numErrors = 0;

  // Create set of current box no's in PostgreSQL here
  const boxes = await db.query('SELECT box_id FROM "Anchor_Box"');
  const boxNumSet = new Set(boxes.map((box) => Number(box.box_id)));

  const rowData = await Promise.all(
    results.map(async (CSVRow) => {
      const validatedRow = await validateBoxService.validateBoxWithYup(CSVRow, boxNumbers);

      // Do box number database validation here
      if (boxNumSet.has(validatedRow.boxNumber)) {
        validatedRow.error = true;
      }

      if (validatedRow.error) {
        numErrors += 1;
      }
      return validatedRow;
    }),
  );

  return { rowData, boxNumbers, numErrors }; // Return custom object with row data and box number map
};

module.exports = {
  parseCSV,
};
