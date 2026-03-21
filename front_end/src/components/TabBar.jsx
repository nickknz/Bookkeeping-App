const TabHome = (c) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TabChart = (c) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const TabBook = (c) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const TabMe = (c) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const TABS = [
  { id: "home", label: "首页", icon: TabHome },
  { id: "chart", label: "图表", icon: TabChart },
  { id: "ledger", label: "账本", icon: TabBook },
  { id: "me", label: "我的", icon: TabMe },
];

export default function TabBar({ activeTab, onChangeTab }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: "#fff",
        borderTop: "1px solid #F3F4F6",
        display: "flex",
        padding: "6px 0",
        paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))",
        zIndex: 50,
      }}
    >
      {TABS.map((t) => {
        const active = activeTab === t.id;
        const color = active ? "#FF9800" : "#C0C0C0";
        return (
          <button
            key={t.id}
            onClick={() => onChangeTab(t.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              color,
            }}
          >
            {t.icon(color)}
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
