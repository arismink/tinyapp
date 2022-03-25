const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs"); 
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

const { generateRandomString, findUserByEmail, userURLS } = require("./helpers");
const { users, urlDatabase } = require("./data")

app.set("view engine", "ejs");

// middleware:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ['LHL', 'key', 'something', 'cookie'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get("/", (req, res) => {
  res.send("Hi there!");
});

// access denied: when user is not logged in
app.get("/access_denied", (req, res) => {
  const templateVars = {
    user: undefined
  };
  res.render("accessDenied", templateVars);
})

// homepage
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect("/access_denied");
  }

  const templateVars = {
    urls: userURLS(urlDatabase, user_id),
    user: users[user_id]
  };

  res.render("urls_index", templateVars);
});

// registration
app.get("/register", (req, res) => {
  if (req.session.user_id) return res.redirect("/urls");

  const user_id = req.session.user_id;

  console.log("Registered user:", user_id);
  const templateVars = {
    user: users[user_id]
  };
  console.log("Existing users:", users);
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  console.log('register console', req.session.user_id);

  const userEnteredEmail = req.body.email;
  const userEnteredPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userEnteredPassword, 10);
  const randUserID = 'u_' + generateRandomString();

  if (!userEnteredEmail) {
    return res.status(404).send("The email entered cannot be empty.");
  }
  if (!userEnteredPassword) {
    return res.status(404).send("The password entered cannot be empty.");
  }

  if (findUserByEmail(users, userEnteredEmail)) {
    return res.status(400).send("The email entered already exists. Please enter a new email address.");
  }

  users[randUserID] = {
    id: randUserID,
    email: userEnteredEmail,
    password: hashedPassword
  };

  console.log('New user registered:', randUserID);
  console.log('Existing users in database:', users);

  req.session.user_id = randUserID;

  res.redirect("/urls")

});

// login
app.get("/login", (req, res) => {

  if (req.session.user_id) return res.redirect("/urls");

  const templateVars = {
    user: req.session.user_id
  };

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const userEnteredEmail = req.body.email;
  const userEnteredPassword = req.body.password;
  const user_id = findUserByEmail(users, userEnteredEmail)
  const hashedPassword = users[user_id].password

  if(user_id) {
    if (users[user_id].email === userEnteredEmail && bcrypt.compareSync(userEnteredPassword, hashedPassword)) {
      console.log("Logged in user:", user_id);
      req.session.user_id = user_id;
      return res.redirect("/urls");
    }
    return res.status(403).send("The email and password entered do not match. Please try again.");
  }
  return res.status(403).send("Email cannot be found. Please enter a valid email address.")

});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// create new shortURL
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };

  if (!user_id) {
    return res.status(404).send("Oops! You do not have permission to perform this action. Please login or register to continue.\n").redirect("/access_denied");
  } 

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    const newShortURL = generateRandomString();
    const user_id = req.session.user_id;

    urlDatabase[newShortURL] = { longURL: 'http://' + req.body.longURL, userID: user_id };
    console.log(`New short url created: ${newShortURL} for ${req.body.longURL}`);
    res.redirect(`/urls/${newShortURL}`);

  } else {
    res.status(403).send("Oops! You do not have permission to perform this action. Please login or register to continue.\n").redirect("/login");
  }
});


// update existing shortURL
app.post("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id || urlDatabase[req.params.shortURL].userID !== user_id) {
    return res.status(403).send("Oops! You do not have permission to edit this link!\n");
  }

  urlDatabase[req.params.shortURL] = { longURL: 'http://' + req.body.longURL, userID: user_id }

  console.log('Database updated: ', urlDatabase);
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;

  if (!urlDatabase[req.params.shortURL]) return res.status(404).send("Oops! This shortURL does not exist.\n");

  if (!user_id || urlDatabase[req.params.shortURL].userID !== user_id) {
    return res.status(403).send("Oops! You do not have permission to edit this link!\n");
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

// redirecting shortLink
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Link does not exist!");
  } 
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(`Redirecting to: ${longURL}`);
  res.redirect(longURL);

});

// delete existing shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id || urlDatabase[req.params.shortURL].userID !== user_id) {
    return res.status(403).send("Oops! You do not have permission to delete this link!\n");
  }

  delete urlDatabase[req.params.shortURL];
  console.log('shortURL deleted by: ', users[user_id].id, '\nNew database: ', urlDatabase);
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});