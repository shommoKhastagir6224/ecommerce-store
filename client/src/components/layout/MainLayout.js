import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
  FiChevronDown, FiChevronRight, FiPhone, FiMail, FiPackage,
  FiLogOut, FiSettings, FiTruck
} from 'react-icons/fi';
import {
  selectUser, selectCartCount, selectCart, selectCartTotal,
  toggleCart, closeAll, logout, removeFromCart, updateQty
} from '../../context/store';
import { categoryAPI } from '../../api';
import toast from 'react-hot-toast';

/* ── Top offer bar ── */
function OfferBar() {
  const offers = ['🔥 50% OFF on Selected Items', '🚚 Free Delivery over ৳999', '✨ New Arrivals Every Week', '💳 Pay with bKash & Get 5% Cashback'];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i+1)%offers.length), 3000); return ()=>clearInterval(t); }, []);
  return (
    <div className="bg-gradient-to-r from-secondary to-primary text-white py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-4">
          <a href="tel:+8801860024584" className="hidden sm:flex items-center gap-1 hover:text-yellow-300 transition-colors"><FiPhone size={12}/> +880 1860-024584</a>
          <a href="mailto:shommokhastagir00@gmail.com" className="hidden md:flex items-center gap-1 hover:text-yellow-300 transition-colors"><FiMail size={12}/> shommokhastagir00@gmail.com</a>
        </div>
        <AnimatePresence mode="wait">
          <motion.span key={idx} initial={{y:16,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-16,opacity:0}} transition={{duration:0.35}} className="font-semibold">{offers[idx]}</motion.span>
        </AnimatePresence>
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="opacity-75">Download App</span>
          <span className="opacity-75">|</span>
          <Link to="/account/orders" className="hover:text-yellow-300">Track Order</Link>
        </div>
      </div>
    </div>
  );
}

/* ── Cart Drawer ── */
function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartOpen = useSelector(s=>s.ui.cartOpen);
  const items    = useSelector(selectCart);
  const total    = useSelector(selectCartTotal);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>dispatch(closeAll())} className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'tween',duration:0.3}} className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display text-xl font-bold text-secondary">Shopping Cart <span className="text-primary ml-1">({items.length})</span></h2>
              <button onClick={()=>dispatch(closeAll())} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FiX size={20}/></button>
            </div>
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
                <FiShoppingCart size={56} className="opacity-30"/>
                <p className="font-medium text-lg">Your cart is empty</p>
                <button onClick={()=>{dispatch(closeAll()); navigate('/products');}} className="btn-primary text-sm px-6 py-2.5">Continue Shopping</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map((item,i)=>(
                    <motion.div key={`${item._id}-${item.color}-${item.size}`} layout initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}} className="flex gap-3 bg-gray-50 rounded-2xl p-3">
                      <img src={item.thumbnail||`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=60`} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                        {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                        {item.size  && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={()=>item.qty<=1?dispatch(removeFromCart(item)):dispatch(updateQty({...item,qty:item.qty-1}))} className="px-2 py-1 hover:bg-gray-200 text-sm transition-colors">-</button>
                            <span className="px-3 py-1 text-sm font-semibold">{item.qty}</span>
                            <button onClick={()=>dispatch(updateQty({...item,qty:Math.min(item.qty+1,item.stock||99)}))} className="px-2 py-1 hover:bg-gray-200 text-sm transition-colors">+</button>
                          </div>
                          <span className="font-bold text-primary text-sm">৳{((item.discountPrice||item.price)*item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={()=>dispatch(removeFromCart(item))} className="text-gray-400 hover:text-red-500 transition-colors self-start p-1"><FiX size={14}/></button>
                    </motion.div>
                  ))}
                </div>
                <div className="border-t p-5 space-y-4">
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
                  <button onClick={()=>{dispatch(closeAll()); navigate('/checkout');}} className="btn-primary w-full py-3.5 text-base">Proceed to Checkout →</button>
                  <button onClick={()=>{dispatch(closeAll()); navigate('/cart');}} className="btn-outline w-full py-3 text-sm">View Full Cart</button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Category Sidebar ── */
function CategorySidebar({ categories, open, onClose }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/40 z-30 lg:hidden"/>
          <motion.aside initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'tween',duration:0.28}} className="fixed left-0 top-0 h-full w-72 bg-white z-40 shadow-2xl overflow-y-auto lg:static lg:shadow-none">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary to-primary text-white">
              <span className="font-bold text-base flex items-center gap-2">☰ All Categories</span>
              <button onClick={onClose} className="lg:hidden"><FiX/></button>
            </div>
            <div className="py-2">
              {categories.map(cat=>(
                <div key={cat._id}>
                  <button onClick={()=>setExpanded(expanded===cat._id?null:cat._id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 hover:text-primary transition-colors text-sm font-medium text-gray-700 group">
                    <span className="flex items-center gap-2"><span className="text-base">{cat.icon}</span>{cat.name}</span>
                    <FiChevronDown className={`transition-transform text-gray-400 ${expanded===cat._id?'rotate-180':''}`} size={14}/>
                  </button>
                  <AnimatePresence>
                    {expanded===cat._id && cat.subcategories?.length>0 && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden bg-gray-50">
                        {cat.subcategories.map(sub=>(
                          <button key={sub.slug} onClick={()=>{navigate(`/products?category=${cat._id}&subcategory=${sub.slug}`); onClose();}} className="w-full text-left flex items-center gap-2 pl-10 pr-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-red-50 transition-colors">
                            <FiChevronRight size={12}/>{sub.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Main Navbar ── */
function Navbar({ categories, catOpen, setCatOpen }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector(selectUser);
  const cartCount = useSelector(selectCartCount);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const fn = ()=>setScrolled(window.scrollY>50);
    window.addEventListener('scroll',fn);
    return ()=>window.removeEventListener('scroll',fn);
  },[]);

  useEffect(()=>{
    const fn=(e)=>{ if(menuRef.current&&!menuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown',fn);
    return ()=>document.removeEventListener('mousedown',fn);
  },[]);

  const handleSearch=(e)=>{ e.preventDefault(); if(search.trim()) { navigate(`/products?keyword=${encodeURIComponent(search.trim())}`); setSearch(''); }};
  const handleLogout=()=>{ dispatch(logout()); toast.success('Logged out'); navigate('/'); };

  return (
    <header className={`sticky top-0 z-30 bg-white transition-shadow duration-300 ${scrolled?'shadow-premium':''}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Hamburger + Logo */}
        <button onClick={()=>setCatOpen(!catOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:flex hidden"><FiMenu size={22}/></button>
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">SS</span>
          </div>
          <span className="font-display font-bold text-xl text-secondary hidden sm:block">Shommo<span className="text-primary">Store</span></span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2">
          <div className="relative">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products, brands..." className="w-full pl-4 pr-12 py-2.5 rounded-xl border-2 border-gray-100 focus:border-primary focus:outline-none text-sm transition-colors bg-gray-50 focus:bg-white"/>
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-lg hover:bg-primary-dark transition-colors"><FiSearch size={14}/></button>
          </div>
        </form>

        {/* Action icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link to="/account/wishlist" className="p-2.5 hover:bg-red-50 hover:text-primary rounded-xl transition-colors relative">
            <FiHeart size={20}/>
          </Link>
          <button onClick={()=>dispatch(toggleCart())} className="p-2.5 hover:bg-red-50 hover:text-primary rounded-xl transition-colors relative">
            <FiShoppingCart size={20}/>
            {cartCount>0&&<span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount>9?'9+':cartCount}</span>}
          </button>

          {/* User menu */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={()=>setUserMenu(!userMenu)} className="flex items-center gap-2 pl-1 pr-3 py-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                <img src={user.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e63946&color=fff`} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"/>
                <span className="text-sm font-medium hidden sm:block max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                <FiChevronDown size={14} className={`transition-transform ${userMenu?'rotate-180':''}`}/>
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div initial={{opacity:0,y:8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:0.95}} className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-hover border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-red-50 border-b">
                      <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${user.role==='admin'?'bg-purple-100 text-purple-700':user.role==='staff'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>{user.role.toUpperCase()}</span>
                    </div>
                    <div className="p-2">
                      {user.role==='admin'&&<Link to="/admin" onClick={()=>setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"><FiSettings size={14}/>Admin Panel</Link>}
                      {user.role==='staff'&&<Link to="/staff" onClick={()=>setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"><FiTruck size={14}/>Staff Panel</Link>}
                      <Link to="/account" onClick={()=>setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"><FiUser size={14}/>My Account</Link>
                      <Link to="/account/orders" onClick={()=>setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"><FiPackage size={14}/>My Orders</Link>
                      <hr className="my-1"/>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><FiLogOut size={14}/>Logout</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"><FiUser size={14}/>Login</Link>
          )}
          {/* Mobile menu */}
          <button onClick={()=>setCatOpen(!catOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><FiMenu size={20}/></button>
        </div>
      </div>
      {/* Nav links row */}
      <nav className="hidden lg:flex items-center gap-0 border-t border-gray-100 bg-white px-4 max-w-7xl mx-auto">
        {[['/',`🏠 Home`],['/products','All Products'],['/products?newArrival=true','New Arrivals'],['/products?flashSale=true','🔥 Flash Sale'],['/products?featured=true','Featured']].map(([to,label])=>(
          <Link key={to} to={to} className="nav-link px-4 py-2.5 text-sm whitespace-nowrap">{label}</Link>
        ))}
      </nav>
    </header>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="bg-secondary text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center"><span className="text-white font-bold text-sm">SS</span></div>
            <span className="font-display font-bold text-xl text-white">Shommo<span className="text-primary">Store</span></span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">Bangladesh's premium e-commerce destination. Quality products, fast delivery, trusted service.</p>
          <div className="flex gap-3 mt-4">
            {['f','in','tw','yt'].map(s=><a key={s} href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center text-xs font-bold transition-colors">{s}</a>)}
          </div>
        </div>
        {[
          {title:'Quick Links', links:[['/',`Home`],['/products','Products'],['/account','My Account'],['/account/orders','Orders']]},
          {title:'Categories', links:[['/products?category=men','Men'],['/products?category=women','Women'],['/products?category=electronics','Electronics'],['/products?category=baby','Baby']]},
          {title:'Support', links:[['#','About Us'],['#','Contact'],['#','FAQ'],['#','Return Policy']]},
        ].map(col=>(
          <div key={col.title}>
            <h4 className="font-semibold text-white mb-4">{col.title}</h4>
            <ul className="space-y-2">{col.links.map(([to,label])=><li key={label}><Link to={to} className="text-sm text-gray-400 hover:text-primary transition-colors">{label}</Link></li>)}</ul>
          </div>
        ))}
        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <div className="space-y-3 text-sm text-gray-400">
            <p className="flex items-center gap-2"><FiPhone size={14}/> +880 1860-024584</p>
            <p className="flex items-center gap-2"><FiMail size={14}/> shommokhastagir00@gmail.com</p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Newsletter</p>
            <div className="flex gap-2">
              <input placeholder="Your email" className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"/>
              <button className="bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors">Go</button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Shommo Store. Built with ❤️ in Bangladesh.
      </div>
    </footer>
  );
}

/* ── Main Layout ── */
export default function MainLayout() {
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(()=>{ categoryAPI.getAll().then(r=>setCategories(r.data)).catch(()=>{}); },[]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OfferBar/>
      <Navbar categories={categories} catOpen={catOpen} setCatOpen={setCatOpen}/>
      <div className="flex flex-1">
        <CategorySidebar categories={categories} open={catOpen} onClose={()=>setCatOpen(false)}/>
        <main className="flex-1 min-w-0"><Outlet/></main>
      </div>
      <Footer/>
      <CartDrawer/>
    </div>
  );
}
