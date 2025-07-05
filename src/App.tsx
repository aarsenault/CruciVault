import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout } from "components/Layout";
import { AppRouter } from "components/AppRouter";
import { SecurityProvider } from "contexts/SecurityContext";

const AppContent: React.FC = () => {
  return (
    <Layout showBackButton={false}>
      <AppRouter />
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
