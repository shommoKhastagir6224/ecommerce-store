import { configureStore, createSlice } from '@reduxjs/toolkit';

// ── Auth slice ──────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('shommoUser') || 'null'),
    loading: false,
    error: null,
  },
  reducers: {
    setUser:     (s, a) => { s.user = a.payload; localStorage.setItem('shommoUser', JSON.stringify(a.payload)); },
    logout:      (s)    => { s.user = null; localStorage.removeItem('shommoUser'); },
    setLoading:  (s, a) => { s.loading = a.payload; },
    setError:    (s, a) => { s.error = a.payload; },
    clearError:  (s)    => { s.error = null; },
  },
});

// ── Cart slice ──────────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('shommoCart') || '[]'),
    shippingAddress: JSON.parse(localStorage.getItem('shommoAddress') || 'null'),
  },
  reducers: {
    addToCart: (s, a) => {
      const existing = s.items.find(i => i._id === a.payload._id && i.color === a.payload.color && i.size === a.payload.size);
      if (existing) {
        existing.qty = Math.min(existing.qty + (a.payload.qty || 1), existing.stock);
      } else {
        s.items.push({ ...a.payload, qty: a.payload.qty || 1 });
      }
      localStorage.setItem('shommoCart', JSON.stringify(s.items));
    },
    removeFromCart: (s, a) => {
      s.items = s.items.filter(i => !(i._id === a.payload._id && i.color === a.payload.color && i.size === a.payload.size));
      localStorage.setItem('shommoCart', JSON.stringify(s.items));
    },
    updateQty: (s, a) => {
      const item = s.items.find(i => i._id === a.payload._id && i.color === a.payload.color && i.size === a.payload.size);
      if (item) item.qty = a.payload.qty;
      localStorage.setItem('shommoCart', JSON.stringify(s.items));
    },
    clearCart: (s) => { s.items = []; localStorage.removeItem('shommoCart'); },
    setShippingAddress: (s, a) => {
      s.shippingAddress = a.payload;
      localStorage.setItem('shommoAddress', JSON.stringify(a.payload));
    },
  },
});

// ── Wishlist slice ───────────────────────────────────────────────────────────
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: JSON.parse(localStorage.getItem('shommoWishlist') || '[]'),
  },
  reducers: {
    toggleWishlist: (s, a) => {
      const idx = s.items.findIndex(i => i._id === a.payload._id);
      if (idx > -1) s.items.splice(idx, 1);
      else s.items.push(a.payload);
      localStorage.setItem('shommoWishlist', JSON.stringify(s.items));
    },
    setWishlist: (s, a) => { s.items = a.payload; },
  },
});

// ── UI slice ─────────────────────────────────────────────────────────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, searchOpen: false, mobileMenu: false },
  reducers: {
    toggleCart:      (s) => { s.cartOpen   = !s.cartOpen; },
    toggleSearch:    (s) => { s.searchOpen = !s.searchOpen; },
    toggleMobileMenu:(s) => { s.mobileMenu = !s.mobileMenu; },
    closeAll:        (s) => { s.cartOpen = false; s.searchOpen = false; s.mobileMenu = false; },
  },
});

export const store = configureStore({
  reducer: {
    auth:     authSlice.reducer,
    cart:     cartSlice.reducer,
    wishlist: wishlistSlice.reducer,
    ui:       uiSlice.reducer,
  },
});

export const { setUser, logout, setLoading, setError, clearError } = authSlice.actions;
export const { addToCart, removeFromCart, updateQty, clearCart, setShippingAddress } = cartSlice.actions;
export const { toggleWishlist, setWishlist } = wishlistSlice.actions;
export const { toggleCart, toggleSearch, toggleMobileMenu, closeAll } = uiSlice.actions;

export const selectUser       = s => s.auth.user;
export const selectCart       = s => s.cart.items;
export const selectCartTotal  = s => s.cart.items.reduce((acc, i) => acc + (i.discountPrice || i.price) * i.qty, 0);
export const selectCartCount  = s => s.cart.items.reduce((acc, i) => acc + i.qty, 0);
export const selectWishlist   = s => s.wishlist.items;
