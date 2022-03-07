const pgp = require('pg-promise')({});

const cn = `postgresql://${process.env.REACT_APP_DATABASE_USER}:${process.env.REACT_APP_DATABASE_PASSWORD}@${process.env.REACT_APP_DATABASE_HOST}:${process.env.REACT_APP_DATABASE_PORT}/${process.env.REACT_APP_DATABASE_NAME}?ssl=true`; // For pgp
const db = pgp(cn);

const findBoxId = async (id) => {
  let res = null;
  try {
    res = await db.query(
      `SELECT box_id FROM "Anchor_Box"
      WHERE box_id = $1`,
      [id],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

const createAnchorBox = async (
  boxNumber,
  approved,
  message,
  zipCode,
  picture,
  boxLocation,
  date,
  launchedOrganically,
  additionalComments,
) => {
  let res = null;
  try {
    res = await db.query(
      `INSERT INTO "Anchor_Box"
        (box_id, approved, message,
        zip_code, picture, general_location,
        date, launched_organically, additional_comments)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;`,
      [
        boxNumber,
        approved,
        message,
        zipCode,
        picture,
        boxLocation,
        date,
        launchedOrganically,
        additionalComments,
      ],
    );
  } catch (err) {
    throw new Error(err.message);
  }
  return res;
};

module.exports = { findBoxId, createAnchorBox };
