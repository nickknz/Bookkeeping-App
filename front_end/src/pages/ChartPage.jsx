import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ListChecks,
  ReceiptText,
  TrendingDown,
  Utensils,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import CategoryIcon from "../components/CategoryIcon";
import { getCategoryById } from "../data/categories";
import { money, money0 } from "../data/format";

const CHART_COLORS = ["#e6a900", "#e6a23c", "#678bd6", "#df716a", "#8a72c6", "#5ba6a6", "#a68668", "#83928b"];

export default function ChartPage() {
  const { transactions } = useOutletContext();

  const analytics = useMemo(() => {
    const expenses = transactions.filter((transaction) => transaction.date.startsWith("2026-03") && transaction.type === "expense");
    const total = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);

    const categoryMap = expenses.reduce((result, transaction) => {
      result[transaction.catId] = (result[transaction.catId] || 0) + transaction.amount;
      return result;
    }, {});

    const ranked = Object.entries(categoryMap)
      .map(([id, amount], index) => ({
        ...getCategoryById(id),
        id,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        chartColor: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({ ...item, chartColor: CHART_COLORS[index % CHART_COLORS.length] }));

    const dateMap = expenses.reduce((result, transaction) => {
      result[transaction.date] = (result[transaction.date] || 0) + transaction.amount;
      return result;
    }, {});

    const trend = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date: `${Number(date.slice(8))}日`, amount }));

    return { expenses, total, ranked, trend };
  }, [transactions]);

  const largestTransaction = Math.max(...analytics.expenses.map((transaction) => transaction.amount), 0);
  const metrics = [
    { label: "本月总支出", value: `¥${money(analytics.total)}`, note: "较上月下降 8.4%", icon: CircleDollarSign, tone: "emerald" },
    { label: "日均支出", value: `¥${money(analytics.total / 19)}`, note: "按 19 个记账日计算", icon: TrendingDown, tone: "blue" },
    { label: "单笔最高", value: `¥${money(largestTransaction)}`, note: "住房 · 月租", icon: ReceiptText, tone: "amber" },
    { label: "支出笔数", value: `${analytics.expenses.length} 笔`, note: "覆盖 9 个消费分类", icon: ListChecks, tone: "violet" },
  ];

  const toneClasses = {
    emerald: "bg-[#fff3bf] text-[#a97000]",
    blue: "bg-[#edf3fb] text-[#5b7fbf]",
    amber: "bg-[#fbf3e5] text-[#b77a25]",
    violet: "bg-[#f1edfa] text-[#8067b6]",
  };

  return (
    <div className="page-enter mx-auto max-w-[1460px] px-4 pt-[92px] sm:px-6 lg:px-9 lg:py-9 xl:px-12">
      <PageHeader
        eyebrow="Analytics"
        title="收支分析"
        description="从数字里看见消费结构，找到更适合你的资金节奏。"
      >
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e6e1] bg-white px-3.5 text-xs font-semibold text-[#70706a] shadow-sm"
        >
          <CalendarDays size={15} className="text-[#b37800]" />
          2026 年 3 月
          <ChevronDown size={14} className="text-[#9d9d96]" />
        </button>
      </PageHeader>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="surface-shadow rounded-[20px] border border-white bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9b9b94] sm:text-[11px]">{metric.label}</div>
                  <div className="numeric mt-2 truncate text-lg font-bold text-[#2c2c29] sm:text-[22px]">{metric.value}</div>
                </div>
                <div className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:flex ${toneClasses[metric.tone]}`}>
                  <Icon size={17} />
                </div>
              </div>
              <div className={`mt-3 text-[10px] ${metric.tone === "emerald" ? "font-semibold text-[#b37800]" : "text-[#a4a49d]"}`}>{metric.note}</div>
            </div>
          );
        })}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
        <section className="surface-shadow rounded-[24px] border border-white bg-white p-5 sm:p-6">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#2c2c29]">支出趋势</h2>
              <p className="mt-1 text-[11px] text-[#9a9a93]">每日支出金额变化</p>
            </div>
            <div className="flex rounded-xl bg-[#f7f7f5] p-1 text-[11px] font-semibold">
              <button type="button" className="rounded-lg bg-white px-3 py-1.5 text-[#343431] shadow-sm">日</button>
              <button type="button" className="px-3 py-1.5 text-[#9a9a93]">周</button>
            </div>
          </div>

          <div className="h-[300px] w-full" role="img" aria-label="3 月每日支出趋势图">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trend} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e6a900" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#e6a900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ecece8" strokeDasharray="4 6" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9d9d96", fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a9a9a2", fontSize: 10 }} tickFormatter={(value) => `¥${value}`} />
                <Tooltip
                  cursor={{ stroke: "#e2cf91", strokeDasharray: "3 3" }}
                  formatter={(value) => [`¥${money(value)}`, "支出"]}
                  contentStyle={{ border: "1px solid #e9eae6", borderRadius: 12, boxShadow: "0 8px 25px rgba(76,63,24,.08)", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="amount" stroke="#e6a900" strokeWidth={2.5} fill="url(#expenseArea)" activeDot={{ r: 5, strokeWidth: 3, stroke: "white", fill: "#e6a900" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#fffaf0] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#a97000] shadow-sm">
              <TrendingDown size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#464642]">消费趋势整体平稳</div>
              <div className="mt-1 text-[10px] leading-relaxed text-[#92928b]">15 日因房租产生明显峰值，其余日期日均支出低于 ¥300。</div>
            </div>
          </div>
        </section>

        <section className="surface-shadow rounded-[24px] border border-white bg-white p-5 sm:p-6">
          <div className="mb-3">
            <h2 className="text-[16px] font-bold text-[#2c2c29]">分类占比</h2>
            <p className="mt-1 text-[11px] text-[#9a9a93]">本月支出构成</p>
          </div>

          <div className="relative mx-auto h-[224px] max-w-[280px]" role="img" aria-label="3 月支出分类占比环形图">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.ranked} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={67} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                  {analytics.ranked.map((item) => <Cell key={item.id} fill={item.chartColor} />)}
                </Pie>
                <Tooltip formatter={(value) => [`¥${money(value)}`, "支出"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#9a9a93]">总支出</span>
              <span className="numeric mt-1 text-xl font-bold text-[#2c2c29]">¥{money0(analytics.total)}</span>
            </div>
          </div>

          <div className="mt-1 max-h-[334px] space-y-1 overflow-y-auto pr-1 soft-scrollbar">
            {analytics.ranked.map((item, index) => (
              <div key={item.id} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[#fafaf8]">
                <div className="w-4 text-[10px] font-bold text-[#c4c4bd]">{String(index + 1).padStart(2, "0")}</div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: item.bg }}>
                  <CategoryIcon id={item.id} color={item.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#5c5c56]">{item.name}</span>
                    <span className="numeric text-xs font-bold text-[#343431]">¥{money(item.amount)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#ecece8]">
                      <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, background: item.chartColor }} />
                    </div>
                    <span className="numeric w-9 text-right text-[9px] text-[#a4a49d]">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#fff7e9] p-3.5 text-[#7c5c28]">
            <Utensils size={17} className="shrink-0" />
            <p className="text-[10px] leading-relaxed">剔除房租后，餐饮是最主要的日常消费，占非固定支出的 26.8%。</p>
          </div>
        </section>
      </div>
    </div>
  );
}
