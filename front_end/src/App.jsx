import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ChartPage from "./pages/ChartPage";
import LedgerPage from "./pages/LedgerPage";
import ProfilePage from "./pages/ProfilePage";
import AddPage from "./pages/AddPage";
import MOCK_TRANSACTIONS from "./data/mockTransactions";

export default function App() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState("home");
  const [showAddPage, setShowAddPage] = useState(false);

  const handleAddTransaction = useCallback((newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onAddClick={() => setShowAddPage(true)}
      />

      <main className="flex-1 overflow-y-auto">
        {activeTab === "home" && <HomePage transactions={transactions} />}
        {activeTab === "chart" && <ChartPage transactions={transactions} />}
        {activeTab === "ledger" && <LedgerPage />}
        {activeTab === "me" && <ProfilePage />}
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
