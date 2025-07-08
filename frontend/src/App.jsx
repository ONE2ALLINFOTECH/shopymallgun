import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Pages
import Dashboard from "./components/pages/Dashboard";
import POS from "./components/pages/Pos";
import ProductForm from "./components/pages/ProductForm";
import AdminLogin from "./components/pages/AdminLogin";
import CategoryForm from "./components/pages/CategoryForm";
import SubcategoryForm from "./components/pages/SubcategoryForm";
import BrandForm from "./components/pages/BrandForm";
import Dashboardcontent from "./components/pages/Dashboardcontent";
import BayBugForm from "./components/pages/BayBugForm";
import Allproducts from "./components/pages/Allproducts";
import EditProduct from "./components/pages/EditProduct";
import Bouncerform from "./components/pages/Bouncerform";

import Register from "./components/pages/Register";
import ProfileInfo from "./components/pages/ProfileInfo";
import AadhaarKYC from "./components/pages/AadhaarKYC";
import PanKYC from "./components/pages/PanKYC";
import ForgetPassword from "./components/pages/ForgetPassword";
import UserDashboard from "./components/pages/UserDashboard";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";
import SubsubcategoryForm from "./components/pages/SubsubcategoryForm";

const App = () => {
  return (
    <Router>
      <div className="d-flex">
        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Register />} />
            <Route path="/profile-info" element={<ProfileInfo />} />
            <Route path="/aadhaar" element={<AadhaarKYC />} />
            <Route path="/pan" element={<PanKYC />} />
            <Route
              path="/kyc-success"
              element={
                <div className="p-5 text-center">✅ KYC Successfully Completed</div>
              }
            />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/Dashboardcontent"
              element={
                <ProtectedRoute>
                  <Dashboardcontent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pos"
              element={
                <ProtectedRoute>
                  <POS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-product"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-baby-carrier"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-baby-bouncer"
              element={
                <ProtectedRoute>
                  <Bouncerform />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/baby-bag"
              element={
                <ProtectedRoute>
                  <BayBugForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <CategoryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subcategories"
              element={
                <ProtectedRoute>
                  <SubcategoryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subsubcategories"
              element={
                <ProtectedRoute>
                  <SubsubcategoryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/brands"
              element={
                <ProtectedRoute>
                  <BrandForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/all-product"
              element={
                <ProtectedRoute>
                  <Allproducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit/:id"
              element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
