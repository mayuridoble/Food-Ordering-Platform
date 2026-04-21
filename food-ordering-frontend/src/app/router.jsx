import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import RequireAuth from '../components/auth/RequireAuth'
import RequireRole from '../components/auth/RequireRole'
import AppLayout from '../components/layout/AppLayout'
import AdminOrdersPage from '../pages/AdminOrdersPage'
import CartPage from '../pages/CartPage'
import DashboardPage from '../pages/DashboardPage'
import FavoritesPage from '../pages/FavoritesPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NotesPage from '../pages/NotesPage'
import NotFoundPage from '../pages/NotFoundPage'
import RestaurantDetailsPage from '../pages/RestaurantDetailsPage'
import RestaurantsPage from '../pages/RestaurantsPage'
import SignupPage from '../pages/SignupPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'restaurants', element: <RestaurantsPage /> },
          { path: 'restaurants/:id', element: <RestaurantDetailsPage /> },
          {
            path: 'cart',
            element: (
              <RequireAuth>
                <CartPage />
              </RequireAuth>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            ),
          },
          {
            path: 'favorites',
            element: (
              <RequireAuth>
                <FavoritesPage />
              </RequireAuth>
            ),
          },
          {
            path: 'notes',
            element: (
              <RequireAuth>
                <NotesPage />
              </RequireAuth>
            ),
          },
          {
            path: 'admin/orders',
            element: (
              <RequireRole allowedRoles={['ROLE_ADMIN', 'ROLE_RESTAURANT_OWNER']}>
                <AdminOrdersPage />
              </RequireRole>
            ),
          },
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
