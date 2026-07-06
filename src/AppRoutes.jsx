import { Routes, Route } from "react-router-dom";
import App from "./App";
import LoginPage from "./routes/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./routes/admin/AdminLayout";
import TerrenosListPage from "./routes/admin/TerrenosListPage";
import TerrenoFormPage from "./routes/admin/TerrenoFormPage";
import CatalogoPage from "./routes/catalogo/CatalogoPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TerrenosListPage />} />
        <Route path="terrenos/novo" element={<TerrenoFormPage />} />
        <Route path="terrenos/:id" element={<TerrenoFormPage />} />
      </Route>

      <Route
        path="/catalogo"
        element={
          <ProtectedRoute>
            <CatalogoPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
