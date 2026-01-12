import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Login from "./Pages/login.jsx";
import Register from "./Pages/Register.jsx";
import PaymentForm from "./Pages/Payment.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Analytics from "./Pages/Analytics.jsx"; 
import LoanRequestForm from "./Pages/LoanRequestForm.jsx";
import LoanDashboard from "./Pages/LoanDashboard.jsx";
import CreditScorePage from "./Pages/CreditScore.jsx";
import SchedulePaymentForm from "./Pages/SchedulePaymentForm.jsx";
import ChatPage from "./Pages/Chat.jsx";
import Transactions from "./Pages/Transaction.jsx";
import Help from "./Pages/Help.jsx";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const authPaths = ["/login", "/register"];
  const isAuthPage = authPaths.includes(location.pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setIsAuthenticated(!!token);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [location]);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      {isAuthenticated && !isAuthPage && (
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      )}

      {/* Updated dynamic margin to handle the Fixed Sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-y-auto transition-all duration-500 
        ${isAuthenticated && !isAuthPage ? (sidebarCollapsed ? "md:ml-24" : "md:ml-72") : "ml-0"}`}>
        
        <main className={`${isAuthenticated && !isAuthPage ? "p-4 md:p-8" : "p-0"}`}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/register" replace />
                }
              />
              
              <Route
                path="/login"
                element={<PageWrapper><Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} /></PageWrapper>}
              />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

              <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><PageWrapper><PaymentForm /></PageWrapper></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><PageWrapper><Analytics /></PageWrapper></ProtectedRoute>} />
              <Route path="/loans" element={<ProtectedRoute><PageWrapper><LoanRequestForm /></PageWrapper></ProtectedRoute>} />
              <Route path="/loansdash" element={<ProtectedRoute><PageWrapper><LoanDashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/credit" element={<ProtectedRoute><PageWrapper><CreditScorePage /></PageWrapper></ProtectedRoute>} />
              <Route path="/time" element={<ProtectedRoute><PageWrapper><SchedulePaymentForm /></PageWrapper></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><PageWrapper><ChatPage currentUser={user} /></PageWrapper></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><PageWrapper><Transactions /></PageWrapper></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><PageWrapper><Help /></PageWrapper></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;