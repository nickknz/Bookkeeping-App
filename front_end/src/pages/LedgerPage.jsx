export default function LedgerPage() {
  const books = [
    { id: 1, name: "日常生活", icon: "📒", count: 16, color: "#FA6400" },
    { id: 2, name: "工作", icon: "💼", count: 0, color: "#3491FA" },
    { id: 3, name: "旅行", icon: "✈️", count: 0, color: "#13C2C2" },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "#fff",
          padding: "14px 20px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 700, color: "#1F2937" }}>账本</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ cursor: "pointer" }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>

      {/* Book list */}
      <div style={{ padding: "4px 14px" }}>
        {books.map((book) => (
          <div
            key={book.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: book.color + "14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {book.icon}
            </div>
            <div style={{ flex: 1, marginLeft: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937" }}>{book.name}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{book.count} 笔记录</div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}
