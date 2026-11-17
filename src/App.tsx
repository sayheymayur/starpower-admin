import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AstroRoute from "./components/AstroRoute";
import AstroLayout from "./layout/AstroLayout";
import AstroOverview from "./pages/astro/AstroOverview";
import AstroUsers from "./pages/astro/AstroUsers";
import AstroUserDetail from "./pages/astro/AstroUserDetail";
import AstroAstrologers from "./pages/astro/AstroAstrologers";
import AstroAstrologerDetail from "./pages/astro/AstroAstrologerDetail";
import AstroBookings from "./pages/astro/AstroBookings";
import AstroBookingDetail from "./pages/astro/AstroBookingDetail";
import AstroCoupons from "./pages/astro/AstroCoupons";
import AstroTransactions from "./pages/astro/AstroTransactions";
import AstroTransactionDetail from "./pages/astro/AstroTransactionDetail";
import AstroPayouts from "./pages/astro/AstroPayouts";
import AstroEarningsDetail from "./pages/astro/AstroEarningsDetail";
import AstroPayoutDetail from "./pages/astro/AstroPayoutDetail";
import AstroInvoices from "./pages/astro/AstroInvoices";
import AstroBanks from "./pages/astro/AstroBanks";
import AstroBankDetail from "./pages/astro/AstroBankDetail";
import AstroRatings from "./pages/astro/AstroRatings";
import AstroRatingDetail from "./pages/astro/AstroRatingDetail";
import AstroNotifications from "./pages/astro/AstroNotifications";
import AstroUserNotifications from "./pages/astro/AstroUserNotifications";
import AstroSupportTickets from "./pages/astro/AstroSupportTickets";
import AstroSupportTicketDetail from "./pages/astro/AstroSupportTicketDetail";
import InstantSessions from "./pages/astro/InstantSessions";
import InstantSessionDetail from "./pages/astro/InstantSessionDetail";
import AstroWallets from "./pages/astro/AstroWallets";
import AstroWalletDetail from "./pages/astro/AstroWalletDetail";
import AstroWalletTransactions from "./pages/astro/AstroWalletTransactions";
import ChangePassword from "./pages/ChangePassword";
import AdminManagement from "./pages/AdminManagement";
import AdminFormPage from "./pages/AdminFormPage";
import RoleManagement from "./pages/RoleManagement";
import RoleScopesPage from "./pages/RoleScopesPage";
import Unauthorized from "./pages/Unauthorized";
import RequireAdmin from "./components/RequireAdmin";
import NotFound from "./pages/OtherPage/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/astro" replace />} />

          <Route
            path="/unauthorized"
            element={
              <ProtectedRoute minimal>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
                  <Unauthorized />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AstroRoute>
                  <AstroLayout />
                </AstroRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/astro" element={<AstroOverview />} />
            <Route path="/astro/users" element={<AstroUsers />} />
            <Route path="/astro/users/:userId" element={<AstroUserDetail />} />
            <Route path="/astro/astrologers/pending" element={<Navigate to="/astro/astrologers?filter=pending" replace />} />
            <Route path="/astro/astrologers/:userId" element={<AstroAstrologerDetail />} />
            <Route path="/astro/astrologers" element={<AstroAstrologers />} />
            <Route path="/astro/bookings" element={<AstroBookings />} />
            <Route path="/astro/bookings/:bookingId" element={<AstroBookingDetail />} />
            <Route path="/astro/instant-sessions" element={<InstantSessions />} />
            <Route path="/astro/instant-sessions/:sessionId" element={<InstantSessionDetail />} />
            <Route path="/astro/coupons" element={<AstroCoupons />} />
            <Route path="/astro/transactions" element={<AstroTransactions />} />
            <Route path="/astro/transactions/:transactionId" element={<AstroTransactionDetail />} />
            <Route path="/astro/payouts/earnings/:userId" element={<AstroEarningsDetail />} />
            <Route path="/astro/payouts/:payoutId" element={<AstroPayoutDetail />} />
            <Route path="/astro/payouts" element={<AstroPayouts />} />
            <Route path="/astro/invoices" element={<AstroInvoices />} />
            <Route path="/astro/banks" element={<AstroBanks />} />
            <Route path="/astro/banks/:userId" element={<AstroBankDetail />} />
            <Route path="/astro/wallets" element={<AstroWallets />} />
            <Route path="/astro/wallets/:userId" element={<AstroWalletDetail />} />
            <Route path="/astro/wallet-transactions" element={<AstroWalletTransactions />} />
            <Route path="/astro/ratings" element={<AstroRatings />} />
            <Route path="/astro/ratings/:ratingId" element={<AstroRatingDetail />} />
            <Route path="/astro/notifications/user/:userId" element={<AstroUserNotifications />} />
            <Route path="/astro/notifications" element={<AstroNotifications />} />
            <Route path="/astro/support/:ticketId" element={<AstroSupportTicketDetail />} />
            <Route path="/astro/support" element={<AstroSupportTickets />} />
            <Route path="/settings/password" element={<ChangePassword />} />
            <Route path="/admins" element={<RequireAdmin><AdminManagement /></RequireAdmin>} />
            <Route path="/admins/new" element={<RequireAdmin><AdminFormPage /></RequireAdmin>} />
            <Route path="/admins/:id/edit" element={<RequireAdmin><AdminFormPage /></RequireAdmin>} />
            <Route path="/roles" element={<RequireAdmin><RoleManagement /></RequireAdmin>} />
            <Route path="/roles/:roleId" element={<RequireAdmin><RoleScopesPage /></RequireAdmin>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
