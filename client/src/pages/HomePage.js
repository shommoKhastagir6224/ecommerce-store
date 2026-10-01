import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiClock, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { productAPI, categoryAPI, bannerAPI } from '../api';
import { ProductCard, SkeletonCard } from '../components/ui';

/* ── Countdown Timer ── */
function Countdown({ endTime }) {
  const [time, setTime] = useState({ h:0, m:0, s:0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endTime) - new Date());
      setTime({ h: Math.floor(diff/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  const pad = n => String(n).padStart(2,'0');
  return (
    <div className="flex items-center gap-1.5">
      {[time.h, time.m, time.s].map((v,i)=>(
        <React.Fragment key={i}>
          {i>0 && <span className="text-white font-bold text-lg animate-pulse">:</span>}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-2 py-1 min-w-[40px] text-center">
            <span className="font-display font-bold text-white text-lg">{pad(v)}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Hero Slider ── */
const DEFAULT_SLIDES = [
  { title:'Premium Fashion Collection', subtitle:'Up to 50% OFF on top brands', cta:'Shop Now', bg:'from-slate-900 via-red-900 to-slate-800', image:'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80', link:'/products?category=women' },
  { title:'Latest Electronics', subtitle:'Smartphones, Laptops & More', cta:'Explore', bg:'from-blue-900 via-indigo-900 to-slate-900', image:'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80', link:'/products?category=electronics' },
  { title:'Baby & Kids Special', subtitle:'Safe, Fun & Affordable Products', cta:'Shop Baby', bg:'from-pink-800 via-rose-700 to-orange-700', image:'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', link:'/products?category=baby' },
];

function HeroSlider({ banners }) {
  const [idx, setIdx] = useState(0);
  const slides = banners?.filter(b=>b.type==='hero').length > 0
    ? banners.filter(b=>b.type==='hero').map(b=>({ title:b.title, subtitle:b.subtitle, cta:'Shop Now', bg:'from-slate-900 via-red-900 to-slate-800', image:b.image, link:b.link||'/products' }))
    : DEFAULT_SLIDES;

  const next = useCallback(()=>setIdx(i=>(i+1)%slides.length),[slides.length]);
  useEffect(()=>{ const t=setInterval(next, 5000); return()=>clearInterval(t); },[next]);

  return (
    <div className="relative overflow-hidden rounded-2xl aspect-[21/9] min-h-[280px] lg:mr-10 max-h-[480px]">
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{opacity:0,x:60}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-60}} transition={{duration:0.5}} className={`absolute inset-0 bg-gradient-to-r ${slides[idx].bg} flex items-center`}>
          <img src={slides[idx].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"/>
          <div className="relative z-10 px-8 sm:px-14 max-w-xl">
            <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-yellow-300 text-sm font-semibold mb-2 tracking-wider uppercase">🔥 Special Offer</motion.p>
            <motion.h2 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight mb-3">{slides[idx].title}</motion.h2>
            <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="text-gray-200 text-base sm:text-lg mb-6">{slides[idx].subtitle}</motion.p>
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
              <Link to={slides[idx].link} className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base">{slides[idx].cta} <FiArrowRight/></Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_,i)=><button key={i} onClick={()=>setIdx(i)} className={`h-2 rounded-full transition-all ${i===idx?'bg-white w-6':'bg-white/40 w-2'}`}/>)}
      </div>
      {/* Arrows */}
      <button onClick={()=>setIdx(i=>(i-1+slides.length)%slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors z-20 text-lg">‹</button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors z-20 text-lg">›</button>
    </div>
  );
}

/* ── Category Grid ── */
const DEFAULT_CATS = [
  { name:'Men', icon:'👔', bg:'from-blue-500 to-blue-700',   slug:'men' },
  { name:'Women', icon:'👗', bg:'from-pink-500 to-rose-600',  slug:'women' },
  { name:'Baby', icon:'🍼', bg:'from-yellow-400 to-orange-500', slug:'baby' },
  { name:'Electronics', icon:'📱', bg:'from-gray-700 to-gray-900', slug:'electronics' },
  { name:'Home & Living', icon:'🏠', bg:'from-green-500 to-teal-600', slug:'home' },
];

function CategoryGrid({ categories }) {
  const display = categories?.length > 0
    ? categories.map(c=>({ name:c.name, icon:c.icon, bg:'from-red-500 to-rose-600', slug:c.slug, id:c._id }))
    : DEFAULT_CATS;
  const gradients = ['from-blue-500 to-indigo-600','from-pink-500 to-rose-600','from-yellow-400 to-orange-500','from-gray-600 to-gray-800','from-green-500 to-teal-600','from-purple-500 to-violet-600'];
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3">
      {display.slice(0,6).map((cat,i)=>(
        <Link key={cat.slug||cat.name} to={cat.id?`/products?category=${cat.id}`:`/products?category=${cat.slug}`} className="group">
          <motion.div whileHover={{scale:1.05,y:-4}} className={`bg-gradient-to-br ${gradients[i%gradients.length]} rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer shadow-md`}>
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-white font-semibold text-xs text-center leading-tight">{cat.name}</span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

/* ── Trust Badges ── */
function TrustBadges() {
  const items = [
    { icon:FiShield,      label:'100% Secure',    sub:'Safe payments' },
    { icon:FiRefreshCw,   label:'Easy Returns',   sub:'7-day return policy' },
    { icon:FiHeadphones,  label:'24/7 Support',   sub:'Always here to help' },
    { icon:FiClock,       label:'Fast Delivery',  sub:'3-5 business days' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map(item=>(
        <motion.div key={item.label} whileHover={{y:-4}} className="card p-4 flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><item.icon size={18} className="text-primary"/></div>
          <p className="font-semibold text-sm text-gray-800">{item.label}</p>
          <p className="text-xs text-gray-400">{item.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, sub, link, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-subtitle">{sub}</p>}
      </div>
      {link && <Link to={link} className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">{linkLabel||'View All'}<FiArrowRight/></Link>}
    </div>
  );
}

/* ── Main HomePage ── */
export default function HomePage() {
  const navigate = useNavigate();
  const [banners,    setBanners]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured,   setFeatured]   = useState([]);
  const [flashSale,  setFlashSale]  = useState([]);
  const [newArrivals,setNewArrivals]= useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(()=>{
    const fetchAll = async () => {
      try {
        const [bRes, cRes, fRes, fsRes, naRes] = await Promise.all([
          bannerAPI.getAll(),
          categoryAPI.getAll(),
          productAPI.getAll({ featured:true, limit:8 }),
          productAPI.getFlashSale(),
          productAPI.getAll({ newArrival:true, limit:8 }),
        ]);
        setBanners(bRes.data);
        setCategories(cRes.data);
        setFeatured(fRes.data.products);
        setFlashSale(fsRes.data);
        setNewArrivals(naRes.data.products);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  },[]);

  return (
    <div className="space-y-10 pb-10">
      {/* Hero */}
      <section className="px-4 pt-4">
        <HeroSlider banners={banners}/>
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4"><TrustBadges/></section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionHeader title="Shop by Category" sub="Find exactly what you're looking for"/>
        <CategoryGrid categories={categories}/>
      </section>

      {/* Flash Sale */}
      {(loading || flashSale.length > 0) && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-1">🔥 Flash Sale</h2>
              <p className="text-orange-100 text-sm">Limited time offer — hurry up!</p>
            </div>
            <Countdown endTime={new Date(Date.now() + 8*3600*1000)}/>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loading ? [...Array(5)].map((_,i)=><SkeletonCard key={i}/>) : flashSale.slice(0,5).map((p,i)=><ProductCard key={p._id} product={p} index={i}/>)}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionHeader title="Featured Products" sub="Hand-picked by our team" link="/products?featured=true" linkLabel="View All"/>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading ? [...Array(10)].map((_,i)=><SkeletonCard key={i}/>) : featured.map((p,i)=><ProductCard key={p._id} product={p} index={i}/>)}
        </div>
      </section>

      {/* Banner strip */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { bg:'from-blue-600 to-indigo-800', title:"Men's Collection", sub:'Exclusive styles for every occasion', link:'/products?category=men' },
            { bg:'from-pink-500 to-rose-700',   title:"Women's Fashion",  sub:'Trending looks, premium quality',  link:'/products?category=women' },
          ].map(b=>(
            <Link key={b.title} to={b.link} className="block">
              <motion.div whileHover={{scale:1.02}} className={`bg-gradient-to-r ${b.bg} rounded-2xl p-8 text-white relative overflow-hidden min-h-[140px] flex items-center`}>
                <div>
                  <h3 className="font-display text-2xl font-bold mb-1">{b.title}</h3>
                  <p className="text-white/75 text-sm mb-4">{b.sub}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors">Shop Now <FiArrowRight size={14}/></span>
                </div>
                <div className="absolute right-4 bottom-0 opacity-10 text-[100px] select-none">{b.title.includes("Men") ? '👔' : '👗'}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {(loading || newArrivals.length > 0) && (
        <section className="max-w-7xl mx-auto px-4">
          <SectionHeader title="New Arrivals" sub="Fresh drops every week" link="/products?newArrival=true" linkLabel="See All New"/>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loading ? [...Array(8)].map((_,i)=><SkeletonCard key={i}/>) : newArrivals.slice(0,8).map((p,i)=><ProductCard key={p._id} product={p} index={i}/>)}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-secondary to-primary rounded-2xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-2">Stay in the Loop</h2>
          <p className="text-gray-200 mb-6">Subscribe to get exclusive deals, new arrivals & more</p>
          <form onSubmit={e=>{ e.preventDefault(); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-xl border-0 focus:outline-none text-gray-800 text-sm"/>
            <button type="submit" className="bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
