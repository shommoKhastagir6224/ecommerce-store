import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { addToCart, toggleWishlist, toggleCart, selectWishlist } from '../../context/store';
import toast from 'react-hot-toast';

/* ── Rating Stars ── */
export function RatingStars({ rating = 0, size = 14, showCount, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <FiStar key={s} size={size} className={s <= Math.round(rating) ? 'star-filled fill-yellow-400' : 'star-empty'} style={{ fill: s <= Math.round(rating) ? '#facc15' : 'none' }}/>
      ))}
      {showCount && <span className="text-xs text-gray-500 ml-1">({count || 0})</span>}
    </div>
  );
}

/* ── Status Badge ── */
export function StatusBadge({ status }) {
  const map = {
    pending:          'status-pending',
    processing:       'status-processing',
    shipped:          'status-shipped',
    out_for_delivery: 'status-delivering',
    delivered:        'status-delivered',
    cancelled:        'status-cancelled',
    paid:             'badge-green',
    failed:           'badge-red',
    refunded:         'badge-orange',
    active:           'badge-green',
    inactive:         'badge-red',
    user:             'badge-blue',
    staff:            'badge-orange',
    admin:            'badge bg-purple-100 text-purple-700',
  };
  const labels = { out_for_delivery: 'Out for Delivery' };
  return <span className={`badge ${map[status] || 'badge-blue'} capitalize`}>{labels[status] || status?.replace(/_/g,' ')}</span>;
}

/* ── Product Card ── */
export function ProductCard({ product, index = 0 }) {
  const dispatch  = useDispatch();
  const wishlist  = useSelector(selectWishlist);
  const isWishlisted = wishlist.some(w => w._id === product._id);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(addToCart({ ...product, qty: 1 }));
    dispatch(toggleCart());
    toast.success(`${product.name.slice(0,20)}... added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(toggleWishlist(product));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const discount = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: index * 0.05, duration: 0.4 }}>
      <Link to={`/products/${product.slug || product._id}`} className="product-card block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-gray-50">
          <img
            src={imgError ? `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=70` : product.thumbnail}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && <span className="badge bg-primary text-white text-[10px] px-2 py-0.5">-{discount}%</span>}
            {product.isFlashSale && <span className="badge bg-orange-500 text-white text-[10px] px-2 py-0.5">🔥 Sale</span>}
            {product.isNewArrival && <span className="badge bg-green-500 text-white text-[10px] px-2 py-0.5">New</span>}
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          {/* Hover actions */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <motion.button whileTap={{ scale:0.9 }} onClick={handleWishlist} className={`p-2.5 rounded-full shadow-md transition-colors ${isWishlisted ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:text-primary'}`}><FiHeart size={14} style={{fill: isWishlisted?'currentColor':'none'}}/></motion.button>
            {product.stock > 0 && <motion.button whileTap={{ scale:0.9 }} onClick={handleAddToCart} className="flex-1 bg-primary text-white py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-dark transition-colors"><FiShoppingCart size={12}/>Add to Cart</motion.button>}
            <Link to={`/products/${product.slug || product._id}`} onClick={e=>e.stopPropagation()} className="p-2.5 bg-white text-gray-600 hover:text-primary rounded-full shadow-md transition-colors"><FiEye size={14}/></Link>
          </div>
        </div>
        {/* Info */}
        <div className="p-3">
          {product.brand && <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{product.brand}</p>}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">{product.name}</h3>
          <RatingStars rating={product.ratings} size={11} showCount count={product.numReviews}/>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-bold text-primary">৳{effectivePrice?.toLocaleString()}</span>
            {discount > 0 && <span className="text-xs text-gray-400 line-through">৳{product.price?.toLocaleString()}</span>}
          </div>
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-[10px] text-orange-500 font-medium mt-1">Only {product.stock} left!</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Skeleton Card ── */
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square"/>
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-16 rounded"/>
        <div className="skeleton h-4 w-full rounded"/>
        <div className="skeleton h-4 w-3/4 rounded"/>
        <div className="skeleton h-3 w-20 rounded"/>
        <div className="skeleton h-5 w-24 rounded"/>
      </div>
    </div>
  );
}

/* ── Pagination ── */
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">← Prev</button>
      {nums.map(n => (
        <button key={n} onClick={() => onChange(n)} className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${n === page ? 'bg-primary text-white' : 'border hover:bg-gray-50'}`}>{n}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} className="px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">Next →</button>
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon: Icon = FiPackage, title = 'Nothing here', desc = '', action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={36} className="text-gray-300"/>
      </div>
      <h3 className="font-display text-xl font-bold text-gray-700 mb-2">{title}</h3>
      {desc && <p className="text-gray-400 text-sm max-w-xs mb-6">{desc}</p>}
      {action && <button onClick={action} className="btn-primary">{actionLabel}</button>}
    </div>
  );
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
      <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-display font-bold text-lg text-secondary">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><span className="text-xl leading-none">×</span></button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

/* ── Stat Card ── */
export function StatCard({ icon: Icon, label, value, sub, color = 'primary', trend }) {
  const colors = {
    primary:  { bg:'bg-red-50',   text:'text-primary',     icon:'bg-red-100' },
    blue:     { bg:'bg-blue-50',  text:'text-blue-600',    icon:'bg-blue-100' },
    green:    { bg:'bg-green-50', text:'text-green-600',   icon:'bg-green-100' },
    purple:   { bg:'bg-purple-50',text:'text-purple-600',  icon:'bg-purple-100' },
    orange:   { bg:'bg-orange-50',text:'text-orange-600',  icon:'bg-orange-100' },
  };
  const c = colors[color] || colors.primary;
  return (
    <div className={`card p-5 flex items-center gap-4 hover:shadow-hover transition-shadow`}>
      <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={c.text}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`font-display text-2xl font-bold ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {trend && <span className={`text-xs font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>{trend > 0 ? '↑' : '↓'}{Math.abs(trend)}%</span>}
    </div>
  );
}
