const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hi there!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = "http://" + req.body.longURL;
  console.log(`New short url created: ${newShortURL} for ${req.body.longURL}`);
  res.redirect(`/urls:${newShortURL}`);
});

app.get("/urls:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL.substring(1), longURL: `http://${urlDatabase[req.params.shortURL.substring(1)]}`};

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(`Redirecting to: ${longURL}`);
  res.redirect(`http://${longURL}`); 
})

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('deleting');
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  console.log('new database: ', urlDatabase);
  res.redirect("/urls")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})

function generateRandomString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = 6;
  let randStr = '';

  for (let x = 0; x < charLength; x++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return randStr
};