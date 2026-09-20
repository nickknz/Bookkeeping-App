import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";

const HomePage = lazy(() => import("./pages/HomePage"));
const BudgetPage = lazy(() => import("./pages/BudgetPage"));
const ChartPage = lazy(() => import("./pages/ChartPage"));
const LedgerPage = lazy(() => import("./pages/LedgerPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function PageLoader() {
  return (
    <div className="mx-auto max-w-[1460px] animate-pulse px-4 pt-[92px] sm:px-6 lg:px-9 lg:py-9 xl:px-12" role="status" aria-label="页面加载中">
      <div className="h-3 w-20 rounded-full bg-[#e3e4df]" />
      <div className="mt-4 h-8 w-48 rounded-xl bg-[#e3e4df]" />
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="h-64 rounded-[24px] bg-[#e9eae6] lg:col-span-2" />
        <div className="h-64 rounded-[24px] bg-[#e9eae6]" />
      </div>
      <span className="sr-only">正在加载页面</span>
    </div>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LazyPage><HomePage /></LazyPage>} />
        <Route path="/budget" element={<LazyPage><BudgetPage /></LazyPage>} />
        <Route path="/chart" element={<LazyPage><ChartPage /></LazyPage>} />
        <Route path="/ledger" element={<LazyPage><LedgerPage /></LazyPage>} />
        <Route path="/me" element={<LazyPage><ProfilePage /></LazyPage>} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
