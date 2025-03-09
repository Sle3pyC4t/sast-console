# 数据库设置指南

## Vercel Neon PostgreSQL 设置

本项目使用Vercel的Neon PostgreSQL服务作为数据库。在Vercel部署环境中，数据库连接是自动配置的，但您需要确保以下几点：

1. 您已经在Vercel仪表板中为您的项目设置了Neon PostgreSQL存储。
2. `POSTGRES_URL`环境变量已经由Vercel自动配置。

## 表初始化问题解决

如果您遇到`NeonDbError: relation "agents" does not exist`错误，这意味着数据库表尚未创建。解决方法：

1. 在部署过程中，自动运行初始化脚本
   - 本项目的`package.json`已配置为在构建过程中运行数据库初始化
   - `npm run build`命令包含`npm run db:init`步骤

2. 手动初始化数据库表（如果自动初始化失败）：
   - 在Vercel仪表板中，进入项目 → 存储 → 您的Neon PostgreSQL实例
   - 使用Web界面执行位于`app/lib/db/schema.sql`的SQL脚本
   - 或者使用Vercel CLI执行：`vercel env pull && node app/lib/db/init-db.js`

## 本地开发设置

在本地开发环境中设置数据库连接：

1. 从Vercel仪表板获取连接字符串：
   - 进入项目 → 存储 → 您的Neon PostgreSQL实例 → 连接
   - 复制连接字符串

2. 设置本地环境变量：
   - 创建`.env.local`文件（已在.gitignore中忽略）
   - 添加：`POSTGRES_URL=您的连接字符串`

3. 初始化本地数据库：
   - 运行：`npm run db:init`
   - 如果成功，您将看到"Database initialized successfully!"消息

## 连接字符串格式

Neon PostgreSQL连接字符串格式：
```
postgres://username:password@hostname:port/database
```

## 验证连接

要验证数据库连接和初始化是否成功：

1. 启动应用程序：`npm run dev`
2. 访问代理列表页面（应显示空列表，而不是错误）

如果您仍然遇到问题，请检查应用程序日志以获取更详细的错误信息。 