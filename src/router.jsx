import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthAdmin } from './contexts/AuthAdminContext';

import App from './App';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DetailPage from "./pages/DetailPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import PayPage from './pages/PayPage';
import OrderListPage from "./pages/OrderListPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import ForbiddenPage from './pages/admin/ForbiddenPage';

// Keep the small route guard next to the route table it protects.
// eslint-disable-next-line react-refresh/only-export-components
const AdminProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuthAdmin();
    if (!isLoggedIn) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

// 权限守卫组件
// eslint-disable-next-line react-refresh/only-export-components
const PermissionGuard = ({ permission, children }) => {
    const { hasPermission } = useAuthAdmin();
    if (!hasPermission(permission)) {
        return <ForbiddenPage />;
    }
    return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/",
        Component: HomePage,
      },
      {
        path: "/login",
        Component: LoginPage,
      },
      {
        path: "/register",
        Component: RegisterPage,
      },
      {
        path: "/home",
        Component: HomePage,
      },
      {
        path: "/category",
        Component: CategoryPage,
      },
      {
        path: "/detail/:goodId",
        Component: DetailPage,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/cart",
            Component: CartPage,
          },
          {
            path: "/profile",
            Component: ProfilePage,
          },
          {
            path: "/profile/info",
            Component: PersonalInfoPage,
          },
          {
            path: "/createOrder",
            Component: CreateOrderPage,
          },
          {
            path: "/createOrder/:goodId",
            Component: CreateOrderPage,
          },
          {
            path: "/orderList",
            Component: OrderListPage,
          },
          {
            path: "/orderDetail/:orderId",
            Component: OrderDetailPage,
          },
          {
            path: "/pay/:orderId",
            Component: PayPage,
          },
        ]
      },
    ]
  },
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "/admin",
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    children: [
      {
        path: "",
        element: <Navigate to="/admin/home" replace />,
      },
      {
        path: "home",
        element: <PermissionGuard permission="dashboard"><AdminHomePage /></PermissionGuard>,
      },
      {
        path: "products",
        element: <PermissionGuard permission="goods"><ProductManagement /></PermissionGuard>,
      },
      {
        path: "categories",
        element: <PermissionGuard permission="categories"><CategoryManagement /></PermissionGuard>,
      },
      {
        path: "orders",
        element: <PermissionGuard permission="orders"><OrderManagement /></PermissionGuard>,
      },
      {
        path: "users",
        element: <PermissionGuard permission="users"><UserManagement /></PermissionGuard>,
      },
      {
        path: "roles",
        element: <PermissionGuard permission="roles"><RoleManagement /></PermissionGuard>,
      },
    ],
  },
]);

export default router;
