// ── productRoutes.js ────────────────────────────────────────────────────────
const express    = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getProducts, getProductById, getProductBySlug,
  createProduct, updateProduct, deleteProduct,
  getRelatedProducts, getFlashSaleProducts, getTopSelling,
} = require('../controllers/productController');

const productRouter = express.Router();
productRouter.get('/',               getProducts);
productRouter.get('/flash-sale',     getFlashSaleProducts);
productRouter.get('/top-selling',    getTopSelling);
productRouter.get('/slug/:slug',     getProductBySlug);
productRouter.get('/related/:id',    getRelatedProducts);
productRouter.get('/:id',            getProductById);
productRouter.post('/',    protect, admin, createProduct);
productRouter.put('/:id',  protect, admin, updateProduct);
productRouter.delete('/:id', protect, admin, deleteProduct);

module.exports = productRouter;
