const generateRandomString = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = 6;
  let randStr = '';

  for (let x = 0; x < charLength; x++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return randStr;
}

const emailCheck = function(users, email) {
  for (let user in users) {
    if (users[user].email === email) return user;
  }
}

const userURLS = function(database, id) {
  let newDB = {};

  for (let url in database) {
    if (database[url].userID === id) newDB[url] = database[url].longURL
  }
  return newDB;
}

module.exports = { generateRandomString, emailCheck, userURLS };