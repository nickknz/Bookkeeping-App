import { useState, useCallback } from "react";
import { CATEGORIES } from "../data/categories";
import CategoryIcon from "../components/CategoryIcon";

export default function AddPage({ onSave, onClose }) {
  const [txType, setTxType] = useState("expense");
  const [selectedCat, setSelectedCat] = useState(null);
  const [amount, setAmount] = useState("0");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const categories = CATEGORIES[txType];

  const handleKey = useCallback(
    (key) => {
      if (key === "del") {
        setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
      } else if (key === ".") {
        setAmount((prev) => (prev.includes(".") ? prev : prev + "."));
      } else if (key === "ok") {
        if (!selectedCat || amount === "0" || amount === "0.") return;
        onSave({
          id: Date.now(),
          type: txType,
          catId: selectedCat,
          amount: parseFloat(amount),
          note: note || null,
          date: new Date().toISOString().slice(0, 10),
        });
        onClose();
      } else {
        setAmount((prev) => {
          if (prev === "0" && key !== ".") return key;
          if (prev.includes(".") && prev.split(".")[1].length >= 2) return prev;
          if (prev.length >= 10) return prev;
          return prev + key;
        });
      }
    },
    [selectedCat, amount, note, txType, onSave, onClose]
  );

  const KEYS = [
    "7", "8", "9", "del",
    "4", "5", "6", "date",
    "1", "2", "3", "ok",
    ".", "0", "00", "ok2",
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#F5F6FA",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#F3F4F6", borderRadius: 20, padding: 3, display: "inline-flex" }}>
            {["expense", "income"].map((t) => (
              <button
                key={t}
                onClick={() => { setTxType(t); setSelectedCat(null); }}
                style={{
                  padding: "5px 24px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: txType === t ? "#fff" : "transparent",
                  color: txType === t ? "#1F2937" : "#9CA3AF",
                  border: "none",
                  borderRadius: 17,
                  boxShadow: txType === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {t === "expense" ? "支出" : "收入"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: 28 }} />
      </div>

      {/* Category grid — 5 columns */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px 6px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
          {categories.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "10px 0 6px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: isSelected ? cat.bg : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    background: isSelected ? cat.color : cat.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <CategoryIcon id={cat.id} color={isSelected ? "#fff" : cat.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: isSelected ? 600 : 400, color: isSelected ? cat.color : "#6B7280" }}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount bar + keyboard */}
      <div style={{ background: "#fff", borderTop: "1px solid #F3F4F6" }}>
        {/* Note + amount */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px" }}>
          <button
            onClick={() => setShowNote(!showNote)}
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              color: note ? "#374151" : "#9CA3AF",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {note || "备注"}
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 13, color: "#9CA3AF", marginRight: 2 }}>¥</span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1F2937",
              fontFamily: '-apple-system, "SF Mono", monospace',
              letterSpacing: -0.5,
            }}
          >
            {amount}
          </span>
        </div>

        {/* Note input */}
        {showNote && (
          <div style={{ padding: "0 14px 8px" }}>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="输入备注..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && setShowNote(false)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                border: "1.5px solid #E5E7EB",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FF9800")}
              onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
            />
          </div>
        )}

        {/* Keyboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", background: "#EAECF0", gap: 1 }}>
          {KEYS.map((key, i) => {
            const isOk = key === "ok" || key === "ok2";
            const isDel = key === "del";
            const isDate = key === "date";

            if (isOk) {
              return (
                <button
                  key={i}
                  onClick={() => handleKey("ok")}
                  style={{
                    height: 48,
                    border: "none",
                    background: key === "ok" ? "#FFB300" : "#FF9800",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {key === "ok" ? "完成" : "记一笔"}
                </button>
              );
            }

            return (
              <button
                key={i}
                onClick={() => !isDate && handleKey(key)}
                style={{
                  height: 48,
                  border: "none",
                  background: "#fff",
                  color: isDel ? "#6B7280" : "#1F2937",
                  fontSize: isDel ? 14 : 17,
                  fontWeight: 500,
                  cursor: isDate ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isDel ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                ) : isDate ? (
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>今天</span>
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
