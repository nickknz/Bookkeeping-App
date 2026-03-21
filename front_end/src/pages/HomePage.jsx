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
    <div>
      {/* Header */}
      <div style={{ background: "#fff", padding: "14px 20px 0" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#1F2937" }}>3月</span>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2.5 3.5L5 6.5L7.5 3.5" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer" }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Summary row */}
        <div style={{ display: "flex", padding: "20px 0 16px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>支出</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1F2937", fontFeatureSettings: '"tnum"' }}>
              {totalExpense.toFixed(2)}
            </div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>收入</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1F2937", fontFeatureSettings: '"tnum"' }}>
              {totalIncome.toFixed(2)}
            </div>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>结余</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1F2937", fontFeatureSettings: '"tnum"' }}>
              {balance >= 0 ? "+" : ""}{balance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction list by day */}
      <div style={{ padding: "4px 14px" }}>
        {grouped.map(([date, txs]) => {
          const dayExpense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
          const dayIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

          return (
            <div key={date} style={{ marginTop: 10 }}>
              {/* Day header */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px 6px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                  {formatDateLabel(date)}
                  <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 12, marginLeft: 4 }}>
                    {getWeekday(date)}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: "#B0B0B0" }}>
                  {dayExpense > 0 && <span>支出 ¥{dayExpense.toFixed(2)}</span>}
                  {dayExpense > 0 && dayIncome > 0 && <span style={{ margin: "0 4px" }}>|</span>}
                  {dayIncome > 0 && <span>收入 ¥{dayIncome.toFixed(2)}</span>}
                </span>
              </div>

              {/* Card */}
              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
                {txs.map((tx, i) => (
                  <TransactionItem key={tx.id} transaction={tx} showBorder={i < txs.length - 1} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}
