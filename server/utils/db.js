// db.js - JSON file database helper
const { getDB, save } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const now = () => new Date().toISOString();

// ── CRUD helpers ──────────────────────────────────────────────────

const findById = (collection, id) => {
  const db = getDB();
  return db[collection]?.find(r => r.id === id) || null;
};

const findOne = (collection, filters = {}) => {
  const db = getDB();
  const keys = Object.keys(filters);
  return db[collection]?.find(r =>
    keys.every(k => r[k] == filters[k])
  ) || null;
};

const find = (collection, filters = {}, opts = {}) => {
  const db = getDB();
  let results = db[collection] || [];

  // Filter
  const keys = Object.keys(filters).filter(k => filters[k] !== undefined && filters[k] !== null);
  if (keys.length > 0) {
    results = results.filter(r => keys.every(k => r[k] == filters[k]));
  }

  // Sort
  if (opts.orderBy) {
    results = [...results].sort((a, b) => {
      const dir = opts.orderDir === 'asc' ? 1 : -1;
      if (a[opts.orderBy] < b[opts.orderBy]) return -1 * dir;
      if (a[opts.orderBy] > b[opts.orderBy]) return 1 * dir;
      return 0;
    });
  } else {
    results = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Offset & Limit
  if (opts.offset) results = results.slice(opts.offset);
  if (opts.limit)  results = results.slice(0, opts.limit);

  return results;
};

const countDocuments = (collection, filters = {}) => {
  return find(collection, filters).length;
};

const create = (collection, data) => {
  const db = getDB();
  const id  = uuidv4();
  const timestamp = now();
  const doc = { ...data, id, _id: id, createdAt: timestamp, updatedAt: timestamp };
  if (!db[collection]) db[collection] = [];
  db[collection].push(doc);
  save();
  return doc;
};

const updateById = (collection, id, data) => {
  const db = getDB();
  const idx = db[collection]?.findIndex(r => r.id === id);
  if (idx === -1 || idx === undefined) return null;
  db[collection][idx] = { ...db[collection][idx], ...data, updatedAt: now() };
  save();
  return db[collection][idx];
};

const deleteById = (collection, id) => {
  const db = getDB();
  if (!db[collection]) return;
  db[collection] = db[collection].filter(r => r.id !== id);
  save();
};

module.exports = { findById, findOne, find, countDocuments, create, updateById, deleteById };
