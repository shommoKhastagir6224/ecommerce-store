import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiTag, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { selectCart, selectCartTotal, removeFromCart, updateQty, clearCart, setShippingAddress } from '../context/store';
import { orderAPI, couponAPI } from '../api';
import { EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════
   CART PAGE
══════════════════════════════════════════ */
export function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items    = useSelector(selectCart);
  const total    = useSelector(selectCartTotal);

  if (items.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <EmptyState icon={()=><span className="text-5xl">🛒</span>} title="Your cart is empty" desc="Add some products and come back!" action={()=>navigate('/products')} actionLabel="Start Shopping"/>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><FiArrowLeft size={18}/></button>
        <h1 className="section-title">Shopping Cart <span className="text-primary">({items.length})</span></h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item,i)=>(
              <motion.div key={`${item._id}-${item.color}-${item.size}`} layout initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20,height:0}} className="card p-4 flex gap-4">
                <img src={item.thumbnail||'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=60'} alt={item.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug||item._id}`} className="font-semibold text-sm text-gray-800 hover:text-primary transition-colors line-clamp-2">{item.name}</Link>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    {item.color && <span>Color: {item.color}</span>}
                    {item.size  && <span>Size: {item.size}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={()=>item.qty<=1?dispatch(removeFromCart(item)):dispatch(updateQty({...item,qty:item.qty-1}))} className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors text-sm"><FiMinus size={12}/></button>
                      <span className="px-3 py-1.5 text-sm font-bold border-x border-gray-200">{item.qty}</span>
                      <button onClick={()=>dispatch(updateQty({...item,qty:Math.min(item.qty+1,item.stock||99)}))} className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors text-sm"><FiPlus size={12}/></button>
                    </div>
                    <span className="font-bold text-primary">৳{((item.discountPrice||item.price)*item.qty).toLocaleString()}</span>
                    <button onClick={()=>{ dispatch(removeFromCart(item)); toast.success('Removed'); }} className="text-gray-400 hover:text-red-500 transition-colors p-1.5"><FiTrash2 size={15}/></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <button onClick={()=>{ dispatch(clearCart()); toast.success('Cart cleared'); }} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors"><FiTrash2 size={13}/>Clear Cart</button>
        </div>
        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-bold text-lg text-secondary mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal ({items.reduce((a,i)=>a+i.qty,0)} items)</span><span className="font-semibold">৳{total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="font-semibold text-green-600">FREE</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
            </div>
            <button onClick={()=>navigate('/checkout')} className="btn-primary w-full py-3.5 mt-5">Proceed to Checkout →</button>
            <Link to="/products" className="block text-center text-sm text-primary mt-3 hover:underline">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CHECKOUT PAGE
══════════════════════════════════════════ */
export function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items    = useSelector(selectCart);
  const subtotal = useSelector(selectCartTotal);
  const user     = useSelector(s=>s.auth.user);

  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon,  setCoupon]  = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name||'', phone: user?.phone||'',
    street:'', city:'', district:'', division:'', postalCode:''
  });
  const [payMethod, setPayMethod] = useState('cod');
  const setAddr = k => e => setAddress(a=>({...a,[k]:e.target.value}));

  const discount = coupon ? (coupon.type==='percentage' ? Math.min(subtotal*(coupon.value/100), coupon.maxDiscount||Infinity) : coupon.value) : 0;
  const delivery = subtotal >= 999 ? 0 : 60;
  const total    = subtotal - discount + delivery;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponAPI.validate({ code: couponCode, total: subtotal });
      setCoupon(data); toast.success(`Coupon applied! -৳${discount.toFixed(0)}`);
    } catch(err) { toast.error(err.response?.data?.message||'Invalid coupon'); setCoupon(null); }
    finally { setCouponLoading(false); }
  };

  const placeOrder = async () => {
    const required = ['name','phone','street','city','district','division'];
    if (required.some(k=>!address[k]?.trim())) { toast.error('Please fill all address fields'); return; }
    setLoading(true);
    try {
      const { data } = await orderAPI.create({
        items: items.map(i=>({ product:i._id, name:i.name, thumbnail:i.thumbnail, price:i.discountPrice||i.price, qty:i.qty, color:i.color, size:i.size })),
        shippingAddress: address,
        paymentMethod: payMethod,
        coupon: coupon?._id,
        subtotal, deliveryCharge: delivery, discount, total,
      });
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data._id}`);
    } catch(err) { toast.error(err.response?.data?.message||'Order failed'); }
    finally { setLoading(false); }
  };

  const inputCls = "input-field text-sm py-2.5";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="section-title mb-8">Checkout</h1>
      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[['1','Shipping'],['2','Payment'],['3','Review']].map(([s,label],i)=>(
          <React.Fragment key={s}>
            {i>0 && <div className={`flex-1 h-1 rounded-full transition-colors ${Number(step)>i?'bg-primary':'bg-gray-200'}`}/>}
            <div className={`flex items-center gap-2 cursor-pointer ${Number(step)===i+1?'text-primary font-bold':Number(step)>i+1?'text-green-600 font-semibold':'text-gray-400'}`} onClick={()=>Number(step)>i+1&&setStep(i+1)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${Number(step)===i+1?'bg-primary text-white':Number(step)>i+1?'bg-green-500 text-white':'bg-gray-200 text-gray-500'}`}>{Number(step)>i+1?<FiCheck size={14}/>:s}</div>
              <span className="text-sm hidden sm:block">{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-secondary">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="input-label">Full Name *</label><input value={address.name} onChange={setAddr('name')} placeholder="Your full name" className={inputCls}/></div>
                <div><label className="input-label">Phone *</label><input value={address.phone} onChange={setAddr('phone')} placeholder="+880 1XXX" className={inputCls}/></div>
              </div>
              <div><label className="input-label">Street Address *</label><input value={address.street} onChange={setAddr('street')} placeholder="House/Road/Area" className={inputCls}/></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="input-label">City *</label><input value={address.city} onChange={setAddr('city')} placeholder="City" className={inputCls}/></div>
                <div><label className="input-label">District *</label><input value={address.district} onChange={setAddr('district')} placeholder="District" className={inputCls}/></div>
                <div><label className="input-label">Division *</label>
                  <select value={address.division} onChange={setAddr('division')} className={inputCls}>
                    <option value="">Select</option>
                    {['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barishal','Mymensingh','Rangpur'].map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="w-36"><label className="input-label">Postal Code</label><input value={address.postalCode} onChange={setAddr('postalCode')} placeholder="1000" className={inputCls}/></div>
              <button onClick={()=>{ dispatch(setShippingAddress(address)); setStep(2); }} className="btn-primary px-8 py-3">Continue to Payment →</button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="card p-6 space-y-5">
              <h2 className="font-display font-bold text-lg text-secondary">Payment Method</h2>
              {[
                { id:'cod',    label:'Cash on Delivery',   emoji:'💵', desc:'Pay when you receive' },
                { id:'bkash',  label:'bKash',              emoji:'🔴', desc:'Mobile banking' },
                { id:'stripe', label:'Credit/Debit Card',  emoji:'💳', desc:'Stripe secure payment' },
              ].map(m=>(
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payMethod===m.id?'border-primary bg-red-50':'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="pay" value={m.id} checked={payMethod===m.id} onChange={()=>setPayMethod(m.id)} className="accent-primary"/>
                  <span className="text-2xl">{m.emoji}</span>
                  <div><p className="font-semibold text-sm">{m.label}</p><p className="text-xs text-gray-500">{m.desc}</p></div>
                  {payMethod===m.id && <FiCheck className="ml-auto text-primary" size={18}/>}
                </label>
              ))}
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="btn-ghost px-6 py-3 border border-gray-200">← Back</button>
                <button onClick={()=>setStep(3)} className="btn-primary px-8 py-3">Review Order →</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="card p-6 space-y-5">
              <h2 className="font-display font-bold text-lg text-secondary">Review Order</h2>
              <div className="space-y-3">
                {items.map(item=>(
                  <div key={`${item._id}-${item.color}`} className="flex gap-3">
                    <img src={item.thumbnail||'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=60'} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0"/>
                    <div className="flex-1 text-sm"><p className="font-medium line-clamp-1">{item.name}</p><p className="text-gray-500">Qty: {item.qty} {item.color&&`· ${item.color}`} {item.size&&`· ${item.size}`}</p></div>
                    <span className="font-bold text-sm text-primary">৳{((item.discountPrice||item.price)*item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 text-sm space-y-1">
                <p className="text-gray-600">📍 {address.street}, {address.city}, {address.district}, {address.division}</p>
                <p className="text-gray-600">📞 {address.phone}</p>
                <p className="text-gray-600">💳 {payMethod==='cod'?'Cash on Delivery':payMethod}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="btn-ghost px-6 py-3 border border-gray-200">← Back</button>
                <button onClick={placeOrder} disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
                  {loading?'Placing order...':'🎉 Place Order'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-bold text-base text-secondary mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
              {coupon && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{discount.toFixed(0)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className={delivery===0?'text-green-600':''}>{delivery===0?'FREE':'৳'+delivery}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
            </div>
          </div>
          {/* Coupon */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiTag size={14}/>Apply Coupon</p>
            <div className="flex gap-2">
              <input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} placeholder="COUPON CODE" className="input-field text-sm py-2 flex-1 uppercase"/>
              <button onClick={applyCoupon} disabled={couponLoading} className="btn-primary px-4 py-2 text-sm whitespace-nowrap">{couponLoading?'...':'Apply'}</button>
            </div>
            {coupon && <p className="text-green-600 text-xs mt-2">✓ {coupon.description||'Coupon applied!'}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ORDER SUCCESS
══════════════════════════════════════════ */
export function OrderSuccess() {
  const { id } = require('react-router-dom').useParams();
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.5}} className="card p-10 max-w-md w-full text-center">
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.2,stiffness:200}} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FiCheck size={40} className="text-green-500"/>
        </motion.div>
        <h1 className="font-display text-2xl font-bold text-secondary mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 text-sm mb-2">Your order has been confirmed.</p>
        <p className="font-mono text-xs bg-gray-100 rounded-lg px-3 py-2 inline-block mb-6">Order ID: {id?.slice(-8).toUpperCase()}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={()=>navigate(`/account/orders/${id}`)} className="btn-outline flex-1 py-2.5 text-sm">Track Order</button>
          <button onClick={()=>navigate('/')} className="btn-primary flex-1 py-2.5 text-sm">Continue Shopping</button>
        </div>
      </motion.div>
    </div>
  );
}

export default CartPage;
