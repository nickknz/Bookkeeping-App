import { fromCents, toCents } from "./format";

export function getBudgetOverview(budget, expenseCents) {
  if (!budget) return null;

  const limitCents = toCents(budget.limitAmount);
  const remainingCents = limitCents - expenseCents;
  const percentage = limitCents > 0 ? (expenseCents / limitCents) * 100 : 0;
  const isOverBudget = remainingCents < 0;

  let status = "预算内";
  if (isOverBudget) status = "已超支";
  else if (remainingCents === 0) status = "已用尽";
  else if (percentage >= 80) status = "接近上限";

  return {
    limit: fromCents(limitCents),
    expense: fromCents(expenseCents),
    remaining: fromCents(remainingCents),
    percentage,
    progress: Math.min(Math.max(percentage, 0), 100),
    isOverBudget,
    status,
  };
}
