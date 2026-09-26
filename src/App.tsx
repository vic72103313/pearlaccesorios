import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { StoreConfigProvider } from './context/StoreConfigContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/PublicLayout'
import AdminLayout from './components/AdminLayout'

import Home from './pages/public/Home'
import Catalog from './pages/public/Catalog'
import ProductDetail from './pages/public/ProductDetail'
import Cart from './pages/public/Cart'
import Checkout from './pages/public/Checkout'
import OrderSuccess from './pages/public/OrderSuccess'
import Contact from './pages/public/Contact'

import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import ProductForm from './pages/admin/ProductForm'
import Categories from './pages/admin/Categories'
import Orders from './pages/admin/Orders'
import Customers from './pages/admin/Customers'
import OffersPage from './pages/admin/Offers'
import Sales from './pages/admin/Sales'
import Users from './pages/admin/Users'
import SettingsPage from './pages/admin/Settings'

export default function App() {
  return (
    <AuthProvider>
      <StoreConfigProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Tienda pública */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/finalizar-pedido" element={<Checkout />} />
                <Route path="/pedido-enviado" element={<OrderSuccess />} />
                <Route path="/contacto" element={<Contact />} />
              </Route>

              {/* Panel administrativo */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="productos" element={<Products />} />
                <Route path="productos/nuevo" element={<ProductForm />} />
                <Route path="productos/:id" element={<ProductForm />} />
                <Route path="categorias" element={<Categories />} />
                <Route path="pedidos" element={<Orders />} />
                <Route path="clientes" element={<Customers />} />
                <Route path="ofertas" element={<OffersPage />} />
                <Route path="ventas" element={<Sales />} />
                <Route path="usuarios" element={<Users />} />
                <Route path="configuracion" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </StoreConfigProvider>
    </AuthProvider>
  )
}
