const admin = require('../firebase');

// This method makes a call to Firebase that will verify the access token attached to the request's cookies
// This method is used to make sure that only users who have appropriate access tokens can access backend routes.
const verifyToken = async (req, res, next) => {
  try {
    const {
      cookies: { accessToken },
    } = req;
    if (!accessToken) {
      return res.status(400).send('@verifyToken no access token');
    }
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    if (!decodedToken) {
      return res.status(400).send('Empty token from firebase');
    }
    return next();
  } catch (err) {
    return res.status(500).send('@verifyToken no access token');
  }
};

module.exports = verifyToken;
