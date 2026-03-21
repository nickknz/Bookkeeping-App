import { getCategoryById } from "../data/categories";
import CategoryIcon from "./CategoryIcon";

export default function TransactionItem({ transaction, showBorder }) {
  const cat = getCategoryById(transaction.catId);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "13px 14px",
        borderBottom: showBorder ? "1px solid #F3F4F6" : "none",
      }}
    >
      {/* Category icon */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: cat.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CategoryIcon id={transaction.catId} color={cat.color} />
      </div>

      {/* Name + note */}
      <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#1F2937" }}>{cat.name}</div>
        {transaction.note && (
          <div
            style={{
              fontSize: 12,
              color: "#B0B0B0",
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {transaction.note}
          </div>
        )}
      </div>

      {/* Amount */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: transaction.type === "expense" ? "#1F2937" : "#10B981",
          flexShrink: 0,
          fontFeatureSettings: '"tnum"',
        }}
      >
        {transaction.type === "expense" ? "-" : "+"}
        {transaction.amount.toFixed(2)}
      </div>
    </div>
  );
}
