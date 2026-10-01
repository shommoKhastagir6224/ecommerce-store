import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiImage, FiPercent, FiLogOut, FiMenu, FiX, FiTruck, FiCheckSquare, FiUser, FiHeart, FiMapPin, FiHome } from 'react-icons/fi';
import { logout, selectUser } from '../../context/store';
import toast from 'react-hot-toast';

function SidebarLink({ to, icon: Icon, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link to={to} onClick={onClick} className={active ? 'sidebar-item-active' : 'sidebar-item'}>
      <Icon size={16}/>{label}
    </Link>
  );
}

/* ── ADMIN LAYOUT ── */
export function AdminLayout() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector(selectUser);
  const [open, setOpen] = useState(false);

  const handleLogout = () => { dispatch(logout()); toast.success('Logged out'); navigate('/'); };

  const links = [
    { to:'/admin',              icon:FiGrid,       label:'Dashboard' },
    { to:'/admin/products',     icon:FiShoppingBag,label:'Products' },
    { to:'/admin/orders',       icon:FiPackage,    label:'Orders' },
    { to:'/admin/users',        icon:FiUsers,      label:'Users & Staff' },
    { to:'/admin/categories',   icon:FiTag,        label:'Categories' },
    { to:'/admin/coupons',      icon:FiPercent,    label:'Coupons' },
    { to:'/admin/banners',      icon:FiImage,      label:'Banners' },
  ];

  const Sidebar = ({ mobile }) => (
    <aside className={`${mobile ? 'w-64' : 'w-64 hidden lg:flex'} flex-col bg-white border-r border-gray-100 min-h-screen`}>
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <p className="font-display font-bold text-secondary text-sm">Admin Panel</p>
            <p className="text-xs text-gray-400 truncate max-w-[120px]">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l=><SidebarLink key={l.to} {...l} onClick={mobile?()=>setOpen(false):undefined}/>)}
      </nav>
      <div className="p-3 border-t">
        <Link to="/" className="sidebar-item"><FiHome size={16}/>View Store</Link>
        <button onClick={handleLogout} className="sidebar-item w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50"><FiLogOut size={16}/>Logout</button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden"/>
            <motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'tween',duration:0.25}} className="fixed inset-y-0 left-0 z-50 lg:hidden flex">
              <Sidebar mobile/>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={()=>setOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><FiMenu size={18}/></button>
            <h1 className="font-display font-bold text-secondary text-lg">Shommo Store Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <img src={user?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'A')}&background=7c3aed&color=fff`} alt="" className="w-8 h-8 rounded-full"/>
            <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 p-6"><Outlet/></main>
      </div>
    </div>
  );
}

/* ── STAFF LAYOUT ── */
export function StaffLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector(selectUser);
  const handleLogout = () => { dispatch(logout()); toast.success('Logged out'); navigate('/'); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col min-h-screen">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <p className="font-bold">Staff Panel</p>
          <p className="text-xs opacity-75">{user?.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <SidebarLink to="/staff"        icon={FiGrid}        label="Dashboard"/>
          <SidebarLink to="/staff/orders" icon={FiTruck}       label="My Deliveries"/>
        </nav>
        <div className="p-3 border-t">
          <Link to="/" className="sidebar-item"><FiHome size={16}/>View Store</Link>
          <button onClick={handleLogout} className="sidebar-item w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50"><FiLogOut size={16}/>Logout</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="font-display font-bold text-secondary">Delivery Staff Dashboard</h1>
        </header>
        <main className="flex-1 p-6"><Outlet/></main>
      </div>
    </div>
  );
}

/* ── USER LAYOUT ── */
export function UserLayout() {
  const user     = useSelector(selectUser);
  const { pathname } = useLocation();

  const links = [
    { to:'/account',           icon:FiGrid,    label:'Dashboard' },
    { to:'/account/orders',    icon:FiPackage, label:'My Orders' },
    { to:'/account/wishlist',  icon:FiHeart,   label:'Wishlist' },
    { to:'/account/addresses', icon:FiMapPin,  label:'Addresses' },
    { to:'/account/profile',   icon:FiUser,    label:'Profile' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-6 flex-col md:flex-row">
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="card p-5 mb-4 text-center">
            <img src={user?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=e63946&color=fff&size=80`} alt="" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary/20"/>
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <nav className="card p-2 space-y-1">
            {links.map(l=><SidebarLink key={l.to} {...l}/>)}
          </nav>
        </aside>
        <div className="flex-1 min-w-0"><Outlet/></div>
      </div>
    </div>
  );
}

export default AdminLayout;
// Re-export from same file for cleaner imports in App.js
