const db = require('./../db');

const getHome = async (req, res) => {
    res.render('home', { req });
  };

module.exports = { getHome };
