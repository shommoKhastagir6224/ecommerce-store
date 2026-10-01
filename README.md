# 🛒 Shommo Store — Full Stack MERN E-Commerce Platform

A **production-ready, full-stack e-commerce platform** built for Bangladesh, inspired by premium platforms like Govaly. Features a beautiful UI, complete admin dashboard, staff delivery panel, and user management.

---

## 📸 Tech Stack

| Layer        | Technology                                              |
|---|---|
| Frontend     | React.js, Tailwind CSS, Framer Motion, Redux Toolkit    |
| Backend      | Node.js, Express.js                                     |
| Database     | MongoDB + Mongoose                                      |
| Auth         | JWT (with Firebase optional)                            |
| Images       | Cloudinary                                              |
| Payments     | Stripe / Cash on Delivery / bKash                       |
| Charts       | Recharts                                                |
| Notifications| React Hot Toast                                         |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm / yarn

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd shommo-store

# Install root + both projects
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Configure Environment Variables

**Server** — copy `.env.example` to `.env`:
```bash
cd server
cp .env.example .env
```

Fill in your MongoDB URI, JWT secret, Cloudinary keys, and Stripe key.

**Client** — copy `.env.example` to `.env`:
```bash
cd client
cp .env.example .env
```

Fill in your Firebase config and Stripe public key.

### 3. Seed the Database

```bash
cd server
node seed.js
```

This creates:
- **Admin account**: `admin@shommostore.com` / `Admin@123456`
- **Staff account**: `staff@shommostore.com` / `Staff@123456`
- **User account**: `user@shommostore.com` / `User@123456`
- 5 categories with subcategories
- 8 sample products
- 3 discount coupons (WELCOME10, SAVE50, FLASH20)
- 3 hero banners

### 4. Run the Project

```bash
# Run both server and client together from root:
npm run dev

# OR run separately:
# Terminal 1 — Server (port 5000)
cd server && npm run dev

# Terminal 2 — Client (port 3000)
cd client && npm start
```

Open: **http://localhost:3000**

---

## 📁 Project Structure

```
shommo-store/
├── client/                         # React frontend
│   ├── public/                     # Static assets
│   └── src/
│       ├── api/index.js            # All API calls (Axios)
│       ├── components/
│       │   ├── layout/
│       │   │   ├── MainLayout.js   # Public layout (navbar, footer, cart)
│       │   │   └── AdminLayout.js  # Admin, Staff, User dashboard layouts
│       │   └── ui/index.js         # Shared UI components
│       ├── context/store.js        # Redux store (auth, cart, wishlist, ui)
│       └── pages/
│           ├── HomePage.js         # Hero slider, categories, products
│           ├── ProductsPage.js     # Filter, sort, paginated products
│           ├── ProductDetail.js    # Gallery, add to cart, reviews
│           ├── CartCheckout.js     # Cart + multi-step checkout + order success
│           ├── NotFoundPage.js     # 404 page
│           ├── auth/               # Login, Register, Forgot/Reset Password
│           ├── user/               # Dashboard, Orders, Wishlist, Profile, Addresses
│           ├── admin/              # Dashboard, Products, Orders, Users, Categories, Coupons, Banners
│           └── staff/              # Staff Dashboard + Delivery Orders
│
├── server/                         # Node.js backend
│   ├── index.js                    # Express app entry point
│   ├── seed.js                     # Database seeder
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Product.js              # Product schema
│   │   └── Models.js               # Category, Order, Review, Coupon, Banner
│   ├── controllers/
│   │   ├── authController.js       # Register, login, Google, forgot/reset
│   │   ├── productController.js    # CRUD + search + filter
│   │   └── orderController.js      # Create, manage, assign, track
│   ├── routes/                     # All API routes
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protect + role guards
│   │   └── errorMiddleware.js      # 404 + error handler
│   ├── config/cloudinary.js        # Cloudinary config
│   └── utils/sendEmail.js          # Nodemailer email utility
│
└── package.json                    # Root: runs both with concurrently
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Login with Google/Firebase |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT  | `/api/auth/reset-password/:token` | Reset password |
| GET  | `/api/auth/me` | Get current user (protected) |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET  | `/api/products` | Get all (with filters: keyword, category, price, rating, sort, page) |
| GET  | `/api/products/:id` | Get by ID |
| GET  | `/api/products/slug/:slug` | Get by slug |
| GET  | `/api/products/flash-sale` | Get flash sale products |
| GET  | `/api/products/top-selling` | Get bestsellers |
| GET  | `/api/products/related/:id` | Get related products |
| POST | `/api/products` | Create product (admin) |
| PUT  | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Soft delete (admin) |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create order |
| GET  | `/api/orders/my` | Get my orders |
| GET  | `/api/orders/staff` | Get staff assigned orders |
| GET  | `/api/orders` | Get all orders (admin) |
| GET  | `/api/orders/:id` | Get order by ID |
| PUT  | `/api/orders/:id/status` | Update status (staff/admin) |
| PUT  | `/api/orders/:id/assign` | Assign delivery staff (admin) |
| PUT  | `/api/orders/:id/pay` | Mark as paid |

---

## 👤 User Roles

| Role  | Access |
|---|---|
| **user**  | Shop, cart, wishlist, orders, profile, addresses |
| **staff** | View assigned orders, update delivery status |
| **admin** | Full access: products, orders, users, categories, coupons, banners, analytics |

---

## 🎨 Features

### Frontend
- ✅ Premium animated homepage with hero slider
- ✅ Live search with debounce
- ✅ Advanced filter sidebar (category, price, rating, brand, stock)
- ✅ Product detail with image gallery, zoom, color/size selection
- ✅ Persistent cart with localStorage
- ✅ Multi-step checkout (address → payment → review)
- ✅ Coupon discount system
- ✅ Flash sale countdown timer
- ✅ Wishlist system
- ✅ User reviews and ratings
- ✅ Order tracking timeline
- ✅ Admin dashboard with Recharts analytics
- ✅ Staff delivery management panel
- ✅ Animated skeleton loading states
- ✅ Custom 404 page
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Toast notifications

### Backend
- ✅ JWT authentication with role-based access
- ✅ Google OAuth via Firebase
- ✅ Password reset via email (Nodemailer)
- ✅ Cloudinary image upload
- ✅ Stripe payment intent
- ✅ Automatic order numbering
- ✅ Product stock management
- ✅ Auto-calculate discount percentage
- ✅ Coupon validation
- ✅ Dashboard analytics aggregation

---

## 🚀 Deploy to Production

### Deploy Server (Railway / Render / VPS)
1. Set `NODE_ENV=production` in environment
2. Add all environment variables
3. Deploy from `/server` directory

### Deploy Client (Vercel / Netlify)
1. Build: `cd client && npm run build`
2. Set `REACT_APP_API_URL` to your server URL
3. Deploy the `build` folder

### MongoDB Atlas
1. Create cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add connection string to `MONGODB_URI`
3. Whitelist your server IP

---

## 📧 EmailJS / Contact
- Email: shommokhastagir00@gmail.com
- GitHub: [@shommoKhastagir6224](https://github.com/shommoKhastagir6224)

---

*Built with ❤️ in Bangladesh by Shommo Khastagir*
