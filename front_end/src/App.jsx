import { useState, useCallback } from "react";
import TabBar from "./components/TabBar";
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
    <>
      {/* Page content based on active tab */}
      {activeTab === "home" && <HomePage transactions={transactions} />}
      {activeTab === "chart" && <ChartPage transactions={transactions} />}
      {activeTab === "ledger" && <LedgerPage />}
      {activeTab === "me" && <ProfilePage />}

      {/* Add transaction overlay */}
      {showAddPage && (
        <AddPage
          onSave={handleAddTransaction}
          onClose={() => setShowAddPage(false)}
        />
      )}

      {/* Floating action button — only visible on home tab */}
      {activeTab === "home" && (
        <button
          onClick={() => setShowAddPage(true)}
          style={{
            position: "fixed",
            bottom: 72,
            right: "calc(50% - 195px)",
            width: 50,
            height: 50,
            borderRadius: 15,
            background: "linear-gradient(135deg, #FFC107, #FF9800)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(255,152,0,0.35)",
            zIndex: 40,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      {/* Bottom tab bar */}
      <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />
    </>
  );
}
