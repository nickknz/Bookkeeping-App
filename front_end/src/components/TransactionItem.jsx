import { getCategoryByIcon } from "../data/categories";
import { money } from "../data/format";
import CategoryIcon from "./CategoryIcon";

export default function TransactionItem({ transaction, showBorder = false }) {
  const category = transaction.category || getCategoryByIcon(transaction.categoryIcon);
  const income = transaction.type === "income";

  return (
    <div
      className={`group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-[#fafaf8] sm:px-5 ${
        showBorder ? "border-b border-[#ecece8]" : ""
      }`}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-transform duration-200 group-hover:scale-[1.04]"
        style={{ background: category.bg }}
      >
        <CategoryIcon id={category.icon} color={category.color} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-[#343431] sm:text-sm">{transaction.note || category.name}</span>
          {income && (
            <span className="rounded-full bg-[#e8f8ed] px-2 py-0.5 text-[9px] font-bold text-[#15936a]">收入</span>
          )}
        </div>
        <div className="mt-1 truncate text-[11px] text-[#9a9a93]">{category.name} · {transaction.date.replaceAll("-", ".")}</div>
      </div>

      <div className="text-right">
        <div className={`numeric text-[14px] font-bold sm:text-[15px] ${income ? "text-[#15936a]" : "text-[#343431]"}`}>
          {income ? "+" : "−"}¥{money(transaction.amount)}
        </div>
        <div className="mt-1 text-[10px] text-[#aeaEA7]">{income ? "已入账" : "已支付"}</div>
      </div>
    </div>
  );
}
