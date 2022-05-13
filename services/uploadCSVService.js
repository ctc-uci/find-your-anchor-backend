const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line import/no-unresolved
const { parse } = require('csv-parse/sync');
const validateBoxService = require('./validateBoxService');

const parseCSV = async (req) => {
  const data = await parse(req.file.buffer, { columns: true });
  const boxNumbers = new Map();
  const results = data.map((row, i) => {
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

    // Change this because can't pass JSON with map to frontend
    if (!boxNumbers.has(boxNumber)) {
      boxNumbers.set(boxNumber, new Set());
    }
    boxNumbers.get(boxNumber).add(i + 1);

    return CSVRow;
  });

  // Begin validation on data here
  let numErrors = 0;
  const rowData = await Promise.all(
    results.map(async (CSVRow) => {
      const validatedRow = await validateBoxService.validateBoxWithYup(CSVRow);
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
