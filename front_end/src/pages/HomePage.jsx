import TransactionItem from "../components/TransactionItem";
import { formatDateLabel, getWeekday, groupTransactionsByDate } from "../data/dateUtils";

export default function HomePage({ transactions }) {
  const month = "2026-03";
  const monthTxs = transactions.filter((t) => t.date.startsWith(month));
  const totalExpense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const grouped = groupTransactionsByDate(monthTxs);

  return (
    <div className="p-8 max-w-[900px]">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xl font-bold text-gray-800">2026年3月</span>
          <svg width="12" height="12" viewBox="0 0 10 10">
            <path d="M2.5 3.5L5 6.5L7.5 3.5" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <button className="w-9 h-9 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "支出", value: `¥${totalExpense.toFixed(2)}`, color: "text-gray-800" },
          { label: "收入", value: `¥${totalIncome.toFixed(2)}`, color: "text-emerald-600" },
          { label: "结余", value: `${balance >= 0 ? "+" : "−"}¥${Math.abs(balance).toFixed(2)}`, color: balance >= 0 ? "text-gray-800" : "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100">
            <div className="text-xs font-medium text-gray-400 mb-2 tracking-wide uppercase">{label}</div>
            <div className={`text-[22px] font-bold ${color} leading-tight`} style={{ fontFeatureSettings: '"tnum"' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-5">
        {grouped.map(([date, txs]) => {
          const dayExpense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
          const dayIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

          return (
            <div key={date}>
              {/* Day header */}
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-[13px] font-semibold text-gray-600">
                  {formatDateLabel(date)}
                  <span className="font-normal text-gray-400 ml-1">{getWeekday(date)}</span>
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-2">
                  {dayExpense > 0 && <span>支出 ¥{dayExpense.toFixed(2)}</span>}
                  {dayExpense > 0 && dayIncome > 0 && <span className="text-gray-200">|</span>}
                  {dayIncome > 0 && <span>收入 ¥{dayIncome.toFixed(2)}</span>}
                </span>
              </div>

              {/* Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {txs.map((tx, i) => (
                  <TransactionItem key={tx.id} transaction={tx} showBorder={i < txs.length - 1} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
