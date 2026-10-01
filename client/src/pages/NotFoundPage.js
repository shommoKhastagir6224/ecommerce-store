import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { size: 320, top: '5%',  left: '10%', delay: 0,   color: 'rgba(230,57,70,0.06)' },
          { size: 280, top: '60%', left: '70%', delay: 1.5, color: 'rgba(29,53,87,0.06)' },
          { size: 200, top: '40%', left: '5%',  delay: 3,   color: 'rgba(244,162,97,0.07)' },
        ].map((blob, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, background: blob.color, filter: 'blur(60px)' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: blob.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Big 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <span
              className="font-display font-bold select-none"
              style={{
                fontSize: 'clamp(100px, 20vw, 180px)',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #e63946 0%, #f4a261 50%, #1d3557 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 20px rgba(230,57,70,0.15))',
              }}
            >
              404
            </span>
            {/* Floating cart emoji */}
            <motion.span
              className="absolute -top-4 -right-8 text-4xl"
              animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🛒
            </motion.span>
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="space-y-4 mb-10"
        >
          <h1 className="font-display text-3xl font-bold text-secondary">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
            Looks like this page went out of stock. The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Fun code block */}
          <div className="bg-gray-900 text-green-400 text-xs font-mono rounded-xl px-5 py-3 inline-block text-left">
            <span className="text-gray-500">{'// '}</span>
            <span className="text-yellow-400">Error</span>
            <span className="text-white">: </span>
            <span>Page not found in database</span>
            <br />
            <span className="text-gray-500">{'// '}</span>
            <span className="text-blue-400">status</span>
            <span className="text-white">: </span>
            <span className="text-red-400">404</span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="btn-outline flex items-center justify-center gap-2 px-6 py-3"
          >
            <FiArrowLeft size={16} /> Go Back
          </button>
          <Link
            to="/"
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
          >
            <FiHome size={16} /> Back to Home
          </Link>
          <Link
            to="/products"
            className="btn-secondary flex items-center justify-center gap-2 px-6 py-3"
          >
            <FiSearch size={16} /> Browse Products
          </Link>
        </motion.div>

        {/* Suggestion links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10"
        >
          <p className="text-sm text-gray-400 mb-3">You might be looking for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              ['/products?featured=true', '⭐ Featured'],
              ['/products?flashSale=true', '🔥 Flash Sale'],
              ['/products?newArrival=true', '✨ New Arrivals'],
              ['/account', '👤 My Account'],
              ['/account/orders', '📦 My Orders'],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-primary text-gray-600 rounded-full text-sm font-medium transition-all hover:scale-105"
              >
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
