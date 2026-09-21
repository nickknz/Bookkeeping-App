import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Save,
  Target,
  Trash2,
  WalletCards,
} from "lucide-react";
import { PageErrorState, PageLoadingState } from "../components/DataState";
import PageHeader from "../components/PageHeader";
import { getBudgetOverview } from "../data/budget";
import { fromCents, money, toCents } from "../data/format";

const MAX_BUDGET_CENTS = 999_999_999_999;

function isValidBudgetAmount(value) {
  const normalized = value.trim();
  if (!/^\d{1,10}(?:\.\d{0,2})?$/.test(normalized)) return false;
  const cents = toCents(normalized);
  return cents >= 1 && cents <= MAX_BUDGET_CENTS;
}

export default function BudgetPage() {
  const {
    transactions,
    budget,
    budgetError,
    budgetLoading,
    month,
    loading,
    error,
    retry,
    retryBudget,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useOutletContext();
  const [amount, setAmount] = useState("");
  const [operation, setOperation] = useState(null);
  const [formError, setFormError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const expenseCents = useMemo(
    () => transactions
      .filter((transaction) => transaction.type === "expense" && transaction.date.startsWith(month.key))
      .reduce((sum, transaction) => sum + toCents(transaction.amount), 0),
    [month.key, transactions],
  );
  const overview = useMemo(
    () => getBudgetOverview(budget, expenseCents),
    [budget, expenseCents],
  );

  useEffect(() => {
    setAmount(budget ? Number(budget.limitAmount).toFixed(2) : "");
    setConfirmingDelete(false);
  }, [budget]);

  const amountIsValid = isValidBudgetAmount(amount);
  const amountChanged = !budget || toCents(amount) !== toCents(budget.limitAmount);
  const busy = operation !== null;

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    setFormError(null);
    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!amountIsValid || !amountChanged || busy || budgetError) return;

    const wasUpdating = Boolean(budget);
    const limitAmount = fromCents(toCents(amount));
    setOperation("save");
    setFormError(null);
    setFeedback(null);

    try {
      if (budget) await updateBudget(budget.id, limitAmount);
      else await createBudget(limitAmount);
      setFeedback(wasUpdating ? "预算已更新，首页进度已同步。" : "预算已创建，首页进度已同步。");
    } catch (saveError) {
      setFormError(saveError.message || "预算保存失败，请稍后重试。");
    } finally {
      setOperation(null);
    }
  };

  const handleDelete = async () => {
    if (!budget || busy) return;
    setOperation("delete");
    setFormError(null);
    setFeedback(null);

    try {
      await deleteBudget(budget.id);
      setConfirmingDelete(false);
      setFeedback("本月预算已删除，交易记录不会受到影响。");
    } catch (deleteError) {
      setFormError(deleteError.message || "预算删除失败，请稍后重试。");
    } finally {
      setOperation(null);
    }
  };

  if (loading) return <PageLoadingState />;
  if (error) return <PageErrorState message={error} onRetry={retry} />;
  if (budgetLoading) return <PageLoadingState />;

  return (
    <div className="page-enter mx-auto max-w-[1460px] px-4 pt-[92px] sm:px-6 lg:px-9 lg:py-9 xl:px-12">
      <PageHeader
        eyebrow="Budget"
        title="月度预算"
        description="为本月支出设定一个清晰边界，进度会随着每笔支出自动更新。"
      >
        <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e6e1] bg-white px-3.5 text-xs font-semibold text-[#70706a] shadow-sm">
          <CalendarDays size={15} className="text-[#b37800]" />
          {month.label}
        </div>
      </PageHeader>

      <section className="grid items-start gap-5 xl:grid-cols-5">
        <div className="relative min-h-[390px] overflow-hidden rounded-[28px] bg-[#ffc928] p-6 text-[#2c2c29] shadow-[0_18px_55px_rgba(146,103,0,0.16)] sm:p-8 xl:col-span-3">
          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[46px] border-black/[0.035]" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full border-[34px] border-white/20" />

          {overview ? (
            <div className="relative flex min-h-[326px] flex-col justify-between gap-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-black/50">
                    <WalletCards size={15} /> 本月预算额度
                  </div>
                  <div className="numeric mt-4 text-[40px] font-bold tracking-[-0.05em] sm:text-[54px]">
                    <span className="mr-1.5 text-xl font-semibold text-black/45">¥</span>{money(overview.limit)}
                  </div>
                </div>
                <span className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                  overview.tone === "danger"
                    ? "border-[#8e311e]/10 bg-[#fff0ed] text-[#b84731]"
                    : overview.tone === "warning"
                      ? "border-[#8a6800]/10 bg-[#fff8db] text-[#846100]"
                      : "border-[#157c59]/10 bg-[#e8f8ed] text-[#157c59]"
                }`}>
                  {overview.status}
                </span>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-4 text-[11px] font-semibold text-black/50">
                  <span>本月预算进度</span>
                  <span className="numeric text-black/70">已使用 {overview.percentage.toFixed(1)}%</span>
                </div>
                <div
                  className="h-3 overflow-hidden rounded-full bg-black/[0.08]"
                  role="progressbar"
                  aria-label="本月预算使用进度"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={Math.round(overview.progress)}
                  aria-valuetext={`已使用 ${overview.percentage.toFixed(1)}%`}
                >
                  <div
                    className={`h-full rounded-full transition-[width] ${overview.isOverBudget ? "bg-[#c9573d]" : "bg-[#493b12]/75"}`}
                    style={{ width: `${overview.progress}%` }}
                  />
                </div>

                <div className="mt-7 grid grid-cols-2 gap-4 border-t border-black/[0.08] pt-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">本月支出</div>
                    <div className="numeric mt-2 text-xl font-bold text-black/75">¥{money(overview.expense)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">
                      {overview.isOverBudget ? "超出额度" : "可用余额"}
                    </div>
                    <div className={`numeric mt-2 text-xl font-bold ${overview.isOverBudget ? "text-[#a73d29]" : "text-black/75"}`}>
                      ¥{money(Math.abs(overview.remaining))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-[326px] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-black/5 bg-white/45 text-[#785a00]">
                {budgetError ? <AlertCircle size={27} /> : <Target size={28} />}
              </div>
              <h2 className="mt-5 text-xl font-bold">{budgetError ? "预算读取失败" : "为本月设定预算"}</h2>
              <p className="mt-2 max-w-sm text-xs leading-6 text-black/45">
                {budgetError
                  ? "交易和分类数据仍然可用。重新读取后即可继续管理本月预算。"
                  : `当前已支出 ¥${money(fromCents(expenseCents))}，设置预算后即可查看使用进度和剩余额度。`}
              </p>
              {budgetError && (
                <button
                  type="button"
                  onClick={retryBudget}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#5d4800] shadow-sm transition hover:bg-[#fff9df]"
                >
                  <RefreshCw size={14} /> 重新读取预算
                </button>
              )}
            </div>
          )}
        </div>

        <div className="surface-shadow overflow-hidden rounded-[28px] border border-white bg-white xl:col-span-2">
          <div className="border-b border-[#ecece8] px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a0a099]">
                  {budget ? "Edit budget" : "Set budget"}
                </div>
                <h2 className="mt-1.5 text-lg font-bold text-[#2c2c29]">{budget ? "修改预算" : "设置预算"}</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff8db] text-[#a97000]">
                <Target size={19} />
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[#91918a]">预算按自然月独立保存，仅统计支出，不会影响收入和历史交易。</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7">
            {budgetError && (
              <div className="mb-5 rounded-2xl bg-[#fff2ef] p-4" role="alert">
                <div className="flex items-start gap-3">
                  <AlertCircle size={17} className="mt-0.5 shrink-0 text-[#c9573d]" />
                  <div>
                    <div className="text-xs font-bold text-[#924433]">暂时不能编辑预算</div>
                    <p className="mt-1 text-[10px] leading-5 text-[#a56d61]">{budgetError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[18px] border border-[#e7e8e3] bg-[#fafaf8] p-4 transition focus-within:border-[#e1bd55] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#e6a900]/[0.07]">
              <label htmlFor="budget-amount" className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a0a099]">每月支出上限</label>
              <div className="mt-2 flex items-center">
                <span className="mr-2 text-xl font-semibold text-[#80807a]">¥</span>
                <input
                  id="budget-amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max="9999999999.99"
                  step="0.01"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={busy || Boolean(budgetError)}
                  placeholder="0.00"
                  className="numeric min-w-0 flex-1 border-0 bg-transparent text-[30px] font-bold tracking-[-0.04em] text-[#2c2c29] outline-none placeholder:text-[#d9dad5] disabled:cursor-not-allowed disabled:text-[#aaa]"
                />
                <span className="text-[10px] text-[#a8a8a1]">CNY</span>
              </div>
            </div>

            <div className="mt-2 min-h-5 text-[10px] leading-5 text-[#999992]">
              {amount && !amountIsValid
                ? "请输入 0.01 至 9,999,999,999.99 之间的金额，最多两位小数。"
                : `${month.label} 1 日起生效，可随时修改。`}
            </div>

            {formError && (
              <p className="mt-3 rounded-xl bg-[#fff2ef] px-3 py-2.5 text-center text-[11px] font-medium text-[#bd4f49]" role="alert">
                {formError}
              </p>
            )}
            {feedback && (
              <p className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#eef9f4] px-3 py-2.5 text-center text-[11px] font-medium text-[#298264]" role="status">
                <CheckCircle2 size={14} /> {feedback}
              </p>
            )}

            <button
              type="submit"
              disabled={!amountIsValid || !amountChanged || busy || Boolean(budgetError)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ffc928] px-5 py-3.5 text-[13px] font-bold text-[#2c2c29] shadow-[0_10px_25px_rgba(146,103,0,0.14)] transition hover:bg-[#eeb315] disabled:cursor-not-allowed disabled:bg-[#e1e2dd] disabled:text-[#a0a099] disabled:shadow-none"
            >
              {operation === "save" ? (
                "正在保存..."
              ) : !amountChanged && budget ? (
                "预算金额未变"
              ) : (
                <><Save size={15} /> {budget ? "保存修改" : "创建预算"}</>
              )}
            </button>
          </form>

          {budget && (
            <div className="border-t border-[#ecece8] bg-[#fafaf8] px-5 py-5 sm:px-7">
              {confirmingDelete ? (
                <div className="rounded-2xl border border-[#f0d6cf] bg-[#fff8f6] p-4">
                  <div className="text-xs font-bold text-[#78483d]">确定删除本月预算？</div>
                  <p className="mt-1 text-[10px] leading-5 text-[#a1766c]">只会删除预算设置，已有交易记录不会改变。</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={busy}
                      className="flex-1 rounded-xl border border-[#e3e4df] bg-white px-3 py-2.5 text-[11px] font-bold text-[#70706a] disabled:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={busy}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#df655f] px-3 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#ca554f] disabled:opacity-50"
                    >
                      <Trash2 size={13} /> {operation === "delete" ? "正在删除..." : "确认删除"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDelete(true);
                    setFormError(null);
                    setFeedback(null);
                  }}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold text-[#bd5a4e] transition hover:bg-[#fff1ed] disabled:opacity-50"
                >
                  <Trash2 size={14} /> 删除本月预算
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
