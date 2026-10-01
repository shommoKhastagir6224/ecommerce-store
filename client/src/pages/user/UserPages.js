import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiPackage, FiHeart, FiUser, FiMapPin, FiEdit2, FiSave, FiX, FiPlus, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { orderAPI, userAPI, wishlistAPI } from '../../api';
import { setUser, selectUser, toggleWishlist, selectWishlist } from '../../context/store';
import { ProductCard, StatusBadge, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════
   USER DASHBOARD
══════════════════════════════════════════ */
export function UserDashboard() {
  const user    = useSelector(selectUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    orderAPI.getMy({limit:5}).then(r=>setOrders(r.data.orders||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-secondary to-primary rounded-2xl p-6 text-white flex items-center gap-5">
        <img src={user?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=fff&color=e63946&size=80`} alt="" className="w-16 h-16 rounded-2xl border-2 border-white/30 flex-shrink-0"/>
        <div>
          <p className="text-white/70 text-sm">Welcome back,</p>
          <h2 className="font-display text-2xl font-bold">{user?.name}</h2>
          <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{icon:'📦',label:'Total Orders',val:orders.length},{icon:'🚚',label:'In Transit',val:orders.filter(o=>o.orderStatus==='shipped'||o.orderStatus==='out_for_delivery').length},{icon:'✅',label:'Delivered',val:orders.filter(o=>o.orderStatus==='delivered').length},{icon:'❤️',label:'Wishlist',val:'-'}].map(s=>(
          <div key={s.label} className="card p-4 text-center">
            <span className="text-2xl block mb-1">{s.icon}</span>
            <p className="font-display text-2xl font-bold text-primary">{s.val}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-secondary">Recent Orders</h3>
          <Link to="/account/orders" className="text-primary text-sm hover:underline">View All</Link>
        </div>
        {loading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
        : orders.length===0 ? <EmptyState icon={FiPackage} title="No orders yet" desc="Start shopping!" action={()=>{}} actionLabel="Shop Now"/>
        : (
          <div className="space-y-3">
            {orders.slice(0,5).map(o=>(
              <Link key={o._id} to={`/account/orders/${o._id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div>
                  <p className="font-semibold text-sm">#{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()} · {o.items?.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">৳{o.total?.toLocaleString()}</p>
                  <StatusBadge status={o.orderStatus}/>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   USER ORDERS
══════════════════════════════════════════ */
export function UserOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);

  useEffect(()=>{
    setLoading(true);
    orderAPI.getMy({page}).then(r=>{ setOrders(r.data.orders||[]); setPages(r.data.pages||1); }).catch(()=>{}).finally(()=>setLoading(false));
  },[page]);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-secondary">My Orders</h2>
      {loading ? <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>
      : orders.length===0 ? <EmptyState icon={FiPackage} title="No orders found" desc="You haven't placed any orders yet."/>
      : orders.map(order=>(
        <Link key={order._id} to={`/account/orders/${order._id}`} className="card block p-5 hover:shadow-hover transition-shadow">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div><p className="font-bold text-secondary">#{order.orderNumber}</p><p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-BD', {year:'numeric',month:'short',day:'numeric'})}</p></div>
            <div className="flex items-center gap-3"><StatusBadge status={order.paymentStatus}/><StatusBadge status={order.orderStatus}/></div>
          </div>
          <div className="flex gap-2 mb-3">
            {order.items?.slice(0,3).map(item=><img key={item._id} src={item.thumbnail||'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&q=50'} alt="" className="w-10 h-10 object-cover rounded-lg border"/>)}
            {order.items?.length>3 && <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-500">+{order.items.length-3}</div>}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{order.items?.length} item(s) · {order.paymentMethod?.toUpperCase()}</span>
            <span className="font-bold text-primary">৳{order.total?.toLocaleString()}</span>
          </div>
        </Link>
      ))}
      {pages>1 && (
        <div className="flex justify-center gap-2">
          {[...Array(pages)].map((_,i)=><button key={i} onClick={()=>setPage(i+1)} className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${page===i+1?'bg-primary text-white':'border hover:bg-gray-50'}`}>{i+1}</button>)}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   ORDER DETAIL
══════════════════════════════════════════ */
export function OrderDetail() {
  const { id }  = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    orderAPI.getById(id).then(r=>setOrder(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[id]);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-20 rounded-2xl"/>)}</div>;
  if (!order)  return <p className="text-gray-500">Order not found.</p>;

  const STATUS_STEPS = ['pending','processing','shipped','out_for_delivery','delivered'];
  const currentStep  = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={()=>window.history.back()} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
        <h2 className="font-display text-xl font-bold text-secondary">Order #{order.orderNumber}</h2>
        <StatusBadge status={order.orderStatus}/>
      </div>

      {/* Tracking stepper */}
      {order.orderStatus!=='cancelled' && (
        <div className="card p-5">
          <h3 className="font-display font-bold mb-5">Order Tracking</h3>
          <div className="flex justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-0">
              <div className="h-full bg-primary transition-all" style={{width:`${(currentStep/(STATUS_STEPS.length-1))*100}%`}}/>
            </div>
            {STATUS_STEPS.map((s,i)=>(
              <div key={s} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${i<=currentStep?'bg-primary border-primary text-white':'bg-white border-gray-200 text-gray-400'}`}>
                  {i<currentStep?<FiCheckCircle size={14}/>:<span className="text-xs font-bold">{i+1}</span>}
                </div>
                <span className="text-[10px] text-center text-gray-500 capitalize max-w-[60px] leading-tight">{s.replace(/_/g,' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="card p-5">
          <h3 className="font-display font-bold mb-4">Items ({order.items?.length})</h3>
          <div className="space-y-3">
            {order.items?.map(item=>(
              <div key={item._id} className="flex gap-3">
                <img src={item.thumbnail||'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=60'} alt={item.name} className="w-14 h-14 object-cover rounded-xl flex-shrink-0"/>
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.qty} {item.color&&`· ${item.color}`} {item.size&&`· ${item.size}`}</p>
                  <p className="font-bold text-sm text-primary">৳{(item.price*item.qty).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Address */}
          <div className="card p-5">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2"><FiMapPin size={15} className="text-primary"/>Shipping Address</h3>
            <p className="text-sm font-semibold">{order.shippingAddress?.name}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.division}</p>
            <p className="text-sm text-gray-600">📞 {order.shippingAddress?.phone}</p>
          </div>
          {/* Summary */}
          <div className="card p-5">
            <h3 className="font-display font-bold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              {[['Subtotal',`৳${order.subtotal?.toLocaleString()}`],['Delivery',order.deliveryCharge===0?'FREE':`৳${order.deliveryCharge}`],['Discount',order.discount>0?`-৳${order.discount}`:'None'],['Method',order.paymentMethod?.toUpperCase()],['Status',order.paymentStatus]].map(([k,v])=>(
                <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-primary">৳{order.total?.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   WISHLIST
══════════════════════════════════════════ */
export function UserWishlist() {
  const dispatch  = useDispatch();
  const wishlist  = useSelector(selectWishlist);
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-secondary">My Wishlist ({wishlist.length})</h2>
      {wishlist.length===0 ? <EmptyState icon={FiHeart} title="Wishlist is empty" desc="Save products you love by clicking the heart icon."/>
      : <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{wishlist.map((p,i)=><ProductCard key={p._id} product={p} index={i}/>)}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   PROFILE
══════════════════════════════════════════ */
export function UserProfile() {
  const dispatch  = useDispatch();
  const user      = useSelector(selectUser);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', password:'', confirm:'' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const handleSave = async () => {
    if (form.password && form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      const { data } = await userAPI.updateProfile(payload);
      dispatch(setUser({ ...user, ...data }));
      toast.success('Profile updated!');
      setEditing(false);
    } catch(err) { toast.error(err.response?.data?.message||'Update failed'); }
    finally { setLoading(false); }
  };

  const inputCls = "input-field text-sm py-2.5";
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-secondary">My Profile</h2>
        {!editing ? <button onClick={()=>setEditing(true)} className="btn-outline text-sm px-4 py-2 flex items-center gap-1.5"><FiEdit2 size={13}/>Edit</button>
        : <div className="flex gap-2"><button onClick={handleSave} disabled={loading} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 disabled:opacity-60"><FiSave size={13}/>{loading?'Saving...':'Save'}</button><button onClick={()=>setEditing(false)} className="btn-ghost text-sm px-3 py-2"><FiX size={15}/></button></div>}
      </div>
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <img src={user?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=e63946&color=fff&size=80`} alt="" className="w-16 h-16 rounded-2xl border-2 border-primary/20"/>
          <div><p className="font-bold text-secondary">{user?.name}</p><p className="text-sm text-gray-500">{user?.email}</p><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user?.role==='admin'?'bg-purple-100 text-purple-700':'bg-green-100 text-green-700'}`}>{user?.role?.toUpperCase()}</span></div>
        </div>
        {[['Full Name',form.name,'name'],['Phone',form.phone,'phone']].map(([label,val,key])=>(
          <div key={key}><label className="input-label">{label}</label>
            {editing ? <input value={val} onChange={set(key)} className={inputCls}/> : <p className="text-sm py-2.5 px-4 bg-gray-50 rounded-xl">{val||'—'}</p>}
          </div>
        ))}
        <div><label className="input-label">Email</label><p className="text-sm py-2.5 px-4 bg-gray-50 rounded-xl text-gray-500">{user?.email} (cannot change)</p></div>
        {editing && <>
          <div><label className="input-label">New Password (optional)</label><input type="password" value={form.password} onChange={set('password')} placeholder="Leave blank to keep current" className={inputCls}/></div>
          <div><label className="input-label">Confirm Password</label><input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Confirm new password" className={inputCls}/></div>
        </>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADDRESSES
══════════════════════════════════════════ */
export function UserAddresses() {
  const user    = useSelector(selectUser);
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState(user?.addresses||[]);
  const [showForm,  setShowForm]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const blank = { name:'', phone:'', street:'', city:'', district:'', division:'', postalCode:'', isDefault:false };
  const [form, setForm] = useState(blank);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const save = async () => {
    setLoading(true);
    try {
      const updated = [...addresses, form];
      await userAPI.updateAddress({ addresses: updated });
      setAddresses(updated); dispatch(setUser({...user, addresses:updated}));
      toast.success('Address saved!'); setShowForm(false); setForm(blank);
    } catch { toast.error('Error saving address'); }
    finally { setLoading(false); }
  };
  const remove = async (i) => {
    const updated = addresses.filter((_,idx)=>idx!==i);
    await userAPI.updateAddress({ addresses: updated });
    setAddresses(updated); dispatch(setUser({...user, addresses:updated})); toast.success('Address removed');
  };

  const inputCls = "input-field text-sm py-2";
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-secondary">My Addresses</h2>
        <button onClick={()=>setShowForm(!showForm)} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"><FiPlus size={13}/>Add New</button>
      </div>
      {showForm && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold">New Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['Name','name','Full Name'],['Phone','phone','+880'],['Street','street','Street / Area'],['City','city','City'],['District','district','District'],['Division','division','Division'],['Postal','postalCode','1000']].map(([label,key,ph])=>(
              <div key={key}><label className="input-label text-xs">{label}</label><input value={form[key]} onChange={set(key)} placeholder={ph} className={inputCls}/></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={loading} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">{loading?'Saving...':'Save Address'}</button>
            <button onClick={()=>setShowForm(false)} className="btn-ghost text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}
      {addresses.length===0 ? <EmptyState icon={FiMapPin} title="No addresses saved" desc="Add a delivery address to speed up checkout."/>
      : <div className="space-y-3">{addresses.map((addr,i)=>(
        <div key={i} className="card p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0"><FiMapPin className="text-primary" size={16}/></div>
            <div>
              <p className="font-semibold text-sm">{addr.name} · {addr.phone}</p>
              <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
              <p className="text-sm text-gray-600">{addr.district}, {addr.division}</p>
            </div>
          </div>
          <button onClick={()=>remove(i)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"><FiX size={15}/></button>
        </div>
      ))}</div>}
    </div>
  );
}

export default UserDashboard;
