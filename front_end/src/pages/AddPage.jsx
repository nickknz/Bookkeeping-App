import { useState } from "react";
import { CATEGORIES } from "../data/categories";
import CategoryIcon from "../components/CategoryIcon";

export default function AddPage({ onSave, onClose }) {
  const [txType, setTxType] = useState("expense");
  const [selectedCat, setSelectedCat] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const categories = CATEGORIES[txType];

  const handleSave = () => {
    if (!selectedCat || !amount || parseFloat(amount) <= 0) return;
    onSave({
      id: Date.now(),
      type: txType,
      catId: selectedCat,
      amount: parseFloat(amount),
      note: note || null,
      date,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="bg-gray-100 rounded-[20px] p-[3px] inline-flex">
            {["expense", "income"].map((t) => (
              <button
                key={t}
                onClick={() => { setTxType(t); setSelectedCat(null); }}
                className={`px-5 py-[5px] text-[13px] font-medium cursor-pointer border-0 rounded-[17px] transition-all duration-150 ${
                  txType === t
                    ? "bg-white text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "bg-transparent text-gray-400"
                }`}
              >
                {t === "expense" ? "支出" : "收入"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="bg-transparent border-0 cursor-pointer p-1 flex">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Category grid */}
        <div className="px-5 pt-4 pb-3">
          <div className="grid grid-cols-5 gap-1">
            {categories.map((cat) => {
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className="flex flex-col items-center gap-[5px] pt-[10px] pb-[6px] rounded-xl border-0 cursor-pointer transition-all duration-150"
                  style={{ background: isSelected ? cat.bg : "transparent" }}
                >
                  <div
                    className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center transition-all duration-150"
                    style={{ background: isSelected ? cat.color : cat.bg }}
                  >
                    <CategoryIcon id={cat.id} color={isSelected ? "#fff" : cat.color} />
                  </div>
                  <span
                    className={`text-[11px] ${isSelected ? "font-semibold" : "font-normal"}`}
                    style={{ color: isSelected ? cat.color : "#6B7280" }}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form fields */}
        <div className="px-6 pt-2 pb-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 mb-[7px] block">金额</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#FF9800] transition-colors">
              <span className="text-gray-400 mr-2 text-sm">¥</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 border-0 outline-none text-[17px] font-bold text-gray-800 bg-transparent"
                style={{ fontFeatureSettings: '"tnum"' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-[7px] block">备注</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#FF9800] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-[7px] block">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#FF9800] transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-[11px] rounded-xl border border-gray-200 text-gray-600 text-[14px] font-medium cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-[11px] rounded-xl border-0 text-white text-[14px] font-semibold cursor-pointer transition-opacity"
            style={{
              background: selectedCat && amount && parseFloat(amount) > 0
                ? "linear-gradient(135deg, #FFC107, #FF9800)"
                : "#E5E7EB",
              color: selectedCat && amount && parseFloat(amount) > 0 ? "#fff" : "#9CA3AF",
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
