import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import HomePage from "./pages/HomePage";
import ChartPage from "./pages/ChartPage";
import LedgerPage from "./pages/LedgerPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/"       element={<HomePage />} />
        <Route path="/chart"  element={<ChartPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/me"     element={<ProfilePage />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
