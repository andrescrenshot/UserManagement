import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./Component/Layout";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import TambahUser from "./Pages/TambahUser";
import EditUser from "./Pages/EditUser";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";

import { isLoggedIn } from "./utils/auth";

function ProtectedRoute({
  children,
}) {
  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

function PublicRoute({
  children,
}) {
  if (isLoggedIn()) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/Register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/Profile"
            element={<Profile />}
          />

          <Route
            path="/dashboard/tambah"
            element={
              <TambahUser />
            }
          />

          <Route
            path="/dashboard/edit/:id"
            element={
              <EditUser />
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
