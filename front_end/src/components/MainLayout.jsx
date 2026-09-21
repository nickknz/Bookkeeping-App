import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AddPage from "../pages/AddPage";
import {
  createBudget as createBudgetRequest,
  createTransaction,
  deleteBudget as deleteBudgetRequest,
  deleteTransaction as deleteTransactionRequest,
  getBudget,
  getCategories,
  getTransactions,
  updateBudget as updateBudgetRequest,
  updateTransaction as updateTransactionRequest,
} from "../api/client";
import { formatLocalDate, getCurrentMonth } from "../data/month";

export default function MainLayout() {
  const month = useMemo(() => getCurrentMonth(), []);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budget, setBudget] = useState(null);
  const [budgetError, setBudgetError] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [budgetReloadVersion, setBudgetReloadVersion] = useState(0);
  const [showAddPage, setShowAddPage] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

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

  useEffect(() => {
    const controller = new AbortController();

    async function loadBudget() {
      setBudgetLoading(true);
      setBudgetError(null);
      try {
        const loadedBudget = await getBudget(month.startDate, controller.signal);
        setBudget(loadedBudget);
      } catch (loadError) {
        // Cancellation is lifecycle control, not a failed budget request.
        if (loadError.name === "AbortError") return;
        setBudget(null);
        setBudgetError(loadError.message || "无法读取本月预算");
      } finally {
        if (!controller.signal.aborted) setBudgetLoading(false);
      }
    }

    loadBudget();
    return () => controller.abort();
  }, [budgetReloadVersion, month.startDate, reloadVersion]);

  const handleAddTransaction = useCallback(async (transaction) => {
    const created = await createTransaction(transaction);
    setTransactions((previous) => [created, ...previous]);
    return created;
  }, []);

  const handleUpdateTransaction = useCallback(async (id, transaction) => {
    const updated = await updateTransactionRequest(id, transaction);
    setTransactions((previous) => previous.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const handleDeleteTransaction = useCallback(async (id) => {
    await deleteTransactionRequest(id);
    setTransactions((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const openCreateTransaction = useCallback(() => {
    setEditingTransaction(null);
    setShowAddPage(true);
  }, []);

  const openEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setShowAddPage(true);
  }, []);

  const closeTransactionEditor = useCallback(() => {
    setShowAddPage(false);
    setEditingTransaction(null);
  }, []);

  const handleCreateBudget = useCallback(async (limitAmount) => {
    const created = await createBudgetRequest({
      month: month.startDate,
      limitAmount,
    });
    setBudget(created);
    setBudgetError(null);
    return created;
  }, [month.startDate]);

  const handleUpdateBudget = useCallback(async (id, limitAmount) => {
    const updated = await updateBudgetRequest(id, { limitAmount });
    setBudget(updated);
    setBudgetError(null);
    return updated;
  }, []);

  const handleDeleteBudget = useCallback(async (id) => {
    await deleteBudgetRequest(id);
    setBudget(null);
    setBudgetError(null);
  }, []);

  const retry = useCallback(() => setReloadVersion((version) => version + 1), []);
  const retryBudget = useCallback(() => setBudgetReloadVersion((version) => version + 1), []);

  return (
    <div className="flex min-h-screen w-full bg-[#f7f7f5]">
      <Sidebar onAddClick={openCreateTransaction} />
      <main className="app-main min-w-0 flex-1 pb-24 lg:ml-[268px] lg:pb-0">
        <Outlet
          context={{
            transactions,
            categories,
            budget,
            budgetError,
            budgetLoading,
            month,
            loading,
            error,
            retry,
            retryBudget,
            editTransaction: openEditTransaction,
            deleteTransaction: handleDeleteTransaction,
            createBudget: handleCreateBudget,
            updateBudget: handleUpdateBudget,
            deleteBudget: handleDeleteBudget,
          }}
        />
      </main>
      {showAddPage && (
        <AddPage
          key={editingTransaction?.id || "new-transaction"}
          categories={categories}
          transaction={editingTransaction}
          onSave={editingTransaction
            ? (transaction) => handleUpdateTransaction(editingTransaction.id, transaction)
            : handleAddTransaction}
          onClose={closeTransactionEditor}
          defaultDate={formatLocalDate()}
          minDate={month.startDate}
          maxDate={month.endDate}
        />
      )}
    </div>
  );
}
