# 记账 App 后端详细设计

> 本文档是后端实现的详细设计和唯一权威来源，覆盖数据库、API、安全、代码结构与依赖。
> 系统级架构、产品范围和部署方案参见 [`TECH_DESIGN.md`](./TECH_DESIGN.md)。

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
- 实体间关系明确（Transaction → User、Category，Budget → User），JOIN 一句话搞定

---

## 2. 数据模型设计

### 2.1 设计原则

- **一期保持单账本模型**：不创建 Ledger 或 UserLedger，Transaction 直接关联 `user_id`
- **建表方式**：MyBatis 不负责建表；Flyway 在应用启动时按版本执行 `src/main/resources/db/` 下的迁移脚本

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
| id | INTEGER | PK, IDENTITY | 主键，与当前 V1 保持一致 |
| code | VARCHAR(50) | UNIQUE, NOT NULL | 稳定分类编码，供前后端识别 |
| name | VARCHAR(50) | NOT NULL | 分类名称 |
| icon | VARCHAR(50) | NULL | 图标 name |
| type | VARCHAR(10) | NOT NULL | `income` / `expense` |
| is_default | BOOLEAN | DEFAULT false | 是否为全局系统预设分类 |
| sort_order | INTEGER | DEFAULT 0 | 展示顺序 |

### Transaction 表（物理表名：`transactions`）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → User, NOT NULL | 所属用户 |
| category_id | INTEGER | FK → Category, NOT NULL | 所属分类 |
| amount | DECIMAL(12,2) | NOT NULL | 金额，精确到分 |
| type | VARCHAR(10) | NOT NULL | `income` / `expense` |
| note | VARCHAR(500) | NULL | 备注 |
| tags | JSONB | NULL | 标签数组 |
| date | DATE | NOT NULL | 交易日期 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**核心索引：**

```sql
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
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

每个用户每月最多一条预算，数据库使用 `UNIQUE (user_id, month)` 保证唯一性。

---

## 2.3 数据库迁移策略

- 数据库结构以 [`bookkeeping-api/src/main/resources/db/`](./bookkeeping-api/src/main/resources/db/) 下的迁移脚本为准，文档不复制完整建表 SQL。
- `V1__init_schema.sql` 创建当前已落地的表结构、约束和索引，`V2__seed_default_categories.sql` 只初始化全局系统预设分类。
- 已经执行或共享的迁移不得直接修改；新字段、约束和索引通过新的版本迁移逐步加入。
- 本节字段表描述目标一期模型；实现状态与目标模型的差异必须在迁移任务中明确记录。

---

## 2.4 实体关系

```
User      1 ───── 0..N Transaction
Category  1 ───── 0..N Transaction

User      1 ───── 0..N Budget
```

| 关系 | 说明 |
|------|------|
| User ↔ Transaction | 每笔交易必须属于一个用户；一个用户可以拥有多笔交易 |
| Category ↔ Transaction | 每笔交易必须属于一个分类；一个分类可以关联多笔交易 |
| User ↔ Budget | 每条预算必须属于一个用户；一个用户可以设置多条预算 |

> Category 是全局共享的系统预设一级分类，不属于任何用户，也不支持父子层级。
> Budget 只表示用户的月度总预算，不按分类拆分。

---

## 3. API 接口设计

### 3.1 基础约定

- 基础路径：`/api`
- 认证目标：Bearer Token（JWT）。当前一期联调暂用固定 Demo 用户，仅限开发环境，不能用于生产部署。
- 响应格式：`{ "code": 200, "message": "success", "data": {} }`
- 分页：`?page=0&size=20`，默认每页 20 条（使用 MyBatis-Plus 的 Page 分页）
- 日期格式：ISO 8601（`yyyy-MM-dd`）

### 3.2 认证接口

> 尚未实现，属于 Transaction CRUD 之后的下一阶段。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 登录，返回 JWT |
| POST | `/api/auth/refresh` | 刷新 Token |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 3.3 交易接口

> 以下五个接口已实现；所有读写都会按当前用户 ID 隔离。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/transactions` | 新增交易 |
| GET | `/api/transactions` | 查询列表（支持筛选、分页） |
| GET | `/api/transactions/{id}` | 查询单笔详情 |
| PUT | `/api/transactions/{id}` | 修改交易 |
| DELETE | `/api/transactions/{id}` | 删除交易 |

查询参数：`?startDate=2026-03-01&endDate=2026-03-31&type=expense&categoryId=xxx&keyword=外卖`

### 3.4 分类接口

> Category 是全局只读数据，一期不提供用户新增、修改或删除分类的接口。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取全局系统分类，可按收支类型过滤 |

### 3.5 统计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats/summary` | 月度收支总览（总收入、总支出、结余） |
| GET | `/api/stats/trend` | 收支趋势（按日/月） |
| GET | `/api/stats/category-ranking` | 分类排行榜 |
| GET | `/api/stats/budget-progress` | 预算执行进度 |

### 3.6 预算接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/budgets` | 获取当月月度预算 |
| POST | `/api/budgets` | 设置月度预算 |
| PUT | `/api/budgets/{id}` | 修改月度预算 |
| DELETE | `/api/budgets/{id}` | 删除月度预算 |

---

## 4. 安全设计

- JWT 无状态认证：Access Token 2h，Refresh Token 7d
- 密码 BCrypt 加密存储
- 所有 API 验证用户身份；Transaction、Budget 等用户私有资源按 `user_id` 隔离，全局 Category 读取不按用户过滤
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
├── src/main/java/com/knzheng/bookkeeping/
│   ├── BookkeepingApiApplication.java
│   ├── common/
│   │   ├── config/                        ← CORS、MyBatis 配置
│   │   ├── exception/                     ← 全局异常处理
│   │   ├── response/                      ← 统一响应与分页对象
│   │   └── security/                      ← JWT、Spring Security
│   ├── auth/
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   └── dto/
│   ├── transaction/
│   │   ├── TransactionController.java
│   │   ├── TransactionService.java
│   │   ├── TransactionMapper.java
│   │   ├── TransactionEntity.java
│   │   └── dto/
│   ├── category/                          ← 分类业务模块
│   ├── budget/                            ← 预算业务模块
│   └── stats/                             ← 统计查询模块
├── src/main/resources/
│   ├── application.properties
│   ├── application-local.properties
│   ├── application-docker.properties
│   ├── db/                                ← 版本化数据库迁移
│   └── mapper/                            ← MyBatis XML 映射文件
└── src/test/
    └── java/com/knzheng/bookkeeping/
```

- Controller 只处理 HTTP 协议和参数校验，不包含业务逻辑。
- Service 负责权限、事务和业务规则；当前不为每个 Service 机械创建接口与 `Impl`。
- Mapper 只负责数据库访问；Entity 不直接作为 API 响应返回。
- 请求与响应分别使用 DTO，避免数据库结构泄露到接口层。

## 7. 核心 Maven 依赖

> MyBatis-Plus、Validation、Flyway 和 PostgreSQL 已落地；JWT 仍是认证阶段的目标依赖。

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

    <!-- 数据库版本迁移 -->
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
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
| 第 1 周 | 项目搭建 + 建表 + 认证 | Spring Boot + Maven 项目，执行版本化迁移，JWT 登录注册 |
| 第 2 周 | 记账核心流程 | Transaction CRUD + 全局分类读取与交易分类校验 |
| 第 3 周 | 统计图表 + 首页 | 月度汇总 + 趋势 + 分类排行 API（复杂 SQL 写在 XML 里） |
| 第 4-6 周 | 预算 + 导出 + 稳定性 | Budget 功能 + Excel 导出 + 集成测试与性能检查 |
