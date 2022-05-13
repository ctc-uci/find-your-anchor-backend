/* eslint-disable no-param-reassign */
const yup = require('yup');

const schema = yup
  .object({
    boxNumber: yup.number().required().typeError('Missing or invalid box number'),
    date: yup.date().required().typeError('Missing or invalid date'),
    zipCode: yup.string().required('Missing or invalid zip code'),
    country: yup.string(),
    launchedOrganically: yup.bool().default(false),
  })
  .required();

// TODO: currently this unction returns an array of error messages for one row
// but not sure if we should return something else
const validateBoxWithYup = async (box) => {
  try {
    await schema.validate(box, { abortEarly: false });
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
