# SAST Console

This is the management console for the SAST (Static Application Security Testing) system. It provides a web interface for managing agents, tasks, and viewing security scan results.

## Features

- Agent management (registration, status monitoring)
- Task creation and management
- Security scan results visualization
- Vulnerability tracking and reporting

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Vercel Postgres)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (for deployment)
- Vercel Postgres database

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file with the following variables:

```
POSTGRES_URL="your-postgres-connection-string"
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

The database schema is defined in `app/lib/db/schema.sql`. You can apply this schema to your Vercel Postgres database using the Vercel dashboard or CLI.

## API Endpoints

The console provides the following API endpoints for agent communication:

- `POST /api/agents/register` - Register a new agent
- `POST /api/agents/:id/heartbeat` - Send agent heartbeat
- `GET /api/agents/:id/tasks` - Get tasks for an agent
- `PATCH /api/tasks/:id` - Update task status
- `POST /api/tasks/:id/results` - Submit scan results

## Deployment

The console is designed to be deployed on Vercel:

1. Push your code to a Git repository
2. Connect the repository to Vercel
3. Configure the Vercel Postgres database
4. Deploy the application

## License

This software is provided under the MIT License.

## 环境变量配置

本应用需要设置以下环境变量：

### 数据库连接

**重要安全提示：** 永远不要在代码中硬编码数据库连接字符串。应该通过环境变量传递敏感信息。

#### 本地开发

1. 创建一个 `.env.local` 文件（已被 .gitignore 忽略）
2. 添加您的数据库连接字符串：
   ```
   POSTGRES_URL="postgres://username:password@host/database?sslmode=require"
   ```

#### Vercel 部署

在 Vercel 的项目设置中添加以下环境变量：
- `POSTGRES_URL`: 您的数据库连接字符串

#### 环境变量详解

| 变量名 | 描述 | 示例 |
|-------|------|------|
| POSTGRES_URL | PostgreSQL 数据库的连接字符串 | postgres://user:pass@host/db?sslmode=require |

## 数据库初始化

首次设置数据库时，需要运行初始化脚本：

```bash
cd console
node app/lib/db/init-db.js
``` 