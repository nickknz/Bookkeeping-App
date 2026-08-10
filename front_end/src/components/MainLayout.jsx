import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AddPage from "../pages/AddPage";
import { createTransaction, getCategories, getTransactions } from "../api/client";
import { formatLocalDate, getCurrentMonth } from "../data/month";

export default function MainLayout() {
  const month = useMemo(() => getCurrentMonth(), []);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [showAddPage, setShowAddPage] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [loadedCategories, loadedTransactions] = await Promise.all([
          getCategories(controller.signal),
          getTransactions({
            startDate: month.startDate,
            endDate: month.endDate,
            signal: controller.signal,
          }),
        ]);
        setCategories(loadedCategories);
        setTransactions(loadedTransactions);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "无法加载账本数据");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, [month.endDate, month.startDate, reloadVersion]);

  const handleAddTransaction = useCallback(async (transaction) => {
    const created = await createTransaction(transaction);
    setTransactions((previous) => [created, ...previous]);
    return created;
  }, []);

  const retry = useCallback(() => setReloadVersion((version) => version + 1), []);

  return (
    <div className="flex min-h-screen w-full bg-[#f7f7f5]">
      <Sidebar onAddClick={() => setShowAddPage(true)} />
      <main className="app-main min-w-0 flex-1 pb-24 lg:ml-[268px] lg:pb-0">
        <Outlet context={{ transactions, categories, month, loading, error, retry }} />
      </main>
      {showAddPage && (
        <AddPage
          categories={categories}
          onSave={handleAddTransaction}
          onClose={() => setShowAddPage(false)}
          defaultDate={formatLocalDate()}
          minDate={month.startDate}
          maxDate={month.endDate}
        />
      )}
    </div>
  );
}
