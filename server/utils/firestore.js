// server/utils/firestore.js
// Helper functions to make Firestore feel like Mongoose

const { getDB } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// ── Generic CRUD helpers ─────────────────────────────────────────────────────

const col = (name) => getDB().collection(name);

// findById
const findById = async (collection, id) => {
  const doc = await col(collection).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, _id: doc.id, ...doc.data() };
};

// findOne by field
const findOne = async (collection, filters = {}) => {
  let ref = col(collection);
  for (const [k, v] of Object.entries(filters)) {
    ref = ref.where(k, '==', v);
  }
  const snap = await ref.limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, _id: doc.id, ...doc.data() };
};

// find with optional filters
const find = async (collection, filters = {}, opts = {}) => {
  let ref = col(collection);
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null) ref = ref.where(k, '==', v);
  }
  if (opts.orderBy) ref = ref.orderBy(opts.orderBy, opts.orderDir || 'desc');
  if (opts.limit)   ref = ref.limit(opts.limit);
  if (opts.offset)  ref = ref.offset(opts.offset);
  const snap = await ref.get();
  return snap.docs.map((d) => ({ id: d.id, _id: d.id, ...d.data() }));
};

// count
const countDocuments = async (collection, filters = {}) => {
  let ref = col(collection);
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined) ref = ref.where(k, '==', v);
  }
  const snap = await ref.count().get();
  return snap.data().count;
};

// create
const create = async (collection, data) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const doc = { ...data, createdAt: now, updatedAt: now };
  await col(collection).doc(id).set(doc);
  return { id, _id: id, ...doc };
};

// update
const updateById = async (collection, id, data) => {
  const now = new Date().toISOString();
  await col(collection).doc(id).update({ ...data, updatedAt: now });
  return findById(collection, id);
};

// delete
const deleteById = async (collection, id) => {
  await col(collection).doc(id).delete();
};

// batch write helper
const batch = () => getDB().batch();

module.exports = {
  col, findById, findOne, find,
  countDocuments, create, updateById, deleteById, batch,
};
