import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ChartPage from "./pages/ChartPage";
import LedgerPage from "./pages/LedgerPage";
import ProfilePage from "./pages/ProfilePage";
import AddPage from "./pages/AddPage";
import MOCK_TRANSACTIONS from "./data/mockTransactions";

export default function App() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [showAddPage, setShowAddPage] = useState(false);

  const handleAddTransaction = useCallback((newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar onAddClick={() => setShowAddPage(true)} />

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage transactions={transactions} />} />
          <Route path="/chart" element={<ChartPage transactions={transactions} />} />
          <Route path="/ledger" element={<LedgerPage />} />
          <Route path="/me" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showAddPage && (
        <AddPage
          onSave={handleAddTransaction}
          onClose={() => setShowAddPage(false)}
        />
      )}
    </div>
  );
}
