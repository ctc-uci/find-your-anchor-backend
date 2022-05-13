/* eslint-disable no-param-reassign */
const yup = require('yup');

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

yup.addMethod(yup.number, 'boxNotExists', validateBoxNumber);

const schema = yup
  .object({
    boxNumber: yup.number().required().boxNotExists().typeError('Missing or invalid box number'),
    date: yup.date().required().typeError('Missing or invalid date'),
    zipCode: yup.string().required('Missing or invalid zip code'),
    country: yup.string(),
    launchedOrganically: yup.bool().default(false),
  })
  .required();

// TODO: currently this unction returns an array of error messages for one row
// but not sure if we should return something else
const validateBoxWithYup = async (box, boxNumberMap) => {
  try {
    await schema.validate(box, { abortEarly: false, context: boxNumberMap });
  } catch (err) {
    // const errors = [];
    // err.inner.forEach((e) => {
    //   errors.push({
    //     name: e.path,
    //     message: e.message,
    //   });
    // });
    // console.log('error: ', errors);
    box.error = true;
  }

  return box;
};

module.exports = {
  validateBoxWithYup,
};
