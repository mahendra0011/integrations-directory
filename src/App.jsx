import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Layout from '@/components/layout/Layout';
import IntegrationsPage from '@/components/pages/IntegrationsPage';
import IntegrationDetailPage from '@/components/integrations/IntegrationDetailPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="integratekit-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/integration/:id" element={<IntegrationDetailPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
