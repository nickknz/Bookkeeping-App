# 记账 App 技术设计文档

> **版本**: v1.0  
> **日期**: 2026-03-17  
> **状态**: 初稿

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈选型](#2-技术栈选型)
3. [系统架构](#3-系统架构)
4. [数据模型设计](#4-数据模型设计)
5. [API 接口设计](#5-api-接口设计)
6. [前端页面结构](#6-前端页面结构)
7. [安全设计](#7-安全设计)
8. [性能优化策略](#8-性能优化策略)
9. [部署方案](#9-部署方案)
10. [开发路线图](#10-开发路线图)

---

## 1. 项目概述

### 1.1 产品定位

一款面向个人用户、家庭及小微企业的轻量级记账 Web 应用。核心理念是"3秒快速记账"，追求极简的操作流程和清晰的数据可视化。参考产品为鲨鱼记账。

### 1.2 核心功能

- **快速记账**：选分类 → 输金额 → 备注（可选）→ 完成
- **收支明细**：按日/月展示交易记录，支持搜索和筛选
- **图表统计**：折线图、饼图、条形图多维度分析消费趋势
- **分类管理**：系统预设 + 用户自定义，支持二级分类
- **预算管理**：月度总预算和分类预算，超支提醒
- **数据导出**：支持导出 Excel 文件

### 1.3 目标用户

- **个人用户**：学生、年轻白领，希望掌控日常开支
- **家庭用户**：情侣/家庭共同记账（多账本模式，二期）
- **小微企业**：freelancer 收支管理（三期）

---

## 2. 技术栈选型

### 2.1 整体技术栈

| 层级 | 技术选型 | 选型理由 |
|------|----------|----------|
| 前端 | React 18 + TypeScript | 组件化开发，生态成熟，类型安全 |
| 样式 | Tailwind CSS | 原子化 CSS，开发效率高 |
| 图表 | Recharts / ECharts | 支持折线图、饼图、条形图 |
| 状态管理 | Zustand | 轻量级，简单直观 |
| 路由 | React Router v6 | 声明式路由，懒加载 |
| 后端 | Spring Boot 3 + Java 17+ | 企业级框架，生态成熟，强类型 |
| ORM | Spring Data JPA + Hibernate | 自动建表、CRUD、复杂查询 |
| 数据库 | PostgreSQL 16 | ACID 事务、jsonb、原生分区表 |
| 缓存 | Redis（可选） | 统计数据缓存，二期引入 |
| 认证 | Spring Security + JWT | 无状态认证，支持 OAuth2 |
| 构建工具 | Gradle | 比 Maven 更简洁灵活 |

### 2.2 选型理由

#### 前端：React

- 组件化开发模式，适合记账 UI 的列表/卡片/图表场景
- 生态最大，图表库、UI 组件库选择丰富
- 配合 TypeScript 提供类型安全，减少运行时错误

#### 后端：Spring Boot

- Spring Security 开箱即用，认证、权限、CSRF 保护完善
- Spring Data JPA 自动生成 CRUD，复杂查询用 `@Query` 注解
- 事务管理成熟，`@Transactional` 一个注解搞定
- Java 强类型在大项目中维护性更好

#### 数据库：PostgreSQL

- ACID 事务保证金额数据一致性
- `jsonb` 类型支持灵活扩展字段（标签、自定义属性）
- 原生分区表支持，未来按月分区 Transaction
- 聚合查询和窗口函数性能优秀，契合记账统计场景

---

## 3. 系统架构

### 3.1 整体架构

采用前后端分离架构，React SPA 通过 RESTful API 与 Spring Boot 后端通信。

```
┌─────────────────────────────────────────────┐
│              前端 (React SPA)                │
│     Tailwind CSS · Recharts · Zustand       │
└──────────────────┬──────────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼──────────────────────────┐
│           后端 (Spring Boot 3)               │
│  Controller → Service → Repository          │
└───────┬─────────────────────┬───────────────┘
        │                     │
┌───────▼───────┐     ┌──────▼────────┐
│  PostgreSQL   │     │  Redis (可选)  │
│  主数据库      │     │  统计缓存      │
└───────────────┘     └───────────────┘
```

### 3.2 分层职责

| 层级 | 职责 | 技术 |
|------|------|------|
| 表现层 | 用户界面、交互逻辑、图表渲染 | React + Tailwind + Recharts |
| API 层 | RESTful 接口、请求验证、响应封装 | Spring MVC + `@RestController` |
| 业务层 | 记账逻辑、统计计算、预算检查 | Spring Service + `@Transactional` |
| 持久层 | 数据库访问、查询优化 | Spring Data JPA + Repository |
| 数据层 | 数据存储、索引、事务 | PostgreSQL |

### 3.3 后端项目结构

```
bookkeeping-api/
├── src/main/java/com/app/bookkeeping/
│   ├── controller/        ← REST 接口层
│   ├── service/           ← 业务逻辑层
│   ├── repository/        ← 数据访问层
│   ├── entity/            ← JPA 实体类
│   ├── dto/               ← 数据传输对象
│   ├── config/            ← 配置类（安全、CORS等）
│   └── exception/         ← 全局异常处理
├── src/main/resources/
│   └── application.yml    ← 配置文件
└── build.gradle
```

---

## 4. 数据模型设计

### 4.1 设计原则

- 一期用户直接拥有默认账本，无需显式创建
- Transaction 直接挂在 `user_id` 下，不引入 Ledger 层
- 分类支持系统预设 + 用户自定义，用 `parent_id` 实现二级分类
- 预算可以是总预算（`category_id` 为空）或分类预算
- 二期扩展多账本时加 Ledger 表，做一次数据迁移即可

### 4.2 实体关系

```
User ──1:N──▶ Transaction ◀──N:1── Category
  │                                    │
  ├──1:N──▶ Category                   │ (self-ref)
  │                                    ▼
  └──1:N──▶ Budget ──N:1──▶ Category (可选)
```

| 关系 | 说明 |
|------|------|
| User → Transaction | 一对多，一个用户拥有多笔交易 |
| User → Category | 一对多，用户可自定义分类 |
| Category → Transaction | 一对多，每笔交易属于一个分类 |
| Category → Category | 自引用，`parent_id` 实现二级分类 |
| User → Budget | 一对多，用户设定多个预算 |
| Category → Budget | 一对多（可选），预算可关联到具体分类 |

### 4.3 User 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 登录邮箱 |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt 加密存储 |
| nickname | VARCHAR(50) | NULL | 显示昵称 |
| avatar_url | VARCHAR(500) | NULL | 头像地址 |
| currency | VARCHAR(3) | DEFAULT 'CNY' | 默认币种 |
| created_at | TIMESTAMP | NOT NULL | 注册时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

### 4.4 Category 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → User, NULL | 系统预设分类为 NULL |
| parent_id | UUID | FK → Category, NULL | 父分类，NULL = 一级 |
| name | VARCHAR(50) | NOT NULL | 分类名称 |
| icon | VARCHAR(50) | NULL | 图标标识 |
| type | VARCHAR(10) | NOT NULL | `income` / `expense` |
| is_default | BOOLEAN | DEFAULT false | 是否系统预设 |
| sort_order | INTEGER | DEFAULT 0 | 排序顺序 |

### 4.5 Transaction 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → User, NOT NULL | 所属用户 |
| category_id | UUID | FK → Category, NOT NULL | 所属分类 |
| amount | DECIMAL(12,2) | NOT NULL | 金额，精确到分 |
| type | VARCHAR(10) | NOT NULL | `income` / `expense` |
| note | VARCHAR(500) | NULL | 备注 |
| tags | JSONB | NULL | 标签数组 |
| date | DATE | NOT NULL | 交易日期 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**核心索引：**

```sql
CREATE INDEX idx_transaction_user_date ON transaction(user_id, date DESC);
```

### 4.6 Budget 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → User, NOT NULL | 所属用户 |
| category_id | UUID | FK → Category, NULL | NULL = 总预算 |
| month | VARCHAR(7) | NOT NULL | 格式：`2026-03` |
| limit_amount | DECIMAL(12,2) | NOT NULL | 预算上限 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

### 4.7 多账本扩展方案（二期）

二期需要多账本时，新增以下表：

- **Ledger 表**：`id`, `name`, `icon`, `is_default`, `created_by`, `created_at`
- **UserLedger 中间表**：`user_id`, `ledger_id`, `role`（owner / member）
- Transaction、Category、Budget 添加 `ledger_id` 字段
- **数据迁移**：为每个用户创建默认 Ledger，将历史数据关联过去

---

## 5. API 接口设计

### 5.1 基础约定

- **基础路径**：`/api/v1`
- **认证方式**：Bearer Token (JWT)
- **响应格式**：统一包装 `{ code, message, data }`
- **分页**：`?page=0&size=20`，默认每页 20 条
- **日期格式**：ISO 8601（`yyyy-MM-dd`）

### 5.2 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 |
| POST | `/api/v1/auth/login` | 登录，返回 JWT |
| POST | `/api/v1/auth/refresh` | 刷新 Token |
| GET | `/api/v1/auth/me` | 获取当前用户信息 |

### 5.3 交易接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/transactions` | 新增一笔交易 |
| GET | `/api/v1/transactions` | 查询交易列表（支持筛选、分页） |
| GET | `/api/v1/transactions/{id}` | 查询单笔交易详情 |
| PUT | `/api/v1/transactions/{id}` | 修改交易 |
| DELETE | `/api/v1/transactions/{id}` | 删除交易 |

**查询参数示例：**

```
GET /api/v1/transactions?startDate=2026-03-01&endDate=2026-03-31&type=expense&categoryId=xxx&keyword=外卖
```

### 5.4 分类接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/categories` | 获取所有分类（系统 + 自定义） |
| POST | `/api/v1/categories` | 新增自定义分类 |
| PUT | `/api/v1/categories/{id}` | 修改分类 |
| DELETE | `/api/v1/categories/{id}` | 删除自定义分类 |

### 5.5 统计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/stats/summary` | 月度收支总览（总收入、总支出、结余） |
| GET | `/api/v1/stats/trend` | 收支趋势（按日/月） |
| GET | `/api/v1/stats/category-ranking` | 分类排行榜 |
| GET | `/api/v1/stats/budget-progress` | 预算执行进度 |

### 5.6 预算接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/budgets` | 获取当月预算列表 |
| POST | `/api/v1/budgets` | 设置预算 |
| PUT | `/api/v1/budgets/{id}` | 修改预算 |
| DELETE | `/api/v1/budgets/{id}` | 删除预算 |

---

## 6. 前端页面结构

### 6.1 页面列表

| 页面 | 路由 | 核心功能 |
|------|------|----------|
| 首页/明细 | `/` | 本月收支总览 + 每日交易列表 |
| 记账页 | `/add` | 选分类 → 输金额 → 备注 → 完成 |
| 图表页 | `/charts` | 折线图 + 分类排行 + 饼图 |
| 预算页 | `/budget` | 预算设置 + 进度条 |
| 设置页 | `/settings` | 分类管理 + 数据导出 + 账户 |
| 登录页 | `/login` | 邮箱密码登录 |
| 注册页 | `/register` | 用户注册 |

### 6.2 核心交互流程

#### 记账流程（核心）

1. 用户点击底部导航栏中间的 "+" 按钮
2. 切换「支出」/「收入」页签
3. 点击分类图标（选中后高亮）
4. 数字键盘输入金额（支持 +/- 计算）
5. 可选：点击备注栏写备注（智能推荐历史备注）
6. 可选：点击日期修改交易日期（默认今天）
7. 点击「完成」保存，返回明细页

#### 查看统计流程

1. 用户切换到图表页签
2. 默认显示本月支出折线图 + 分类排行
3. 可切换周/月/年维度
4. 可切换支出/收入视图

### 6.3 组件拆分

- **Layout**：底部导航栏（明细、图表、+记账、预算、我的）
- **TransactionList**：按日分组的交易列表
- **TransactionItem**：单条交易卡片（图标 + 分类 + 金额）
- **CategoryGrid**：分类选择宫格
- **NumberPad**：自定义数字键盘（含 +/- 和日历）
- **MonthPicker**：月份切换器
- **ChartPanel**：图表容器（包装 Recharts）
- **BudgetCard**：预算进度卡片

---

## 7. 安全设计

### 7.1 认证机制

- 采用 JWT（JSON Web Token）无状态认证
- Access Token 有效期 2 小时，Refresh Token 有效期 7 天
- 密码使用 BCrypt 加密存储，永远不存明文
- 二期可支持 OAuth2 第三方登录（Google、GitHub）

### 7.2 数据安全

- 所有 API 接口必须验证用户身份，确保只能访问自己的数据
- 服务层每次查询都加 `user_id` 过滤，防止越权访问
- 输入数据全部做参数校验（`@Valid` + DTO）
- 金额字段使用 `DECIMAL` 类型，避免浮点数精度问题

### 7.3 接口安全

- CORS 白名单限制允许的前端域名
- Rate Limiting：单 IP 每分钟最多 60 次请求
- SQL 注入防护：JPA 参数化查询自动防御
- XSS 防护：前端输出转义 + CSP Header

---

## 8. 性能优化策略

### 8.1 数据库层

| 阶段 | 数据量 | 策略 | 复杂度 |
|------|--------|------|--------|
| 一 | < 1000 万行 | 复合索引（`user_id` + `date`） | 低 |
| 二 | 1000万 ~ 1亿 | 读写分离（主从复制） | 中 |
| 三 | 1亿 ~ 10亿 | PostgreSQL 按月分区表 | 中 |
| 四 | 10亿+ | 按 `user_id` 分库分表 | 高 |
| 五 | 长期运营 | 冷热数据分离（归档历史数据） | 中 |

> 一期只需关注阶段一，对大多数产品而言索引优化已经足够。

### 8.2 应用层

- **统计数据缓存**：月度汇总、分类排行等计算结果缓存至 Redis，新增交易时失效
- **分页查询**：所有列表接口强制分页，默认 20 条/页
- **懒加载**：图表数据在用户切换到图表页时才加载

### 8.3 前端

- **代码分割**：`React.lazy()` 按页面懒加载
- **虚拟列表**：交易列表使用 `react-window` 虚拟滚动
- **防抖搜索**：关键词搜索 300ms 防抖
- **图表优化**：大数据量时后端聚合，前端只渲染结果

---

## 9. 部署方案

### 9.1 推荐方案

| 组件 | 服务 | 说明 |
|------|------|------|
| 前端 | Vercel / Netlify | 免费层足够，自动 CI/CD |
| 后端 | Railway / Fly.io / AWS EC2 | Spring Boot JAR 部署，Docker 化 |
| 数据库 | Supabase / Neon / AWS RDS | 托管 PostgreSQL，免费层可起步 |
| 缓存 | Upstash Redis | 按请求计费，低成本 |

### 9.2 CI/CD 流程

1. 代码推送到 GitHub `main` 分支
2. GitHub Actions 触发：运行单元测试 + 集成测试
3. 测试通过后自动构建 Docker 镜像
4. 部署到生产环境（后端服务自动重启）
5. 前端 Vercel 自动部署（推送即触发）

### 9.3 环境划分

- **development**：本地开发，H2 内存数据库
- **staging**：测试环境，连接测试 PostgreSQL
- **production**：生产环境，托管 PostgreSQL + Redis

---

## 10. 开发路线图

### 一期：MVP（第 1-3 周）

| 周次 | 任务 | 交付物 |
|------|------|--------|
| 第 1 周 | 项目搭建 + 数据模型 + 认证 | Spring Boot 项目 + JPA Entity + JWT 登录注册 |
| 第 2 周 | 记账核心流程 | 新增/查看/修改/删除交易 + 分类管理 |
| 第 3 周 | 统计图表 + 首页 | 月度汇总 + 折线图 + 分类排行 |

### 二期：增强（第 4-6 周）

- 预算管理功能（总预算 + 分类预算 + 超支提醒）
- 数据导出（Excel 格式）
- 多账本支持（Ledger 表 + 账本切换）
- 备注智能推荐（基于历史备注）

### 三期：扩展（第 7-10 周）

- 多人共享账本（家庭/情侣模式）
- 定时记账（周期性交易自动记录）
- 账单提醒（每日提醒记账）
- PWA 支持（离线访问 + 添加到主屏幕）
- 多币种支持

---

*文档结束*
