// database.js - Pure JavaScript JSON database, কোনো build লাগে না!
const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const EMPTY_DB = {
  users: [], products: [], categories: [], orders: [],
  carts: [], wishlists: [], reviews: [], coupons: [], banners: []
};

let _db = null;

const load = () => {
  if (_db) return _db;
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
    _db = JSON.parse(JSON.stringify(EMPTY_DB));
  } else {
    _db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    // missing collections add করো
    for (const k of Object.keys(EMPTY_DB)) {
      if (!_db[k]) _db[k] = [];
    }
  }
  return _db;
};

const save = () => {
  fs.writeFileSync(DB_PATH, JSON.stringify(_db, null, 2));
};

const connectDB = () => {
  load();
  console.log('✅ JSON Database ready:', DB_PATH);
};

const getDB = () => load();

module.exports = { connectDB, getDB, save };
