# Bookkeeping-App

个人记账应用。

- **后端**:Spring Boot 3.5 + Java 17（`bookkeeping-api/`）
- **前端**:React 18 + Vite + Tailwind（`front_end/`）
- **数据库**:PostgreSQL 16（通过 Docker 运行）

---

## 环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Docker | 任意较新版本 | 运行 PostgreSQL |
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

按 **数据库 → 后端 → 前端** 的顺序启动。

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

```bash
cd bookkeeping-api
./mvnw spring-boot:run
```

- 后端运行在 `http://localhost:8080`。
- 已启用 `devtools`,修改代码会自动热重载。

### 3. 启动前端

新开一个终端:

```bash
cd front_end
npm install      # 首次运行需要
npm run dev
```

- 前端运行在 `http://localhost:3000`。

---

## 端口一览

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
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
