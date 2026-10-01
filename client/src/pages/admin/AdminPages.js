import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiPackage, FiDollarSign, FiUsers, FiShoppingBag, FiEdit2, FiTrash2, FiPlus, FiSearch, FiUpload, FiSave, FiX, FiCheck, FiEye, FiTruck } from 'react-icons/fi';
import { productAPI, orderAPI, userAPI, categoryAPI, couponAPI, bannerAPI, dashboardAPI } from '../../api';
import { StatusBadge, StatCard, Modal, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════ */
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    dashboardAPI.getStats().then(r=>setStats(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const chartData = stats?.monthlyRevenue?.map(m=>({
    name: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m._id.month-1],
    revenue: m.revenue, orders: m.orders,
  })) || [];

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(8)].map((_,i)=><div key={i} className="skeleton h-28 rounded-2xl"/>)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-secondary">Dashboard Overview</h1>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiDollarSign} label="Total Revenue"   value={`৳${(stats?.totalRevenue||0).toLocaleString()}`} color="primary" sub="All time"/>
        <StatCard icon={FiPackage}    label="Total Orders"    value={stats?.totalOrders||0}    color="blue"   sub={`${stats?.pendingOrders||0} pending`}/>
        <StatCard icon={FiUsers}      label="Total Customers" value={stats?.totalUsers||0}     color="green"  sub="Registered users"/>
        <StatCard icon={FiShoppingBag}label="Total Products"  value={stats?.totalProducts||0}  color="purple" sub="Active listings"/>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-display font-bold text-secondary mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e63946" stopOpacity={0.15}/><stop offset="95%" stopColor="#e63946" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`৳${v>=1000?v/1000+'k':v}`}/>
              <Tooltip formatter={(v)=>[`৳${v.toLocaleString()}`, 'Revenue']}/>
              <Area type="monotone" dataKey="revenue" stroke="#e63946" strokeWidth={2} fill="url(#rev)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold text-secondary mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip/>
              <Bar dataKey="orders" fill="#1d3557" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-display font-bold text-secondary mb-4">Recent Orders</h3>
          <div className="space-y-2">
            {stats?.recentOrders?.map(o=>(
              <div key={o._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div><p className="font-semibold text-sm">#{o.orderNumber}</p><p className="text-xs text-gray-500">{o.user?.name} · {new Date(o.createdAt).toLocaleDateString()}</p></div>
                <div className="text-right"><p className="font-bold text-primary text-sm">৳{o.total?.toLocaleString()}</p><StatusBadge status={o.orderStatus}/></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold text-secondary mb-4">Top Selling</h3>
          <div className="space-y-3">
            {stats?.topProducts?.map((p,i)=>(
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i+1}</span>
                <img src={p.thumbnail} alt="" className="w-9 h-9 object-cover rounded-lg"/>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-gray-500">{p.sold} sold</p></div>
                <span className="font-bold text-primary text-sm">৳{(p.discountPrice||p.price)?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN PRODUCTS
══════════════════════════════════════════ */
export function AdminProducts() {
  const navigate  = useNavigate();
  const [products, setProducts]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');
  const [page,     setPage]       = useState(1);
  const [pages,    setPages]      = useState(1);
  const [delId,    setDelId]      = useState(null);

  const fetch = useCallback(()=>{
    setLoading(true);
    productAPI.getAll({ keyword:search, page, limit:15 }).then(r=>{ setProducts(r.data.products||[]); setPages(r.data.pages||1); }).catch(()=>{}).finally(()=>setLoading(false));
  },[search, page]);
  useEffect(()=>{ fetch(); },[fetch]);

  const handleDelete = async (id) => {
    try { await productAPI.delete(id); toast.success('Product removed'); setDelId(null); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-xl font-bold text-secondary">Products ({products.length})</h1>
        <button onClick={()=>navigate('/admin/products/add')} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"><FiPlus size={13}/>Add Product</button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search products..." className="input-field pl-9 text-sm py-2.5"/>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>{['Product','Price','Category','Stock','Status','Actions'].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? [...Array(8)].map((_,i)=><tr key={i}><td colSpan={6} className="table-cell"><div className="skeleton h-8 rounded"/></td></tr>)
              : products.map(p=>(
                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <img src={p.thumbnail} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0"/>
                      <div><p className="font-medium text-sm line-clamp-1 max-w-[200px]">{p.name}</p>{p.brand&&<p className="text-xs text-gray-400">{p.brand}</p>}</div>
                    </div>
                  </td>
                  <td className="table-cell"><div><p className="font-bold text-primary text-sm">৳{(p.discountPrice||p.price)?.toLocaleString()}</p>{p.discountPrice>0&&<p className="text-xs text-gray-400 line-through">৳{p.price?.toLocaleString()}</p>}</div></td>
                  <td className="table-cell text-sm text-gray-600">{p.category?.name||'—'}</td>
                  <td className="table-cell"><span className={`badge ${p.stock>10?'badge-green':p.stock>0?'badge-orange':'badge-red'}`}>{p.stock}</span></td>
                  <td className="table-cell"><span className={`badge ${p.isActive!==false?'badge-green':'badge-red'}`}>{p.isActive!==false?'Active':'Hidden'}</span></td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button onClick={()=>navigate(`/admin/products/edit/${p._id}`)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"><FiEdit2 size={13}/></button>
                      <button onClick={()=>setDelId(p._id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><FiTrash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {pages>1 && <div className="flex justify-center gap-2">{[...Array(pages)].map((_,i)=><button key={i} onClick={()=>setPage(i+1)} className={`w-9 h-9 rounded-lg text-sm font-semibold ${page===i+1?'bg-primary text-white':'border hover:bg-gray-50'}`}>{i+1}</button>)}</div>}
      <Modal open={!!delId} onClose={()=>setDelId(null)} title="Delete Product">
        <p className="text-gray-600 mb-5">Are you sure you want to remove this product? This action cannot be undone.</p>
        <div className="flex gap-3"><button onClick={()=>handleDelete(delId)} className="btn-primary bg-red-500 hover:bg-red-600 flex-1 py-2.5 text-sm">Delete</button><button onClick={()=>setDelId(null)} className="btn-ghost border flex-1 py-2.5 text-sm">Cancel</button></div>
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADD / EDIT PRODUCT
══════════════════════════════════════════ */
export function AdminAddProduct() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEdit    = !!id;
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({
    name:'', brand:'', category:'', subcategory:'', price:'', discountPrice:'',
    stock:'', shortDesc:'', description:'', thumbnail:'', deliveryCharge:'0',
    deliveryDays:'3-5 days', isFeatured:false, isFlashSale:false, isNewArrival:false,
    colors:'', sizes:'',
  });
  const set = k => e => setForm(f=>({...f,[k]: e.target?.type==='checkbox'?e.target.checked:e.target.value}));

  useEffect(()=>{
    categoryAPI.getAll().then(r=>setCategories(r.data)).catch(()=>{});
    if (isEdit) {
      setLoading(true);
      productAPI.getById(id).then(r=>{
        const p = r.data;
        setForm({ name:p.name||'', brand:p.brand||'', category:p.category?._id||'', subcategory:p.subcategory||'', price:p.price||'', discountPrice:p.discountPrice||'', stock:p.stock||'', shortDesc:p.shortDesc||'', description:p.description||'', thumbnail:p.thumbnail||'', deliveryCharge:p.deliveryCharge||'0', deliveryDays:p.deliveryDays||'3-5 days', isFeatured:p.isFeatured||false, isFlashSale:p.isFlashSale||false, isNewArrival:p.isNewArrival||false, colors:p.colors?.map(c=>c.name).join(',')||'', sizes:p.sizes?.join(',')||'' });
      }).catch(()=>{}).finally(()=>setLoading(false));
    }
  },[id, isEdit]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form,
        price: Number(form.price), discountPrice: Number(form.discountPrice)||0, stock: Number(form.stock), deliveryCharge: Number(form.deliveryCharge)||0,
        colors: form.colors ? form.colors.split(',').map(c=>({ name:c.trim(), hex:'#888' })) : [],
        sizes:  form.sizes  ? form.sizes.split(',').map(s=>s.trim()) : [],
      };
      if (isEdit) { await productAPI.update(id, payload); toast.success('Product updated!'); }
      else        { await productAPI.create(payload);      toast.success('Product created!'); }
      navigate('/admin/products');
    } catch(err) { toast.error(err.response?.data?.message||'Error saving product'); }
    finally { setSaving(false); }
  };

  const inputCls = "input-field text-sm py-2.5";
  const LBL = ({children}) => <label className="input-label text-xs">{children}</label>;

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_,i)=><div key={i} className="skeleton h-12 rounded-xl"/>)}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-secondary">{isEdit?'Edit Product':'Add New Product'}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={()=>navigate('/admin/products')} className="btn-ghost border text-sm px-4 py-2">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 flex items-center gap-1.5 disabled:opacity-60"><FiSave size={13}/>{saving?'Saving...':isEdit?'Update':'Create'}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5 space-y-4 md:col-span-2">
          <h3 className="font-semibold text-secondary text-sm">Basic Info</h3>
          <div><LBL>Product Name *</LBL><input required value={form.name} onChange={set('name')} placeholder="e.g. Nike Air Max 270" className={inputCls}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><LBL>Brand</LBL><input value={form.brand} onChange={set('brand')} placeholder="Nike" className={inputCls}/></div>
            <div><LBL>Category *</LBL>
              <select required value={form.category} onChange={set('category')} className={inputCls}>
                <option value="">Select Category</option>
                {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div><LBL>Short Description</LBL><input value={form.shortDesc} onChange={set('shortDesc')} placeholder="One-line summary" className={inputCls}/></div>
          <div><LBL>Full Description *</LBL><textarea required value={form.description} onChange={set('description')} rows={4} className={`${inputCls} resize-none`} placeholder="Detailed product description..."/></div>
        </div>
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-secondary text-sm">Pricing & Stock</h3>
          <div><LBL>Original Price (৳) *</LBL><input required type="number" min="0" value={form.price} onChange={set('price')} className={inputCls}/></div>
          <div><LBL>Discount Price (৳)</LBL><input type="number" min="0" value={form.discountPrice} onChange={set('discountPrice')} className={inputCls}/></div>
          <div><LBL>Stock Quantity *</LBL><input required type="number" min="0" value={form.stock} onChange={set('stock')} className={inputCls}/></div>
          <div><LBL>Delivery Charge (৳)</LBL><input type="number" min="0" value={form.deliveryCharge} onChange={set('deliveryCharge')} className={inputCls}/></div>
          <div><LBL>Delivery Days</LBL><input value={form.deliveryDays} onChange={set('deliveryDays')} className={inputCls}/></div>
        </div>
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-secondary text-sm">Media & Variants</h3>
          <div><LBL>Thumbnail URL *</LBL><input required value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://..." className={inputCls}/></div>
          {form.thumbnail && <img src={form.thumbnail} alt="preview" className="w-24 h-24 object-cover rounded-xl border"/>}
          <div><LBL>Colors (comma-separated names)</LBL><input value={form.colors} onChange={set('colors')} placeholder="Red, Blue, Green" className={inputCls}/></div>
          <div><LBL>Sizes (comma-separated)</LBL><input value={form.sizes} onChange={set('sizes')} placeholder="S, M, L, XL" className={inputCls}/></div>
          <div className="space-y-2 pt-2">
            {[['isFeatured','Featured Product'],['isFlashSale','Flash Sale'],['isNewArrival','New Arrival']].map(([k,l])=>(
              <label key={k} className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form[k]} onChange={set(k)} className="accent-primary"/>{l}</label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════
   ADMIN ORDERS
══════════════════════════════════════════ */
export function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [staff,   setStaff]   = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [selected, setSelected] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetch = useCallback(()=>{
    setLoading(true);
    orderAPI.getAll({ status:filter, page, search }).then(r=>{ setOrders(r.data.orders||[]); setPages(r.data.pages||1); }).catch(()=>{}).finally(()=>setLoading(false));
  },[filter, page, search]);
  useEffect(()=>{ fetch(); },[fetch]);
  useEffect(()=>{ userAPI.getStaff().then(r=>setStaff(r.data||[])).catch(()=>{}); },[]);

  const handleStatusUpdate = async () => {
    try { await orderAPI.updateStatus(statusModal, { status:newStatus, message:`Status updated to ${newStatus}` }); toast.success('Status updated!'); setStatusModal(null); fetch(); }
    catch { toast.error('Update failed'); }
  };
  const handleAssign = async (staffId) => {
    try { await orderAPI.assignStaff(assignModal, { staffId }); toast.success('Staff assigned!'); setAssignModal(null); fetch(); }
    catch { toast.error('Assign failed'); }
  };

  const STATUSES = ['pending','processing','shipped','out_for_delivery','delivered','cancelled'];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-secondary">Orders Management</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all',...STATUSES].map(s=>(
          <button key={s} onClick={()=>{setFilter(s);setPage(1);}} className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${filter===s?'bg-primary text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.replace(/_/g,' ')}</button>
        ))}
      </div>
      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Order number..." className="input-field pl-9 text-sm py-2"/>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>{['Order #','Customer','Items','Total','Payment','Status','Actions'].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? [...Array(8)].map((_,i)=><tr key={i}><td colSpan={7} className="table-cell"><div className="skeleton h-8 rounded"/></td></tr>)
              : orders.map(o=>(
                <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="table-cell font-mono text-xs font-semibold">#{o.orderNumber}</td>
                  <td className="table-cell"><p className="text-sm font-medium">{o.user?.name}</p><p className="text-xs text-gray-400">{o.user?.email}</p></td>
                  <td className="table-cell text-sm">{o.items?.length} item(s)</td>
                  <td className="table-cell font-bold text-primary text-sm">৳{o.total?.toLocaleString()}</td>
                  <td className="table-cell"><StatusBadge status={o.paymentStatus}/></td>
                  <td className="table-cell"><StatusBadge status={o.orderStatus}/></td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button onClick={()=>{ setStatusModal(o._id); setNewStatus(o.orderStatus); }} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs transition-colors" title="Update Status"><FiEdit2 size={12}/></button>
                      <button onClick={()=>setAssignModal(o._id)} className="p-1.5 hover:bg-green-50 hover:text-green-600 rounded-lg text-xs transition-colors" title="Assign Staff"><FiTruck size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {pages>1 && <div className="flex justify-center gap-2">{[...Array(pages)].map((_,i)=><button key={i} onClick={()=>setPage(i+1)} className={`w-9 h-9 rounded-lg text-sm font-semibold ${page===i+1?'bg-primary text-white':'border hover:bg-gray-50'}`}>{i+1}</button>)}</div>}

      {/* Status modal */}
      <Modal open={!!statusModal} onClose={()=>setStatusModal(null)} title="Update Order Status">
        <div className="space-y-4">
          <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="input-field">
            {STATUSES.map(s=><option key={s} value={s}>{s.replace(/_/g,' ').toUpperCase()}</option>)}
          </select>
          <div className="flex gap-3"><button onClick={handleStatusUpdate} className="btn-primary flex-1 py-2.5 text-sm">Update</button><button onClick={()=>setStatusModal(null)} className="btn-ghost border flex-1 py-2.5 text-sm">Cancel</button></div>
        </div>
      </Modal>

      {/* Assign modal */}
      <Modal open={!!assignModal} onClose={()=>setAssignModal(null)} title="Assign Delivery Staff">
        <div className="space-y-3">
          {staff.length===0 ? <p className="text-gray-500 text-sm">No staff members found.</p>
          : staff.map(s=>(
            <button key={s._id} onClick={()=>handleAssign(s._id)} className="w-full flex items-center gap-3 p-3 border rounded-xl hover:border-primary hover:bg-red-50 transition-all text-left">
              <img src={s.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=36&background=e63946&color=fff`} alt="" className="w-9 h-9 rounded-full"/>
              <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-gray-500">{s.email}</p></div>
              <FiCheck className="ml-auto text-primary" size={14}/>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN USERS
══════════════════════════════════════════ */
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(()=>{ userAPI.getAll().then(r=>setUsers(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  const filtered = users.filter(u=>!search||u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));

  const handleRoleChange = async (id, role) => {
    try { await userAPI.updateRole(id, { role }); setUsers(u=>u.map(x=>x._id===id?{...x,role}:x)); toast.success('Role updated!'); }
    catch { toast.error('Update failed'); }
  };
  const handleToggle = async (id) => {
    try { const r = await userAPI.toggle(id); setUsers(u=>u.map(x=>x._id===id?{...x,isActive:r.data.isActive}:x)); toast.success('Status toggled!'); }
    catch { toast.error('Toggle failed'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-secondary">Users & Staff ({users.length})</h1>
      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 text-sm py-2"/>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b"><tr>{['User','Role','Status','Joined','Actions'].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr></thead>
            <tbody>
              {loading ? [...Array(6)].map((_,i)=><tr key={i}><td colSpan={5} className="table-cell"><div className="skeleton h-8 rounded"/></td></tr>)
              : filtered.map(u=>(
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=36&background=e63946&color=fff`} alt="" className="w-9 h-9 rounded-full flex-shrink-0"/>
                      <div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <select value={u.role} onChange={e=>handleRoleChange(u._id, e.target.value)} className="text-xs border rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-primary">
                      {['user','staff','admin'].map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="table-cell"><StatusBadge status={u.isActive?'active':'inactive'}/></td>
                  <td className="table-cell text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <button onClick={()=>handleToggle(u._id)} className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${u.isActive?'bg-red-50 text-red-600 hover:bg-red-100':'bg-green-50 text-green-600 hover:bg-green-100'}`}>{u.isActive?'Disable':'Enable'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN CATEGORIES
══════════════════════════════════════════ */
export function AdminCategories() {
  const [cats, setCats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]   = useState({ name:'', icon:'🛍️', description:'' });
  const [editing, setEditing] = useState(null);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const fetch = ()=>{ setLoading(true); categoryAPI.getAll().then(r=>setCats(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ fetch(); },[]);

  const save = async () => {
    try {
      if (editing) { await categoryAPI.update(editing, form); toast.success('Updated!'); }
      else         { await categoryAPI.create(form);          toast.success('Created!'); }
      setForm({ name:'', icon:'🛍️', description:'' }); setEditing(null); fetch();
    } catch { toast.error('Save failed'); }
  };
  const remove = async (id) => {
    try { await categoryAPI.delete(id); toast.success('Deleted!'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-secondary">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-sm">{editing?'Edit Category':'Add Category'}</h3>
          <div><label className="input-label text-xs">Icon (emoji)</label><input value={form.icon} onChange={set('icon')} className="input-field text-sm py-2 w-16" maxLength={4}/></div>
          <div><label className="input-label text-xs">Name *</label><input value={form.name} onChange={set('name')} placeholder="Category name" className="input-field text-sm py-2"/></div>
          <div><label className="input-label text-xs">Description</label><input value={form.description} onChange={set('description')} placeholder="Optional" className="input-field text-sm py-2"/></div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm px-5 py-2">{editing?'Update':'Add'}</button>
            {editing&&<button onClick={()=>{setEditing(null);setForm({name:'',icon:'🛍️',description:''}); }} className="btn-ghost border text-sm px-4 py-2">Cancel</button>}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4">All Categories ({cats.length})</h3>
          {loading ? <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="skeleton h-10 rounded-xl"/>)}</div>
          : <div className="space-y-2">{cats.map(c=>(
            <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium">{c.icon} {c.name}</span>
              <div className="flex gap-1">
                <button onClick={()=>{setEditing(c._id);setForm({name:c.name,icon:c.icon,description:c.description||''}); }} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"><FiEdit2 size={12}/></button>
                <button onClick={()=>remove(c._id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><FiTrash2 size={12}/></button>
              </div>
            </div>
          ))}</div>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN COUPONS
══════════════════════════════════════════ */
export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code:'', type:'percentage', value:'', minPurchase:'0', maxDiscount:'', validUntil:'', usageLimit:'100', description:'' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const fetch = ()=>{ setLoading(true); couponAPI.getAll().then(r=>setCoupons(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ fetch(); },[]);

  const save = async e => {
    e.preventDefault();
    try { await couponAPI.create({ ...form, value:Number(form.value), minPurchase:Number(form.minPurchase), usageLimit:Number(form.usageLimit), maxDiscount:form.maxDiscount?Number(form.maxDiscount):undefined }); toast.success('Coupon created!'); setForm({ code:'', type:'percentage', value:'', minPurchase:'0', maxDiscount:'', validUntil:'', usageLimit:'100', description:'' }); fetch(); }
    catch(err) { toast.error(err.response?.data?.message||'Error'); }
  };
  const remove = async id => { try { await couponAPI.delete(id); toast.success('Deleted'); fetch(); } catch { toast.error('Delete failed'); } };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-secondary">Coupons</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4">Create Coupon</h3>
          <form onSubmit={save} className="space-y-3">
            {[['Code','code','SAVE20','text'],['Value','value','20','number'],['Min Purchase (৳)','minPurchase','0','number'],['Max Discount (৳)','maxDiscount','Optional','number'],['Usage Limit','usageLimit','100','number'],['Description','description','Optional','text']].map(([label,key,ph,type])=>(
              <div key={key}><label className="input-label text-xs">{label}</label><input type={type} value={form[key]} onChange={set(key)} placeholder={ph} className="input-field text-sm py-2"/></div>
            ))}
            <div><label className="input-label text-xs">Type</label><select value={form.type} onChange={set('type')} className="input-field text-sm py-2"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (৳)</option></select></div>
            <div><label className="input-label text-xs">Valid Until *</label><input required type="date" value={form.validUntil} onChange={set('validUntil')} className="input-field text-sm py-2"/></div>
            <button type="submit" className="btn-primary w-full py-2.5 text-sm">Create Coupon</button>
          </form>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4">Active Coupons ({coupons.length})</h3>
          {loading ? <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
          : coupons.map(c=>(
            <div key={c._id} className="flex items-center justify-between p-3 border rounded-xl mb-2">
              <div><p className="font-mono font-bold text-primary text-sm">{c.code}</p><p className="text-xs text-gray-500">{c.type==='percentage'?`${c.value}% off`:`৳${c.value} off`} · Used: {c.usedCount}/{c.usageLimit}</p><p className="text-xs text-gray-400">Until {new Date(c.validUntil).toLocaleDateString()}</p></div>
              <button onClick={()=>remove(c._id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><FiTrash2 size={13}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN BANNERS
══════════════════════════════════════════ */
export function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title:'', subtitle:'', image:'', link:'', type:'hero', sortOrder:'0' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const fetch = ()=>{ setLoading(true); bannerAPI.getAll().then(r=>setBanners(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ fetch(); },[]);

  const save = async e => { e.preventDefault(); try { await bannerAPI.create({ ...form, sortOrder:Number(form.sortOrder) }); toast.success('Banner created!'); setForm({ title:'', subtitle:'', image:'', link:'', type:'hero', sortOrder:'0' }); fetch(); } catch { toast.error('Error'); } };
  const remove = async id => { try { await bannerAPI.delete(id); toast.success('Deleted'); fetch(); } catch { toast.error('Delete failed'); } };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-secondary">Banners</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4">Add Banner</h3>
          <form onSubmit={save} className="space-y-3">
            {[['Title *','title','Banner title','text'],['Subtitle','subtitle','Subtitle','text'],['Image URL *','image','https://...','url'],['Link','link','/products','text']].map(([label,key,ph,type])=>(
              <div key={key}><label className="input-label text-xs">{label}</label><input required={label.includes('*')} type={type} value={form[key]} onChange={set(key)} placeholder={ph} className="input-field text-sm py-2"/></div>
            ))}
            <div><label className="input-label text-xs">Type</label><select value={form.type} onChange={set('type')} className="input-field text-sm py-2">{['hero','offer','popup','sidebar'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="input-label text-xs">Sort Order</label><input type="number" value={form.sortOrder} onChange={set('sortOrder')} className="input-field text-sm py-2 w-24"/></div>
            <button type="submit" className="btn-primary w-full py-2.5 text-sm">Add Banner</button>
          </form>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4">Active Banners ({banners.length})</h3>
          {loading ? <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-20 rounded-xl"/>)}</div>
          : banners.map(b=>(
            <div key={b._id} className="flex gap-3 border rounded-xl p-3 mb-2">
              <img src={b.image} alt={b.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0"/>
              <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{b.title}</p><p className="text-xs text-gray-500">{b.type} · order: {b.sortOrder}</p></div>
              <button onClick={()=>remove(b._id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"><FiTrash2 size={13}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
