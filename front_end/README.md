# 记账 App（BeeCount 风格）

基于 React + Vite 的记账应用前端原型，UI 参考蜜蜂记账。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器访问 http://localhost:5173
```

## 项目结构

```
src/
├── components/           可复用组件
│   ├── CategoryIcon.jsx    分类 SVG 图标
│   ├── TabBar.jsx          底部导航栏
│   └── TransactionItem.jsx 单条交易记录
├── pages/                页面组件
│   ├── HomePage.jsx        首页（交易流水）
│   ├── ChartPage.jsx       图表分析页
│   ├── LedgerPage.jsx      账本管理页
│   ├── ProfilePage.jsx     个人中心页
│   └── AddPage.jsx         记账页（全屏弹出）
├── data/                 数据层
│   ├── categories.js       分类定义
│   ├── mockTransactions.js Mock 交易数据
│   └── dateUtils.js        日期工具函数
├── App.jsx               主入口
├── App.css               全局样式
└── main.jsx              挂载点
```

## 技术栈

- React 18
- Vite 6
- 纯 CSS（inline styles，无第三方 UI 库）

## 后续计划

- [ ] 接入 Spring Boot 后端 API
- [ ] 替换 mock 数据为真实数据
- [ ] 添加 Tailwind CSS
- [ ] 添加 Recharts 图表库
- [ ] 路由（React Router）
- [ ] 状态管理（Zustand）
