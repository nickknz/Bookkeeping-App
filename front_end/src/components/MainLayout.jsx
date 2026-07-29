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
    <div className="flex min-h-screen w-full bg-[#f7f7f5]">
      <Sidebar onAddClick={() => setShowAddPage(true)} />
      <main className="app-main min-w-0 flex-1 pb-24 lg:ml-[268px] lg:pb-0">
        <Outlet context={{ transactions }} />
      </main>
      {showAddPage && (
        <AddPage
          onSave={handleAddTransaction}
          onClose={() => setShowAddPage(false)}
          defaultDate={transactions[0]?.date}
        />
      )}
    </div>
  );
}
