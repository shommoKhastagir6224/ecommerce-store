import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiShare2, FiStar, FiTruck, FiShield, FiRefreshCw, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import { productAPI, reviewAPI } from '../api';
import { addToCart, toggleWishlist, toggleCart, selectWishlist, selectUser } from '../context/store';
import { ProductCard, SkeletonCard, RatingStars } from '../components/ui';
import toast from 'react-hot-toast';

/* ── Review Card ── */
function ReviewCard({ review }) {
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name||'U')}&background=e63946&color=fff&size=40`} alt="" className="w-10 h-10 rounded-full flex-shrink-0"/>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{review.user?.name}</p>
            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <RatingStars rating={review.rating} size={12}/>
          {review.title && <p className="font-semibold text-sm mt-1">{review.title}</p>}
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Add Review Form ── */
function ReviewForm({ productId, onAdded }) {
  const user = useSelector(selectUser);
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const [title,   setTitle]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setLoading(true);
    try {
      await reviewAPI.create({ product: productId, rating, comment, title });
      toast.success('Review submitted!');
      setComment(''); setTitle(''); setRating(5);
      onAdded();
    } catch(err) { toast.error(err.response?.data?.message || 'Error submitting review'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <h4 className="font-display font-bold text-gray-800">Write a Review</h4>
      <div>
        <label className="input-label">Rating</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(s=>(
            <button key={s} type="button" onClick={()=>setRating(s)}>
              <FiStar size={24} className={s<=rating?'text-yellow-400':'text-gray-300'} style={{fill: s<=rating?'#facc15':'none'}}/>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="input-label">Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Short review title" className="input-field"/>
      </div>
      <div>
        <label className="input-label">Comment *</label>
        <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} required placeholder="Share your experience..." className="input-field resize-none"/>
      </div>
      <button type="submit" disabled={loading} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default function ProductDetail() {
  const { slug }   = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector(selectUser);
  const wishlist   = useSelector(selectWishlist);

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeImg,setActiveImg]= useState(0);
  const [qty,      setQty]      = useState(1);
  const [color,    setColor]    = useState('');
  const [size,     setSize]     = useState('');
  const [tab,      setTab]      = useState('desc');
  const [zoomed,   setZoomed]   = useState(false);

  const isWishlisted = product && wishlist.some(w=>w._id===product._id);

  useEffect(()=>{
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await productAPI.getBySlug(slug);
        setProduct(data);
        setColor(data.colors?.[0]?.name || '');
        setSize(data.sizes?.[0]  || '');
        const [rRes, rvRes] = await Promise.all([
          productAPI.getRelated(data._id),
          reviewAPI.getByProduct(data._id),
        ]);
        setRelated(rRes.data);
        setReviews(rvRes.data);
      } catch { navigate('/404'); }
      finally { setLoading(false); }
    };
    fetchProduct();
    window.scrollTo(0,0);
  },[slug, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.colors?.length && !color) { toast.error('Please select a color'); return; }
    if (product.sizes?.length  && !size)  { toast.error('Please select a size');  return; }
    dispatch(addToCart({ ...product, qty, color, size }));
    dispatch(toggleCart());
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-3"><div className="skeleton aspect-square rounded-2xl"/><div className="grid grid-cols-4 gap-2">{[...Array(4)].map((_,i)=><div key={i} className="skeleton aspect-square rounded-xl"/>)}</div></div>
      <div className="space-y-4">{[...Array(6)].map((_,i)=><div key={i} className="skeleton h-8 rounded-lg" style={{width:`${[80,60,40,55,70,45][i]}%`}}/>)}</div>
    </div>
  );
  if (!product) return null;

  const images = [product.thumbnail, ...(product.images?.map(img=>img.url)||[])].filter(Boolean);
  const effectivePrice = product.discountPrice>0 ? product.discountPrice : product.price;
  const discount = product.discountPrice>0 ? Math.round(((product.price-product.discountPrice)/product.price)*100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary">Home</Link><FiChevronRight size={12}/>
        <Link to="/products" className="hover:text-primary">Products</Link><FiChevronRight size={12}/>
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="space-y-3">
          <motion.div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square cursor-zoom-in" onClick={()=>setZoomed(!zoomed)}>
            <AnimatePresence mode="wait">
              <motion.img key={activeImg} initial={{opacity:0,scale:1.05}} animate={{opacity:1,scale:zoomed?1.5:1}} exit={{opacity:0}} transition={{duration:0.3}} src={images[activeImg]||`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80`} alt={product.name} className="w-full h-full object-cover" style={{transformOrigin:'center'}}/>
            </AnimatePresence>
            {discount>0 && <span className="absolute top-3 left-3 badge bg-primary text-white px-3 py-1">-{discount}%</span>}
          </motion.div>
          {images.length>1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0,4).map((img,i)=>(
                <button key={i} onClick={()=>setActiveImg(i)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImg===i?'border-primary scale-95':'border-transparent hover:border-gray-300'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">
          {product.brand && <p className="text-xs font-bold text-primary uppercase tracking-widest">{product.brand}</p>}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-secondary leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3">
            <RatingStars rating={product.ratings} size={16} showCount count={product.numReviews}/>
            <span className="text-sm text-gray-400">|</span>
            <span className={`text-sm font-medium ${product.stock>0?'text-green-600':'text-red-500'}`}>{product.stock>0?`${product.stock} in stock`:'Out of Stock'}</span>
          </div>

          <div className="flex items-end gap-3">
            <span className="font-display text-4xl font-bold text-primary">৳{effectivePrice?.toLocaleString()}</span>
            {discount>0 && <>
              <span className="text-gray-400 text-xl line-through">৳{product.price?.toLocaleString()}</span>
              <span className="badge bg-green-100 text-green-700 text-sm">Save {discount}%</span>
            </>}
          </div>

          {product.shortDesc && <p className="text-gray-600 leading-relaxed">{product.shortDesc}</p>}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Color: <span className="text-primary">{color}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c=>(
                  <button key={c.name} onClick={()=>setColor(c.name)} className={`w-8 h-8 rounded-full border-2 transition-all ${color===c.name?'border-primary scale-110 shadow-md':'border-transparent hover:border-gray-300'}`} style={{background:c.hex||'#ccc'}} title={c.name}/>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Size: <span className="text-primary">{size}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s=>(
                  <button key={s} onClick={()=>setSize(s)} className={`min-w-[40px] px-3 py-2 border-2 rounded-lg text-sm font-semibold transition-all ${size===s?'border-primary bg-primary text-white':'border-gray-200 hover:border-primary hover:text-primary'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-gray-700">Quantity:</p>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><FiMinus size={14}/></button>
              <span className="px-4 py-2 font-bold text-sm min-w-[50px] text-center">{qty}</span>
              <button onClick={()=>setQty(q=>Math.min(product.stock||99,q+1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><FiPlus size={14}/></button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={handleAddToCart} disabled={product.stock===0} className="btn-outline flex-1 flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"><FiShoppingCart/>Add to Cart</button>
            <button onClick={handleBuyNow} disabled={product.stock===0} className="btn-primary flex-1 py-3.5 disabled:opacity-50">Buy Now</button>
            <button onClick={()=>{ dispatch(toggleWishlist(product)); toast.success(isWishlisted?'Removed from wishlist':'Added to wishlist'); }} className={`p-3.5 border-2 rounded-xl transition-all ${isWishlisted?'border-primary bg-red-50 text-primary':'border-gray-200 hover:border-primary hover:text-primary'}`}><FiHeart size={18} style={{fill:isWishlisted?'currentColor':'none'}}/></button>
            <button onClick={()=>{ navigator.share?.({title:product.name, url:window.location.href}); }} className="p-3.5 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"><FiShare2 size={18}/></button>
          </div>

          {/* Trust info */}
          <div className="border border-gray-100 rounded-2xl p-4 grid grid-cols-3 gap-3">
            {[{Icon:FiTruck,l:'Free Delivery',s:'On orders ৳999+'},{Icon:FiShield,l:'Secure Payment',s:'100% protected'},{Icon:FiRefreshCw,l:'Easy Returns',s:'7 day policy'}].map(({Icon,l,s})=>(
              <div key={l} className="flex flex-col items-center text-center gap-1"><Icon size={18} className="text-primary"/><p className="text-xs font-semibold text-gray-700">{l}</p><p className="text-[10px] text-gray-400">{s}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-gray-200 mb-6">
          {[['desc','Description'],['specs','Specs'],['reviews',`Reviews (${reviews.length})`]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${tab===id?'border-primary text-primary':'border-transparent text-gray-500 hover:text-gray-800'}`}>{label}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}>
            {tab==='desc' && <div className="prose max-w-none text-gray-600 leading-relaxed"><p>{product.description}</p></div>}
            {tab==='specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[['Brand',product.brand],['Category',product.category?.name],['Delivery',product.deliveryDays],['Charge',`৳${product.deliveryCharge||0}`],['Weight',product.weight?`${product.weight}g`:'-'],['Stock',`${product.stock} units`]].filter(([,v])=>v).map(([k,v])=>(
                  <div key={k} className="flex justify-between py-2.5 px-4 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-800">{v}</span></div>
                ))}
              </div>
            )}
            {tab==='reviews' && (
              <div className="space-y-6">
                {user && <ReviewForm productId={product._id} onAdded={()=>reviewAPI.getByProduct(product._id).then(r=>setReviews(r.data))}/>}
                {reviews.length===0 ? <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
                  : <div className="space-y-3">{reviews.map(r=><ReviewCard key={r._id} review={r}/>)}</div>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="section-title mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {related.map((p,i)=><ProductCard key={p._id} product={p} index={i}/>)}
          </div>
        </div>
      )}
    </div>
  );
}
