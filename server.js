const express = require("express")
const app = express()
const port = process.env.PORT || 4477
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const expressLayouts = require("express-ejs-layouts")

app.set("view engine", "ejs")

app.use(express.static("public")) 
app.use(express.urlencoded({ extended: true })) 
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

app.get('/', (req, res) => {
  res.render('home');
});


app.get("/login", (req, res) => {
  res.render("loginForm")
})

app.post("/login", (req, res) => {
  
})

app.get("/signup", (req, res) => {
  res.render("signupForm")
})

app.post("/logout", (req, res) => {
  
})

app.get("/questions", (req, res) => {
  
})

app.get("/questions/new", (req, res) => {
  res.render("newQuestion")
})









app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
