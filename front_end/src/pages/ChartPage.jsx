import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
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

  const chartData = ranked.map((item, i) => ({
    name: item.name,
    value: item.amount,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="p-8 max-w-[900px]">
      <div className="text-xl font-bold text-gray-800 mb-6">支出分析</div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          {/* Left: chart */}
          <div className="w-[42%] flex flex-col items-center justify-center py-10 px-8 border-r border-gray-100">
            <div className="text-sm text-gray-400 mb-1">2026年3月</div>
            <div className="text-xs text-gray-300 mb-6">支出分类占比</div>
            <div className="relative w-[200px] h-[200px]">
              <PieChart width={200} height={200}>
                <Pie
                  data={chartData}
                  cx={100}
                  cy={100}
                  innerRadius={62}
                  outerRadius={85}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xs text-gray-400 mb-1">总支出</div>
                <div className="text-xl font-bold text-gray-800">¥{total.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Right: ranking list */}
          <div className="flex-1 py-2">
            {ranked.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center px-6 py-4 ${i < ranked.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                {/* Rank number */}
                <div className="w-5 text-xs text-gray-300 font-medium shrink-0 mr-3">{i + 1}</div>

                <div
                  className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0"
                  style={{ background: item.bg }}
                >
                  <CategoryIcon id={item.id} color={item.color} />
                </div>

                <div className="flex-1 mx-4 min-w-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-700 ml-4 shrink-0">
                      ¥{item.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-[5px] rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                </div>

                <span className="text-xs text-gray-400 shrink-0 w-[38px] text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
