import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, selectUser } from './context/store';
import { authAPI } from './api';

// Layouts
import MainLayout from './components/layout/MainLayout';
import { AdminLayout, StaffLayout, UserLayout } from './components/layout/AdminLayout';

// Public Pages
import HomePage      from './pages/HomePage';
import ProductsPage  from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CartPage      from './pages/CartPage';
import CheckoutPage  from './pages/CheckoutPage';
import OrderSuccess  from './pages/OrderSuccess';
import NotFoundPage  from './pages/NotFoundPage';

// Auth Pages
import LoginPage      from './pages/auth/LoginPage';
import RegisterPage   from './pages/auth/RegisterPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserOrders    from './pages/user/UserOrders';
import OrderDetail   from './pages/user/OrderDetail';
import UserWishlist  from './pages/user/UserWishlist';
import UserProfile   from './pages/user/UserProfile';
import UserAddresses from './pages/user/UserAddresses';

// Admin Pages
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminProducts   from './pages/admin/AdminProducts';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminOrders     from './pages/admin/AdminOrders';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons    from './pages/admin/AdminCoupons';
import AdminBanners    from './pages/admin/AdminBanners';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffOrders    from './pages/staff/StaffOrders';

// Route guards
const PrivateRoute = ({ children }) => {
  const user = useSelector(selectUser);
  return user ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
  const user = useSelector(selectUser);
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};
const StaffRoute = ({ children }) => {
  const user = useSelector(selectUser);
  return ['admin', 'staff'].includes(user?.role) ? children : <Navigate to="/" replace />;
};

function App() {
  const dispatch = useDispatch();
  const user     = useSelector(selectUser);

  // Refresh user profile on mount
  useEffect(() => {
    if (user?.token) {
      authAPI.getMe()
        .then(res => dispatch(setUser({ ...res.data, token: user.token })))
        .catch(() => {});
    }
  // eslint-disable-next-line
  }, []);

  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<MainLayout />}>
          <Route index                  element={<HomePage />} />
          <Route path="products"        element={<ProductsPage />} />
          <Route path="products/:slug"  element={<ProductDetail />} />
          <Route path="category/:slug"  element={<ProductsPage />} />
          <Route path="cart"            element={<CartPage />} />
          <Route path="checkout"        element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="order-success/:id" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
          <Route path="*"               element={<NotFoundPage />} />
        </Route>

        {/* ── Auth ── */}
        <Route path="/login"                    element={<LoginPage />} />
        <Route path="/register"                 element={<RegisterPage />} />
        <Route path="/forgot-password"          element={<ForgotPassword />} />
        <Route path="/reset-password/:token"    element={<ResetPassword />} />

        {/* ── User Dashboard ── */}
        <Route path="/account" element={<PrivateRoute><UserLayout /></PrivateRoute>}>
          <Route index              element={<UserDashboard />} />
          <Route path="orders"      element={<UserOrders />} />
          <Route path="orders/:id"  element={<OrderDetail />} />
          <Route path="wishlist"    element={<UserWishlist />} />
          <Route path="profile"     element={<UserProfile />} />
          <Route path="addresses"   element={<UserAddresses />} />
        </Route>

        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index                   element={<AdminDashboard />} />
          <Route path="products"         element={<AdminProducts />} />
          <Route path="products/add"     element={<AdminAddProduct />} />
          <Route path="products/edit/:id" element={<AdminAddProduct />} />
          <Route path="orders"           element={<AdminOrders />} />
          <Route path="users"            element={<AdminUsers />} />
          <Route path="categories"       element={<AdminCategories />} />
          <Route path="coupons"          element={<AdminCoupons />} />
          <Route path="banners"          element={<AdminBanners />} />
        </Route>

        {/* ── Staff ── */}
        <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
          <Route index          element={<StaffDashboard />} />
          <Route path="orders"  element={<StaffOrders />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
