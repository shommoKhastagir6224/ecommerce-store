const asyncHandler = require('express-async-handler');
const { findById, findOne, create, updateById, find } = require('../utils/db');

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, brand, minPrice, maxPrice, featured, sort = 'newest', page = 1, limit = 12 } = req.query;

  let products = find('products', { isActive: 1 });

  if (keyword) {
    const kw = keyword.toLowerCase();
    products = products.filter(p => p.name?.toLowerCase().includes(kw) || p.description?.toLowerCase().includes(kw));
  }
  if (category)  products = products.filter(p => p.categoryId === category);
  if (brand)     products = products.filter(p => p.brand === brand);
  if (featured)  products = products.filter(p => p.isFeatured);
  if (minPrice)  products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice)  products = products.filter(p => p.price <= Number(maxPrice));

  const sortFns = {
    newest:       (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    'price-asc':  (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'rating-desc':(a, b) => (b.ratings || 0) - (a.ratings || 0),
  };
  products.sort(sortFns[sort] || sortFns.newest);

  const total    = products.length;
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const paged    = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ products: paged, page: pageNum, pages: Math.ceil(total / limitNum), total });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = findById('products', req.params.id);
  if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// GET /api/products/slug/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = findOne('products', { slug: req.params.slug });
  if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    isActive: 1,
    ratings: 0, numReviews: 0, sold: 0,
    slug: req.body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
  };
  const product = create('products', data);
  res.status(201).json(product);
});

// PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = updateById('products', req.params.id, req.body);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// DELETE /api/products/:id (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  updateById('products', req.params.id, { isActive: 0 });
  res.json({ message: 'Product removed' });
});

// GET /api/products/related/:id
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = findById('products', req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const related = find('products', { categoryId: product.categoryId, isActive: 1 }, { limit: 9 })
    .filter(p => p.id !== req.params.id).slice(0, 8);
  res.json(related);
});

// GET /api/products/flash-sale
const getFlashSaleProducts = asyncHandler(async (req, res) => {
  const products = find('products', { isFlashSale: 1, isActive: 1 }, { limit: 8 });
  res.json(products);
});

// GET /api/products/top-selling
const getTopSelling = asyncHandler(async (req, res) => {
  const products = find('products', { isActive: 1 }, { orderBy: 'sold', orderDir: 'desc', limit: 10 });
  res.json(products);
});

module.exports = {
  getProducts, getProductById, getProductBySlug,
  createProduct, updateProduct, deleteProduct,
  getRelatedProducts, getFlashSaleProducts, getTopSelling,
};
