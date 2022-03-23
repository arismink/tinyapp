const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

// middleware:
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// routes:

app.get("/", (req, res) => {
  res.send("Hi there!");
});

// homepage
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
  };

  res.render("urls_index", templateVars);
});

// registration
app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_registration", templateVars);
})

app.post("/register", (req, res) => {
  const userEnteredEmail = req.body.email;
  const userEnteredPassword = req.body.password;
  const randUserID = 'u_' + generateRandomString();

  users[randUserID] = {
    id: randUserID,
    email: userEnteredEmail,
    password: userEnteredPassword
  }
  console.log('user created for ', randUserID);
  console.log(users);

  res.cookie("user_id", randUserID).redirect("/urls");

})

// login
app.post("/login", (req, res) => {
  console.log('logged in user: ', req.body.username);
  res.cookie("username", req.body.username).redirect("/urls");
})

// logout
app.post("/logout", (req, res) => {
  console.log('logged out user');
  res.clearCookie("username", res.cookie.user).redirect("/urls");
})

// create new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,       
    username: req.cookies.username };

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = 'http://' + req.body.longURL;
  console.log(`New short url created: ${newShortURL} for ${req.body.longURL}`);
  res.redirect(`/urls/${newShortURL}`);
});


// update existing shortURL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = 'http://' + req.body.longURL;
  console.log(urlDatabase); 
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

// redirecting shortLink
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(`Redirecting to: ${longURL}`);
  res.redirect(longURL); 
})

// delete existing shortURL
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