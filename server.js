const express = require("express")
const app = express()
const port = process.env.PORT || 4477
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const expressLayouts = require("express-ejs-layouts")

const methodOverride = require("./middlewares/method_override")

const homeController = require('./controllers/home_controller');
const userController = require('./controllers/user_controller');
const questionController = require('./controllers/question_controller');

app.set("view engine", "ejs")

app.use(express.static("public")) 
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride)

app.use(expressLayouts)
app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  secret: process.env.SESSION_SECRET || "mistyrose",
  resave: false,
  saveUninitialized: true,
}))

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});


// Home route
app.get('/', homeController.getHome);

// User routes
app.get('/login', userController.getLoginForm);
app.post('/login', userController.login);
app.get('/signup', userController.getSignupForm);
app.post('/signup', userController.signUp);
app.get('/logout', userController.logout);

// Question routes
app.get('/questions', questionController.getAllQuestions);
app.get('/questions/new', questionController.getNewQuestionForm);
app.post('/questions', questionController.createQuestion);
app.get('/questions/:id', questionController.getQuestion);
app.get('/questions/:id/answers/new', questionController.getNewAnswerForm);
app.post('/questions/:id/answers', questionController.createAnswer);
app.delete('/questions/:id/delete', questionController.deleteQuestion);


app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
