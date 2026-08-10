import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { PageErrorState, PageLoadingState } from "../components/DataState";
import TransactionItem from "../components/TransactionItem";
import { formatDateLabel, getWeekday, groupTransactionsByDate } from "../data/dateUtils";
import { money } from "../data/format";

export default function HomePage() {
  const { transactions, month, loading, error, retry } = useOutletContext();

  const summary = useMemo(() => {
    const monthTransactions = transactions.filter((transaction) => transaction.date.startsWith(month.key));
    const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === "expense");
    const incomeTransactions = monthTransactions.filter((transaction) => transaction.type === "income");
    const expense = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const income = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    const categoryTotals = new Map();
    expenseTransactions.forEach((transaction) => {
      const current = categoryTotals.get(transaction.categoryId);
      categoryTotals.set(transaction.categoryId, {
        ...transaction.category,
        amount: (current?.amount || 0) + transaction.amount,
      });
    });

    const topCategories = [...categoryTotals.values()]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    return {
      monthTransactions,
      expense,
      income,
      balance: income - expense,
      grouped: groupTransactionsByDate(monthTransactions),
      topCategories,
    };
  }, [month.key, transactions]);

  if (loading) return <PageLoadingState />;
  if (error) return <PageErrorState message={error} onRetry={retry} />;

  return (
    <div className="page-enter mx-auto max-w-[1460px] px-4 pt-[92px] sm:px-6 lg:px-9 lg:py-9 xl:px-12">
      <PageHeader
        eyebrow="Overview"
        title="下午好，欢迎回来"
        description={`这是你 ${month.month} 月的财务概览。保持记录，资金流向会越来越清晰。`}
      >
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e6e1] bg-white px-3.5 text-xs font-semibold text-[#70706a] shadow-sm transition hover:border-[#cfd1ca]"
        >
          <CalendarDays size={15} className="text-[#b37800]" />
          {month.label}
          <ChevronDown size={14} className="text-[#9d9d96]" />
        </button>
      </PageHeader>

      <section className="grid gap-5 xl:grid-cols-5">
        <div className="relative min-h-[292px] overflow-hidden rounded-[26px] bg-[#ffc928] p-6 text-[#2c2c29] shadow-[0_18px_55px_rgba(146,103,0,0.16)] sm:p-8 xl:col-span-3">
          <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[42px] border-black/[0.035]" />
          <div className="pointer-events-none absolute -bottom-32 right-28 h-64 w-64 rounded-full border-[36px] border-white/20" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-black/50">
                  <WalletCards size={15} />
                  本月可支配结余
                </div>
                <div className="numeric mt-3 text-[38px] font-bold tracking-[-0.05em] sm:text-[48px]">
                  <span className="mr-1.5 text-xl font-medium text-black/50">¥</span>{money(summary.balance)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white/40 px-3 py-1.5 text-[11px] font-bold text-[#5c4700]">
                <TrendingUp size={13} />
                状态良好
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-black/[0.08] pt-5 sm:grid-cols-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/40">本月收入</div>
                <div className="numeric mt-2 text-[17px] font-semibold text-black/80">¥{money(summary.income)}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/40">本月支出</div>
                <div className="numeric mt-2 text-[17px] font-semibold text-black/80">¥{money(summary.expense)}</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/40">结余率</div>
                <div className="numeric mt-2 text-[17px] font-semibold text-[#5c4700]">
                  {summary.income > 0 ? ((summary.balance / summary.income) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-shadow flex min-h-[292px] flex-col rounded-[26px] border border-white bg-white p-6 sm:p-7 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a0a099]">Monthly budget</div>
              <h2 className="mt-1.5 text-lg font-bold tracking-[-0.02em] text-[#2c2c29]">月度预算</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#f5f5f2] px-3 py-1.5 text-[10px] font-bold text-[#85857e]">未设置</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff8db] text-[#a97000]">
                <Target size={19} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-1 flex-col justify-center rounded-[20px] bg-[#fafaf8] p-5">
            <p className="text-xs leading-5 text-[#898982]">预算功能尚未设置，以下仅展示当前月份的真实交易汇总。</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4">
                <div className="text-[10px] font-semibold text-[#9a9a93]">本月收入</div>
                <div className="numeric mt-2 text-lg font-bold text-[#15936a]">¥{money(summary.income)}</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="text-[10px] font-semibold text-[#9a9a93]">本月支出</div>
                <div className="numeric mt-2 text-lg font-bold text-[#343431]">¥{money(summary.expense)}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#ecece8] pt-4 text-[11px]">
            <span className="text-[#9a9a93]">未使用演示预算数据</span>
            <span className="font-bold text-[#a97000]">预算待设置</span>
          </div>
        </div>
      </section>

      <section className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.65fr)]">
        <div className="surface-shadow overflow-hidden rounded-[24px] border border-white bg-white">
          <div className="flex items-center justify-between border-b border-[#ecece8] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-[16px] font-bold text-[#2c2c29]">近期明细</h2>
              <p className="mt-1 text-[11px] text-[#9a9a93]">本月共 {summary.monthTransactions.length} 笔收支记录</p>
            </div>
            <button type="button" className="flex items-center gap-1.5 text-xs font-bold text-[#a97000] transition hover:gap-2.5">
              全部明细 <ArrowRight size={14} />
            </button>
          </div>

          <div>
            {!summary.grouped.length && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff8dc] text-[#a97000]">
                  <WalletCards size={20} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[#474742]">这个月还没有记录</h3>
                <p className="mt-1.5 text-[11px] text-[#9a9a93]">点击“记一笔”，开始建立你的真实账本。</p>
              </div>
            )}
            {summary.grouped.map(([date, dayTransactions], groupIndex) => {
              const dayExpense = dayTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
              const dayIncome = dayTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
              return (
                <div key={date} className={groupIndex > 0 ? "border-t-[5px] border-[#f7f7f5]" : ""}>
                  <div className="flex items-center justify-between bg-[#fbfbf9] px-5 py-3 sm:px-6">
                    <div className="text-[11px] font-bold text-[#74746e]">
                      {formatDateLabel(date)} <span className="ml-1 font-medium text-[#a8a8a1]">{getWeekday(date)}</span>
                    </div>
                    <div className="numeric flex gap-3 text-[10px] text-[#9a9a93]">
                      {dayExpense > 0 && <span>支出 ¥{money(dayExpense)}</span>}
                      {dayIncome > 0 && <span className="text-[#15936a]">收入 ¥{money(dayIncome)}</span>}
                    </div>
                  </div>
                  {dayTransactions.map((transaction, index) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      showBorder={index < dayTransactions.length - 1}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-8">
          <div className="surface-shadow rounded-[24px] border border-white bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-bold text-[#2c2c29]">支出去向</h2>
                <p className="mt-1 text-[11px] text-[#9a9a93]">按分类占比</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff8dc] text-[#a97000]">
                <TrendingUp size={17} />
              </div>
            </div>
            <div className="space-y-5">
              {!summary.topCategories.length && (
                <p className="rounded-2xl bg-[#fafaf8] px-4 py-8 text-center text-[11px] text-[#9a9a93]">
                  记录支出后，这里会显示分类占比。
                </p>
              )}
              {summary.topCategories.map((category) => {
                const percentage = summary.expense > 0 ? (category.amount / summary.expense) * 100 : 0;
                return (
                  <div key={category.id}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: category.color }} />
                        <span className="font-semibold text-[#66665f]">{category.name}</span>
                      </div>
                      <span className="numeric font-bold text-[#343431]">¥{money(category.amount)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#ecece8]">
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: category.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-[#fff3c2] p-6">
            <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full border-[18px] border-white/30" />
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-[#a97000]">
                <Sparkles size={17} />
              </div>
              <h3 className="mt-4 text-[15px] font-bold text-[#5c4800]">本月财务小结</h3>
              <p className="mt-2 text-xs leading-6 text-[#706b5d]">
                {summary.topCategories.length
                  ? `${summary.topCategories[0].name}是当前最大支出。照这个节奏，本月预计还能结余约 ¥${money(summary.balance)}。`
                  : "完成第一笔记账后，这里会根据真实数据生成本月小结。"}
              </p>
              <button type="button" className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#946400]">
                查看完整建议 <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
