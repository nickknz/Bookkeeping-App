# 小豆记账前端

基于 React、Vite 和 Tailwind CSS 的记账应用前端，已接入 Spring Boot 分类、交易与预算接口。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器访问 http://localhost:5173
```

请先确保后端运行在 `http://localhost:8080`；Vite 会把 `/api` 请求代理到后端。

## 项目结构

```
src/
├── components/           可复用组件
│   ├── CategoryIcon.jsx    分类 SVG 图标
│   ├── DataState.jsx       加载与错误状态
│   ├── MainLayout.jsx      数据加载和页面布局
│   └── TransactionItem.jsx 单条交易记录
├── pages/                页面组件
│   ├── HomePage.jsx        首页（交易流水）
│   ├── BudgetPage.jsx      月度预算管理页
│   ├── ChartPage.jsx       图表分析页
│   ├── LedgerPage.jsx      账本管理页
│   ├── ProfilePage.jsx     个人中心页
│   └── AddPage.jsx         记账页（全屏弹出）
├── data/                 数据层
│   ├── categories.js       分类视觉配置
│   ├── budget.js           预算进度计算
│   └── dateUtils.js        日期工具函数
├── api/
│   └── client.js           分类、交易与预算 API 客户端
├── App.jsx               主入口
├── App.css               全局样式
└── main.jsx              挂载点
```

## 技术栈

- React 18
- Vite 6
- Tailwind CSS 4
- React Router 7
- Recharts 3

## 后续计划

- [x] 接入分类与交易 API
- [x] 首页和图表使用真实交易数据
- [x] 添加 Tailwind CSS、Recharts 和路由
- [x] 实现月度预算 CRUD 与进度展示
- [ ] 接入用户认证
- [ ] 完善账本管理功能
