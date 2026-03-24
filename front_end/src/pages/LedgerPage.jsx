export default function LedgerPage() {
  const books = [
    { id: 1, name: "日常生活", icon: "📒", count: 16, color: "#FA6400" },
    { id: 2, name: "工作", icon: "💼", count: 0, color: "#3491FA" },
    { id: 3, name: "旅行", icon: "✈️", count: 0, color: "#13C2C2" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold text-gray-800">账本</span>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新建账本
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Color bar */}
            <div className="h-[5px]" style={{ background: book.color }} />
            <div className="p-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                style={{ background: book.color + "14" }}
              >
                {book.icon}
              </div>
              <div className="text-[15px] font-semibold text-gray-800 mb-1">{book.name}</div>
              <div className="text-xs text-gray-400">{book.count} 笔记录</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
