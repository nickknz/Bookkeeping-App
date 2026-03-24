import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AddPage from "../pages/AddPage";
import MOCK_TRANSACTIONS from "../data/mockTransactions";

export default function MainLayout() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [showAddPage, setShowAddPage] = useState(false);

  const handleAddTransaction = useCallback((newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar onAddClick={() => setShowAddPage(true)} />
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ transactions }} />
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
