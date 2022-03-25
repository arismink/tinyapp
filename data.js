const bcrypt = require("bcryptjs"); 

// Standard test users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "u_94x92": {
    id: "u_94x92",
    email: "a@test.ca",
    password: bcrypt.hashSync("hi", 10)
  }
};

// Standard test database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    dateCreated: "Wed Mar 23 2022"
    },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    dateCreated: "Wed Mar 23 2022"
  },
  hf43nj: {
    longURL: "https://www.facebook.com",
    userID: "u_94x92",
    dateCreated: "Wed Mar 23 2022"
  },
  kf932d: {
    longURL: "https://www.example.edu",
    userID: "u_94x92",
    dateCreated: "Thurs Mar 24 2022"
  }
};

module.exports = { users, urlDatabase };  