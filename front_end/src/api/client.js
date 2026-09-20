import { withCategoryVisual } from "../data/categories";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || `请求失败（${response.status}）`);
  }
  return payload?.data;
}

function mapTransaction(transaction) {
  const category = withCategoryVisual(transaction.category);
  return {
    ...transaction,
    amount: Number(transaction.amount),
    type: String(transaction.type).toLowerCase(),
    category,
  };
}

function mapBudget(budget) {
  if (!budget) return null;

  return {
    ...budget,
    limitAmount: Number(budget.limitAmount),
  };
}

export async function getCategories(signal) {
  const categories = await request("/api/categories", { signal });
  return categories.map(withCategoryVisual);
}

export async function getBudget(month, signal) {
  const query = new URLSearchParams({ month });
  const budget = await request(`/api/budgets?${query}`, { signal });
  return mapBudget(budget);
}

export async function createBudget(budget) {
  const created = await request("/api/budgets", {
    method: "POST",
    body: JSON.stringify(budget),
  });
  return mapBudget(created);
}

export async function updateBudget(id, budget) {
  const updated = await request(`/api/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify(budget),
  });
  return mapBudget(updated);
}

export function deleteBudget(id) {
  return request(`/api/budgets/${id}`, { method: "DELETE" });
}

export async function getTransactions({ startDate, endDate, signal }) {
  const transactions = [];
  let pageNumber = 0;
  let totalPages = 1;

  while (pageNumber < totalPages) {
    const query = new URLSearchParams({
      startDate,
      endDate,
      page: String(pageNumber),
      size: "500",
    });
    const page = await request(`/api/transactions?${query}`, { signal });
    transactions.push(...page.records.map(mapTransaction));
    totalPages = page.totalPages;
    pageNumber += 1;
  }

  return transactions;
}

export async function createTransaction(transaction) {
  const created = await request("/api/transactions", {
    method: "POST",
    body: JSON.stringify(transaction),
  });
  return mapTransaction(created);
}

export async function updateTransaction(id, transaction) {
  const updated = await request(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(transaction),
  });
  return mapTransaction(updated);
}

export function deleteTransaction(id) {
  return request(`/api/transactions/${id}`, { method: "DELETE" });
}
