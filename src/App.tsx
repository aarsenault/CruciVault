import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { Send } from "./components/Send";
import { Transactions } from "./components/Transactions";
import { Settings } from "./components/Settings";
import { Lock } from "./components/Lock";
import { WarningStep } from "./components/onboarding/WarningStep";
import { GenerateStep } from "./components/onboarding/GenerateStep";
import { ValidateStep } from "./components/onboarding/ValidateStep";
import { SecurityProvider } from "./contexts/SecurityContext";

const AppContent: React.FC = () => {
  const location = useLocation();

  const isOnboardingRoute = location.pathname.startsWith("/onboarding");

  const getBackHandler = () => {
    switch (location.pathname) {
      case "/onboarding/warning":
        return () => window.history.back();
      case "/onboarding/generate":
        return () => window.history.back();
      case "/onboarding/validate":
        return () => window.history.back();
      default:
        return undefined;
    }
  };

  return (
    <Layout showBackButton={isOnboardingRoute} onBack={getBackHandler()}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/lock" element={<Lock />} />
        <Route path="/onboarding/warning" element={<WarningStep />} />
        <Route path="/onboarding/generate" element={<GenerateStep />} />
        <Route path="/onboarding/validate" element={<ValidateStep />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <SecurityProvider>
        <AppContent />
      </SecurityProvider>
    </Router>
  );
};

export default App;
