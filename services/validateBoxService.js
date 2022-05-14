/* eslint-disable no-param-reassign */
const yup = require('yup');
const countryCodeLookup = require('country-code-lookup');
const zipcodeDataDump = require('../zipcodeDataDump.json');

const checkZipcodeInDataDump = (zipCode, country) => {
  // check if country code can be found and in both the country list and the data dump
  const countryCode = countryCodeLookup.byCountry(country);
  if (countryCode === null || zipcodeDataDump[countryCode.iso2] === undefined) {
    return 'Missing or invalid country name';
  }

  // check if the zipcode-country combo is a valid in the data dump
  if (!zipcodeDataDump[countryCode.iso2][zipCode]) {
    return `Zipcode ${zipCode} does not exist in this country`;
  }

  return 'success';
};

function validateBoxNumber() {
  return this.test('boxNotExists', async function boxCheck(boxNumber, option) {
    const { path, createError } = this;
    const boxNumberMap = option.options.context;

    // if box number if found on more than one row
    if (boxNumberMap && boxNumber in boxNumberMap && boxNumberMap[boxNumber] > 1) {
      return createError({ path, message: `Duplicate found: ${boxNumber}` });
    }

    return true;
  });
}

function validateZipInCountry() {
  return this.test('isZipInCountry', async function zipcodeAndCountryCheck({ zipCode, country }) {
    const { path, createError } = this;

    const validateResult = checkZipcodeInDataDump(zipCode, country);
    if (validateResult !== 'success') {
      return createError({ path, message: validateResult });
    }

    return true;
  });
}

yup.addMethod(yup.number, 'boxNotExists', validateBoxNumber);
yup.addMethod(yup.object, 'isZipInCountry', validateZipInCountry);
const schema = yup
  .object({
    boxNumber: yup.number().required().boxNotExists().typeError('Missing or invalid box number'),
    date: yup.date().required().typeError('Missing or invalid date'),
    zipCode: yup.string().required('Missing or invalid zip code'),
    country: yup.string(),
    launchedOrganically: yup.bool().default(false),
  })
  .isZipInCountry()
  .required();

const validateBoxWithYup = async (box, boxNumberMap) => {
  try {
    await schema.validate(box, { abortEarly: false, context: boxNumberMap });
  } catch (err) {
    // console.log('ERR: ', err);
    box.error = true;
  }
  return box;
};

module.exports = {
  validateBoxWithYup,
  checkZipcodeInDataDump,
};
