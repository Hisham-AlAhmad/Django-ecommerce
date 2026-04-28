import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { PageLoader } from './components/ui/index';
import ScrollToTop from './components/ScrollToTop';

/* ── Lazy-loaded pages ───────────────────────────────────── */
const Home         = lazy(() => import('./pages/Home'));
const Products     = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart         = lazy(() => import('./pages/Cart'));
const Checkout     = lazy(() => import('./pages/Checkout'));
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const Account      = lazy(() => import('./pages/Account'));
const Contact      = lazy(() => import('./pages/Contact'));
const NotFound     = lazy(() => import('./pages/NotFound'));
const { OrderList, OrderDetail } = {
  OrderList:   lazy(() => import('./pages/Orders').then((m) => ({ default: m.OrderList }))),
  OrderDetail: lazy(() => import('./pages/Orders').then((m) => ({ default: m.OrderDetail }))),
};

/* ── Layout wrapper ──────────────────────────────────────── */
function Layout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="contact" element={<Contact />} />
              <Route path="account">
                <Route index element={<Account />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
