const db = require('./../db');
const bcrypt = require('bcrypt');

const getLoginForm = (req, res) => {
  res.render('loginForm', { req });
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).send('Invalid email or password');
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_digest);

    if (passwordMatch) {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      }; // store only necessary fields
      res.redirect('/questions');
    } else {
      res.status(401).send('Invalid email or password');
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


const getSignupForm = (req, res) => {
  res.render('signupForm', { req });
};

const signUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const passwordDigest = await bcrypt.hash(password, 10);

    // Check if the username already exists
    const usernameCheck = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      res.status(409).send('Username already exists');
      return;
    }

    const result = await db.query(
      'INSERT INTO users (username, email, password_digest, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, username, email',
      [username, email, passwordDigest]
    );
    const user = result.rows[0];

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email, 
    };
    res.redirect('/questions');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    } else {
      res.redirect('/');
    }
  });
};


module.exports = {
  getLoginForm,
  login,
  getSignupForm,
  signUp,
  logout,
};

