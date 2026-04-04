# CLAUDE.md — 记账 App 后端设计备忘录

> 本文档总结了项目设计过程中所有关于数据库和 API 的关键决策，供开发时参考。

---

## 1. 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| 后端框架 | Spring Boot 3 + Java 17+ | 企业级生态成熟，Spring Security 开箱即用 |
| ORM | MyBatis + MyBatis-Plus | SQL 控制力强，复杂查询灵活；MyBatis-Plus 提供通用 CRUD 减少样板代码 |
| 数据库 | PostgreSQL 16 | ACID 事务保证金额一致性；jsonb 支持灵活扩展字段；原生分区表适合按月分区；聚合查询和窗口函数性能优于 MySQL |
| 认证 | Spring Security + JWT | 无状态认证，Access Token 2h + Refresh Token 7d |
| 构建工具 | Maven | 生态最广，依赖管理稳定 |
| 缓存（二期） | Redis | 统计数据缓存，新增交易时失效 |

### 为什么选 MyBatis

- 每条 SQL 自己写，性能优化完全可控，统计场景的复杂聚合查询写起来更直观
- 配合 MyBatis-Plus，简单 CRUD 也能自动生成，不用每个都手写
- 国内 Java 生态中 MyBatis 使用最广泛，资料多、招人容易
- XML 映射文件虽然多一些代码，但 SQL 和 Java 逻辑分离，大项目维护更清晰
- 学习成本低，不需要理解 JPA 的 Hibernate 缓存机制和 JPQL 语法

### 为什么选 PostgreSQL 而不是 MySQL

- jsonb 类型可对 JSON 内部字段建索引，适合存标签等扩展字段
- 原生声明式分区表，语法简洁，MySQL 分区限制多（分区键必须包含在主键里）
- 数组类型 `TEXT[]` + GIN 索引，MySQL 只能逗号分隔或额外建表
- 窗口函数更完善，适合"环比""排名""累计"等记账统计场景

### 为什么选关系型数据库而不是 NoSQL

- 数据结构高度规整（每笔交易固定几个字段），关系型天然适合
- 核心场景是聚合计算（SUM / GROUP BY / 窗口函数），SQL 有几十年优化积累
- 金额数据需要 ACID 事务保证一致性，NoSQL 大多是最终一致性
- 实体间关系明确（Transaction → Category，Budget → Category），JOIN 一句话搞定

---

## 2. 数据模型设计

### 2.1 设计原则

- **一期极简**：不引入 Ledger 层，Transaction 直接挂 `user_id`，用户进来就是默认主账本
- **二期再加多账本**：到时新增 Ledger 表 + UserLedger 中间表，做一次数据迁移即可
- 选择"先不建 Ledger，以后再加"的方案，而非"提前埋 ledger_id"——早期代码最少、理解成本最低
- **建表方式**：MyBatis 不会自动建表，使用 SQL 脚本手动建表（放在 `src/main/resources/db/` 目录下）

### 2.2 一期核心表（4 张）

### User 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 登录邮箱 |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt 加密 |
| nickname | VARCHAR(50) | NULL | 昵称 |
| avatar_url | VARCHAR(500) | NULL | 头像 |
| currency | VARCHAR(3) | DEFAULT 'CNY' | 默认币种 |
| created_at | TIMESTAMP | NOT NULL | 注册时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

### Category 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| name | VARCHAR(50) | NOT NULL | 分类名称 |
| icon | VARCHAR(50) | NULL | 图标 name |
| type | VARCHAR(10) | NOT NULL | `income` / `expense` |

### Transaction 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → User, NOT NULL | 所属用户 |
| category_id | UUID | FK → Category, NOT NULL | 所属分类 |
| amount | DECIMAL(12,2) | NOT NULL | 金额，精确到分 |
| type | VARCHAR(10) | NOT NULL | `income` / `expense` |
| note | VARCHAR(500) | NULL | 备注 |
| date | DATE | NOT NULL | 交易日期 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**核心索引：**

```sql
CREATE INDEX idx_transaction_user_date ON transaction(user_id, date DESC);
CREATE INDEX idx_transaction_category ON transaction(category_id);
```

### Budget 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → User, NOT NULL | 所属用户 |
| month | DATE | NOT NULL | 每月1号，如 `2026-03-01` |
| limit_amount | DECIMAL(12,2) | NOT NULL | 预算上限 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

---

## 2.3 建表 SQL（`src/main/resources/db/schema.sql`）

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar_url VARCHAR(500),
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense'))
);

CREATE TABLE transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    category_id UUID NOT NULL REFERENCES category(id),
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    note VARCHAR(500),
    date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transaction_user_date ON transaction(user_id, date DESC);
CREATE INDEX idx_transaction_category ON transaction(category_id);

CREATE TABLE budget (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    month DATE NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, month)
);
```

---

## 2.4 实体关系

```
Users ──1:N──▶ Transaction ◀──N:1── Category
  │
  └──1:N──▶ Budget
```

### 2.5 二期多账本扩展方案

需要多账本时新增：

- **Ledger 表**：`id`, `name`, `icon`, `is_default`, `created_by`, `created_at`
- **UserLedger 中间表**：`user_id`, `ledger_id`, `role`（owner / member）
- Transaction、Category、Budget 添加 `ledger_id` 字段

**如何区分主账本**：Ledger 表加 `is_default` 布尔字段，每个用户有且只有一个 `is_default = true` 的账本。如果需要更灵活（同一账本对不同用户有不同默认状态），把 `is_default` 放到 UserLedger 中间表上。

**数据迁移**：为每个用户创建默认 Ledger，将历史 Transaction/Category/Budget 关联过去。

---

## 3. API 接口设计

### 3.1 基础约定

- 基础路径：`/api/v1`
- 认证：Bearer Token（JWT）
- 响应格式：`{ "code": 200, "message": "success", "data": {} }`
- 分页：`?page=0&size=20`，默认每页 20 条（使用 MyBatis-Plus 的 Page 分页）
- 日期格式：ISO 8601（`yyyy-MM-dd`）

### 3.2 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 |
| POST | `/api/v1/auth/login` | 登录，返回 JWT |
| POST | `/api/v1/auth/refresh` | 刷新 Token |
| GET | `/api/v1/auth/me` | 获取当前用户信息 |

### 3.3 交易接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/transactions` | 新增交易 |
| GET | `/api/v1/transactions` | 查询列表（支持筛选、分页） |
| GET | `/api/v1/transactions/{id}` | 查询单笔详情 |
| PUT | `/api/v1/transactions/{id}` | 修改交易 |
| DELETE | `/api/v1/transactions/{id}` | 删除交易 |

查询参数：`?startDate=2026-03-01&endDate=2026-03-31&type=expense&categoryId=xxx&keyword=外卖`

### 3.4 分类接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/categories` | 获取所有分类（系统 + 自定义） |
| POST | `/api/v1/categories` | 新增自定义分类 |
| PUT | `/api/v1/categories/{id}` | 修改分类 |
| DELETE | `/api/v1/categories/{id}` | 删除自定义分类 |

### 3.5 统计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/stats/summary` | 月度收支总览（总收入、总支出、结余） |
| GET | `/api/v1/stats/trend` | 收支趋势（按日/月） |
| GET | `/api/v1/stats/category-ranking` | 分类排行榜 |
| GET | `/api/v1/stats/budget-progress` | 预算执行进度 |

### 3.6 预算接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/budgets` | 获取当月预算列表 |
| POST | `/api/v1/budgets` | 设置预算 |
| PUT | `/api/v1/budgets/{id}` | 修改预算 |
| DELETE | `/api/v1/budgets/{id}` | 删除预算 |

---

## 4. 安全设计

- JWT 无状态认证：Access Token 2h，Refresh Token 7d
- 密码 BCrypt 加密存储
- 所有 API 验证用户身份，服务层每次查询加 `user_id` 过滤防越权
- 输入校验：`@Valid` + DTO
- 金额用 `DECIMAL` 类型，避免浮点精度问题
- CORS 白名单限制前端域名
- Rate Limiting：单 IP 每分钟 60 次
- SQL 注入：MyBatis `#{}` 占位符参数化查询自动防御（注意永远不要用 `${}` 拼接用户输入）

---

## 5. 性能优化路线（按数据量递进）

| 阶段 | 数据量 | 策略 | 何时需要 |
|------|--------|------|----------|
| 一 | < 1000 万行 | 复合索引（`user_id` + `date`） | **一期就做** |
| 二 | 1000万 ~ 1亿 | 读写分离（主从复制） | 用户量显著增长时 |
| 三 | 1亿 ~ 10亿 | PostgreSQL 按月分区表 | 最适合记账场景 |
| 四 | 10亿+ | 按 `user_id` 分库分表（sharding） | 支付宝级别 |
| 五 | 长期运营 | 冷热数据分离（归档历史数据） | 结合阶段三分区 detach |

> 一期只需做阶段一。10 万用户每人 1000 条 = 1 亿条，加了索引的 PostgreSQL 毫无压力。

---

## 6. 后端项目结构（MyBatis 版）

```
bookkeeping-api/
├── pom.xml
├── src/main/java/com/app/bookkeeping/
│   ├── BookkeepingApplication.java        ← 启动类
│   ├── controller/                        ← REST 接口层
│   │   ├── AuthController.java
│   │   ├── TransactionController.java
│   │   ├── CategoryController.java
│   │   ├── BudgetController.java
│   │   └── StatsController.java
│   ├── service/                           ← 业务逻辑层
│   │   ├── AuthService.java
│   │   ├── TransactionService.java
│   │   ├── CategoryService.java
│   │   ├── BudgetService.java
│   │   └── StatsService.java
│   ├── mapper/                            ← MyBatis Mapper 接口
│   │   ├── UserMapper.java
│   │   ├── TransactionMapper.java
│   │   ├── CategoryMapper.java
│   │   └── BudgetMapper.java
│   ├── entity/                            ← 数据库实体（POJO）
│   │   ├── User.java
│   │   ├── Transaction.java
│   │   ├── Category.java
│   │   └── Budget.java
│   ├── dto/                               ← 请求/响应对象
│   │   ├── request/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── TransactionRequest.java
│   │   │   └── BudgetRequest.java
│   │   └── response/
│   │       ├── ApiResponse.java
│   │       ├── AuthResponse.java
│   │       └── StatsResponse.java
│   ├── config/                            ← 配置类
│   │   ├── SecurityConfig.java
│   │   ├── CorsConfig.java
│   │   ├── MybatisPlusConfig.java         ← 分页插件等配置
│   │   └── JwtConfig.java
│   ├── security/                          ← JWT 相关
│   │   ├── JwtTokenProvider.java
│   │   └── JwtAuthenticationFilter.java
│   └── exception/                         ← 异常处理
│       ├── GlobalExceptionHandler.java
│       └── ResourceNotFoundException.java
├── src/main/resources/
│   ├── application.yml                    ← 主配置
│   ├── application-dev.yml                ← 开发环境
│   ├── application-prod.yml               ← 生产环境
│   ├── db/
│   │   └── schema.sql                     ← 建表 SQL 脚本
│   └── mapper/                            ← MyBatis XML 映射文件
│       ├── UserMapper.xml
│       ├── TransactionMapper.xml
│       ├── CategoryMapper.xml
│       └── BudgetMapper.xml
└── src/test/
    └── java/com/app/bookkeeping/
```

## 7. 核心 Maven 依赖

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- MyBatis-Plus（内含 MyBatis + 通用 CRUD + 分页） -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
        <version>3.5.9</version>
    </dependency>

    <!-- PostgreSQL 驱动 -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok（减少样板代码） -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## 8. 开发路线

| 周次 | 任务 | 交付物 |
|------|------|--------|
| 第 1 周 | 项目搭建 + 建表 + 认证 | Spring Boot + Maven 项目，执行 schema.sql 建表，JWT 登录注册 |
| 第 2 周 | 记账核心流程 | Transaction CRUD + Category 管理（Mapper + XML + Service + Controller） |
| 第 3 周 | 统计图表 + 首页 | 月度汇总 + 趋势 + 分类排行 API（复杂 SQL 写在 XML 里） |
| 第 4-6 周 | 预算 + 导出 + 多账本 | Budget 功能 + Excel 导出 + Ledger 扩展 |