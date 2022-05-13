const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line import/no-unresolved
const { parse } = require('csv-parse/sync');
const validateBoxService = require('./validateBoxService');

const parseCSV = async (req) => {
  const data = await parse(req.file.buffer, { columns: true });
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

    return CSVRow;
  });

  // Begin validation on data here
  const responses = await Promise.all(
    results.map(async (CSVRow) => {
      return validateBoxService.validateBoxWithYup(CSVRow);
    }),
  );

  console.log('responses after validateBoxWithYup: ', responses);

  return results;
};

module.exports = {
  parseCSV,
};
