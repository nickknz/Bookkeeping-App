import { getCategoryById } from "../data/categories";
import CategoryIcon from "./CategoryIcon";

export default function TransactionItem({ transaction, showBorder }) {
  const cat = getCategoryById(transaction.catId);

  return (
    <div className={`flex items-center px-5 py-4 ${showBorder ? "border-b border-gray-100" : ""}`}>
      {/* Category icon */}
      <div
        className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0"
        style={{ background: cat.bg }}
      >
        <CategoryIcon id={transaction.catId} color={cat.color} />
      </div>

      {/* Name + note */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="text-sm font-medium text-gray-800 leading-snug">{cat.name}</div>
        {transaction.note && (
          <div className="text-xs text-gray-400 mt-[3px] overflow-hidden text-ellipsis whitespace-nowrap">
            {transaction.note}
          </div>
        )}
      </div>

      {/* Amount */}
      <div
        className={`text-[15px] font-semibold shrink-0 ml-6 ${transaction.type === "expense" ? "text-gray-700" : "text-emerald-500"}`}
        style={{ fontFeatureSettings: '"tnum"' }}
      >
        {transaction.type === "expense" ? "−" : "+"}¥{transaction.amount.toFixed(2)}
      </div>
    </div>
  );
}
