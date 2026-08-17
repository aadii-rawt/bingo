import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

import UserLayout from "./layouts/UserLayout";
import VendorLayout from "./layouts/VendorLayout";
import AdminLayout from "./layouts/AdminLayout";

import UserDashboard from "./pages/user/Dashboard";
// import UserBookings from "./pages/user/Bookings";
// import UserPayments from "./pages/user/Payments";
import VendorSignup from "./pages/VendorSignup";

import VendorDashboard from "./pages/vendor/Dashboard";

// import VendorServices from "./pages/vendor/Services";
// import VendorOfferings from "./pages/vendor/Offerings";
// import VendorAvailability from "./pages/vendor/Availability";
// import VendorBookings from "./pages/vendor/Bookings";
// import VendorProfile from "./pages/vendor/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import VendorPending from "./pages/VendorPending";
import Vendors from "./pages/admin/Vendors";
import ApprovedVendors from "./pages/admin/ApprovedVendors";
import AdminServices from "./pages/admin/Services";
import Categories from "./pages/admin/Categories";
import Services from "./pages/vendor/Services";
import Offerings from "./pages/vendor/Offerings";
import Availability from "./pages/vendor/Availability";
import MyBookings from "./pages/user/MyBookings";
// import AdminVendors from "./pages/admin/Vendors";
// import AdminServices from "./pages/admin/Services";
// import AdminCategories from "./pages/admin/Categories";
// import AdminBookings from "./pages/admin/Bookings";
// import AdminProfile from "./pages/admin/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/vendor/signup"
          element={<VendorSignup />}
        />
        <Route
          path="/vendor/pending"
          element={<VendorPending />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/user"
          element={<UserLayout />}
        >
          <Route
            path="dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="bookings"
            element={<MyBookings />}
          />
          {/* 

          <Route
            path="payments"
            element={<UserPayments />}
          />

          <Route
            path="profile"
            element={<UserProfile />}
          /> */}
        </Route>

        <Route
          path="/vendor"
          element={<VendorLayout />}
        >
          <Route
            path="dashboard"
            element={<VendorDashboard />}
          />


          <Route
            path="services"
            element={<Services />}
          />
          <Route
            path="offerings"
            element={<Offerings />}
          />
          <Route
            path="availability"
            element={<Availability />}
          />
          {/*


          <Route
            path="bookings"
            element={<VendorBookings />}
          />

          <Route
            path="profile"
            element={<VendorProfile />}
          /> */}
        </Route>

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="vendors"
            element={<Vendors />}
          />
          <Route
            path="/admin/vendors/approved"
            element={<ApprovedVendors />}
          />
          <Route
            path="/admin/services"
            element={<AdminServices />}
          />
          <Route
            path="/admin/categories"
            element={<Categories />}
          />
          {/*
          <Route
            path="services"
            element={<AdminServices />}
          />

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          <Route
            path="bookings"
            element={<AdminBookings />}
          />

          <Route
            path="profile"
            element={<AdminProfile />}
          /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;