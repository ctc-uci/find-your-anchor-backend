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
const validateBoxWithYup = async (req) => {
  try {
    await schema.validate(req, { abortEarly: false });
  } catch (err) {
    const errors = [];
    err.inner.forEach((e) => {
      errors.push({
        name: e.path,
        message: e.message,
      });
    });
    console.log('error: ', errors);
    req.error = true;
  }
};

module.exports = {
  validateBoxWithYup,
};
