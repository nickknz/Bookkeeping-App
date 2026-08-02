# Bookkeeping-App

个人记账应用。

- **后端**:Spring Boot 3.5 + Java 17（`bookkeeping-api/`）
- **前端**:React 18 + Vite + Tailwind（`front_end/`）
- **数据库**: PostgreSQL 16（通过 Docker 运行）

---

## 项目文档

- [`TECH_DESIGN.md`](./TECH_DESIGN.md)：系统级架构、产品范围、前后端边界与路线图。
- [`Backend_Design.md`](./Backend_Design.md)：数据库、API、安全、后端代码结构与依赖的详细设计。

数据库字段和 API 细节以后端设计文档为准，实际数据库结构以版本化迁移脚本为准。

---

## 环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Docker Desktop + Docker Compose | Compose v2 | 运行 PostgreSQL，或一键运行 PostgreSQL + 后端 |
| JDK | 17 | 运行后端 |
| Node.js | 18+ | 运行前端 |

首次使用需要安装 JDK 17（其余若已装可跳过）:

```bash
brew install openjdk@17
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
java -version   # 显示 17 即成功
```

---

## 启动步骤

日常开发建议按 **数据库 → 后端 → 前端** 的顺序启动：数据库放在 Docker 中，后端由 IntelliJ 启动，便于断点调试与热重载。

### 1. 启动数据库（Docker）

在项目根目录执行:

```bash
docker compose up -d db
```

- 首次启动会自动拉取镜像，并执行 `bookkeeping-api/src/main/resources/db/V1__init_schema.sql` 建表。
- 数据库监听 `localhost:5432`，库名 / 用户 / 密码均为 `bookkeeping`。

确认已就绪（状态为 `healthy`）:

```bash
docker compose ps
```

### 2. 启动后端

#### 推荐：IntelliJ / 本机运行

```bash
cd bookkeeping-api
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

- 后端运行在 `http://localhost:8080`。
- 已启用 `devtools`,修改代码会自动热重载。
- 在 IntelliJ 的 Run Configuration 中添加环境变量 `SPRING_PROFILES_ACTIVE=local`；本机数据库地址、用户名和密码可按需通过 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD` 覆盖。

#### 一键容器运行：数据库 + 后端

在项目根目录执行：

```bash
docker compose up --build -d
```

- 后端容器会等待 PostgreSQL 健康检查通过后再启动，访问地址仍为 `http://localhost:8080`。
- 查看后端日志：`docker compose logs -f api`。
- 代码改动后重新构建：`docker compose up --build -d api`。容器方式适合联调、验收和部署前验证；日常改后端代码仍推荐 IntelliJ 运行。

### 3. 启动前端

新开一个终端:

```bash
cd front_end
npm install      # 首次运行需要
npm run dev
```

- 前端运行在 `http://localhost:5173`。

---

## 端口一览

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端 | http://localhost:8080 |
| 数据库 | localhost:5432 |

---

## 数据库常用命令

```bash
docker compose up -d db     # 启动数据库
docker compose stop db      # 停止（数据保留）
docker compose down         # 删除容器（数据保留在卷中）
docker compose down -v      # 删除容器和数据（彻底重置）
```

进入数据库交互终端:

```bash
docker exec -it bookkeeping-db psql -U bookkeeping -d bookkeeping
```

> ⚠️ 建表脚本只在数据卷为空的**首次启动**时执行。修改 `V1__init_schema.sql` 后，需执行
> `docker compose down -v && docker compose up -d db` 才会重新建表。
