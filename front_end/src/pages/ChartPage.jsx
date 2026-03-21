import { useMemo } from "react";
import { getCategoryById } from "../data/categories";
import CategoryIcon from "../components/CategoryIcon";

const CHART_COLORS = ["#FA6400", "#3491FA", "#F54A45", "#36C361", "#B37FEB", "#FAAD14", "#EB2F96", "#13C2C2", "#FF7D00", "#8C8C8C"];

export default function ChartPage({ transactions }) {
  const month = "2026-03";
  const monthExpense = transactions.filter((t) => t.date.startsWith(month) && t.type === "expense");
  const total = monthExpense.reduce((s, t) => s + t.amount, 0);

  const ranked = useMemo(() => {
    const map = {};
    monthExpense.forEach((t) => {
      map[t.catId] = (map[t.catId] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([id, amount]) => ({
        ...getCategoryById(id),
        id,
        amount,
        pct: total > 0 ? ((amount / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpense, total]);

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#fff", padding: "14px 20px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>支出分析</div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>2026年3月</div>

        {/* Donut chart */}
        <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
          <svg viewBox="0 0 36 36" width="160" height="160">
            {ranked.reduce(
              (acc, item, i) => {
                const pct = parseFloat(item.pct);
                const offset = acc.offset;
                acc.elements.push(
                  <circle
                    key={i}
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth="4"
                    strokeDasharray={`${pct * 0.88} ${88 - pct * 0.88}`}
                    strokeDashoffset={-offset * 0.88}
                    transform="rotate(-90 18 18)"
                  />
                );
                acc.offset += pct;
                return acc;
              },
              { elements: [], offset: 0 }
            ).elements}
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>总支出</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1F2937" }}>¥{total.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* Ranking list */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
          {ranked.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "13px 14px",
                borderBottom: i < ranked.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: item.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CategoryIcon id={item.id} color={item.color} />
              </div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#1F2937" }}>{item.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>¥{item.amount.toFixed(2)}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "#F3F4F6", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${item.pct}%`,
                      background: CHART_COLORS[i % CHART_COLORS.length],
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8, minWidth: 40, textAlign: "right" }}>
                {item.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}
