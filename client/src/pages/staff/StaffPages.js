import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiPhone, FiMapPin, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { orderAPI } from '../../api';
import { StatusBadge, StatCard, EmptyState } from '../../components/ui';
import { useSelector } from 'react-redux';
import { selectUser } from '../../context/store';
import toast from 'react-hot-toast';

/* ── Delivery Status Timeline ── */
function DeliveryTimeline({ tracking }) {
  if (!tracking?.length) return null;
  return (
    <div className="space-y-2 mt-3">
      {[...tracking].reverse().map((t, i) => (
        <div key={i} className="flex gap-3 text-xs">
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${i === 0 ? 'bg-primary' : 'bg-gray-300'}`} />
            {i < tracking.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
          </div>
          <div className="pb-2">
            <span className="font-semibold capitalize text-gray-700">{t.status?.replace(/_/g, ' ')}</span>
            <span className="text-gray-400 ml-2">{new Date(t.time).toLocaleString()}</span>
            {t.message && <p className="text-gray-500 mt-0.5">{t.message}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Staff Order Card ── */
function StaffOrderCard({ order, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const NEXT_STATUS = {
    pending:          { label: 'Mark Processing',     next: 'processing',       color: 'bg-blue-500' },
    processing:       { label: 'Mark Shipped',        next: 'shipped',          color: 'bg-purple-500' },
    shipped:          { label: 'Out for Delivery',    next: 'out_for_delivery', color: 'bg-orange-500' },
    out_for_delivery: { label: 'Mark Delivered ✓',   next: 'delivered',        color: 'bg-green-500' },
    delivered:        { label: 'Delivered',           next: null,               color: 'bg-gray-400' },
    cancelled:        { label: 'Cancelled',           next: null,               color: 'bg-gray-400' },
  };

  const statusInfo = NEXT_STATUS[order.orderStatus] || NEXT_STATUS.pending;

  const handleUpdate = async () => {
    if (!statusInfo.next) return;
    setUpdating(true);
    try {
      await orderAPI.updateStatus(order._id, {
        status: statusInfo.next,
        message: `Status updated to ${statusInfo.next.replace(/_/g, ' ')} by delivery staff`,
      });
      toast.success('Status updated!');
      onStatusUpdate();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FiTruck size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-sm text-secondary">#{order.orderNumber}</p>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          <span className="font-bold text-primary text-sm">৳{order.total?.toLocaleString()}</span>
          {expanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-100"
        >
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer & Address */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-secondary">Customer Info</h4>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <p className="font-semibold text-sm">{order.user?.name || order.shippingAddress?.name}</p>
                <a href={`tel:${order.shippingAddress?.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <FiPhone size={13} /> {order.shippingAddress?.phone}
                </a>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FiMapPin size={13} className="mt-0.5 flex-shrink-0 text-primary" />
                  <span>
                    {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.district}, {order.shippingAddress?.division}
                  </span>
                </div>
              </div>

              {/* Order items */}
              <h4 className="font-semibold text-sm text-secondary">Items ({order.items?.length})</h4>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item._id} className="flex gap-2 items-center bg-gray-50 rounded-xl p-2">
                    <img
                      src={item.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&q=50'}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty} · ৳{item.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking + Action */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-secondary">Tracking History</h4>
              <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto">
                <DeliveryTimeline tracking={order.tracking} />
              </div>

              {/* Update action */}
              {statusInfo.next && (
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className={`w-full text-white font-semibold py-3 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 ${statusInfo.color}`}
                >
                  {updating ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                  ) : (
                    <><FiCheckCircle size={15} /> {statusInfo.label}</>
                  )}
                </button>
              )}

              {/* Payment summary */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Payment</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium uppercase">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>Total</span>
                    <span className="text-primary">৳{order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   STAFF DASHBOARD
══════════════════════════════════════════ */
export function StaffDashboard() {
  const user    = useSelector(selectUser);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getStaff()
      .then(r => setOrders(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:       orders.length,
    pending:     orders.filter(o => ['pending', 'processing'].includes(o.orderStatus)).length,
    inTransit:   orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.orderStatus)).length,
    delivered:   orders.filter(o => o.orderStatus === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 text-white flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
          🚚
        </div>
        <div>
          <p className="text-blue-100 text-sm">Welcome back,</p>
          <h2 className="font-display text-2xl font-bold">{user?.name}</h2>
          <p className="text-blue-200 text-xs mt-0.5">Delivery Staff · {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiPackage}      label="Total Assigned"  value={stats.total}      color="blue" />
        <StatCard icon={FiClock}        label="Pending"          value={stats.pending}    color="orange" />
        <StatCard icon={FiTruck}        label="In Transit"       value={stats.inTransit}  color="purple" />
        <StatCard icon={FiCheckCircle}  label="Delivered"        value={stats.delivered}  color="green" />
      </div>

      {/* Today's deliveries */}
      <div className="card p-5">
        <h3 className="font-display font-bold text-secondary mb-4">
          Active Deliveries
          <span className="ml-2 text-sm font-normal text-gray-400">({stats.pending + stats.inTransit} pending)</span>
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length === 0 ? (
          <EmptyState icon={FiCheckCircle} title="All caught up!" desc="No active deliveries right now." />
        ) : (
          <div className="space-y-3">
            {orders
              .filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled')
              .slice(0, 5)
              .map(o => (
                <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">#{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">{o.shippingAddress?.city}, {o.shippingAddress?.district}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.orderStatus} />
                    <p className="text-xs text-gray-500 mt-1">৳{o.total?.toLocaleString()}</p>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STAFF ORDERS PAGE
══════════════════════════════════════════ */
export function StaffOrders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');

  const fetchOrders = () => {
    setLoading(true);
    orderAPI.getStaff()
      .then(r => setOrders(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.orderStatus === filter;
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const FILTERS = [
    { value: 'all',              label: 'All Orders' },
    { value: 'processing',       label: '⚙️ Processing' },
    { value: 'shipped',          label: '📦 Shipped' },
    { value: 'out_for_delivery', label: '🚚 Out for Delivery' },
    { value: 'delivered',        label: '✅ Delivered' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-xl font-bold text-secondary">
          My Deliveries <span className="text-primary">({orders.length})</span>
        </h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                {orders.filter(o => o.orderStatus === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search order / customer..."
          className="input-field text-sm py-2.5 pl-4"
        />
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiPackage}
          title="No orders found"
          desc={filter !== 'all' ? `No ${filter.replace(/_/g, ' ')} orders.` : 'No orders assigned yet.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <StaffOrderCard
              key={order._id}
              order={order}
              onStatusUpdate={fetchOrders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;
