const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line import/no-unresolved
const { parse } = require('csv-parse/sync');

const parseCSV = async (req) => {
  const data = await parse(req.file.buffer, { columns: true });
  const result = data.map((row) => {
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

  return result;
};

module.exports = {
  parseCSV,
};
