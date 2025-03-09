const fs = require('fs');
const path = require('path');
const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    // 检查是否有数据库连接
    if (!process.env.POSTGRES_URL && process.env.NODE_ENV !== 'production') {
      console.log('No POSTGRES_URL environment variable found. In production, this will be provided by Vercel.');
      if (process.env.NODE_ENV === 'development') {
        console.log('For local development, please set the POSTGRES_URL environment variable.');
      }
      // 在开发环境中不要将缺少连接字符串视为致命错误
      if (process.env.NODE_ENV !== 'development') {
        process.exit(1);
      }
      return;
    }

    console.log('Reading schema file...');
    const schemaPath = path.join(process.cwd(), 'app', 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Initializing database...');
    await sql.query(schema);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Database initialization error:', error);
    
    // 特殊处理触发器已存在的错误
    if (error.message && error.message.includes('trigger') && error.message.includes('already exists')) {
      console.log('Ignoring trigger already exists error, this is expected during redeployment.');
      // 不将触发器已存在视为致命错误
      return;
    }
    
    // 在生产环境，如果是与特定表不存在相关的错误，我们应该失败的明确一些
    if (process.env.NODE_ENV === 'production' && 
        error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('Database schema failed to initialize properly. Tables are missing.');
      process.exit(1);
    }
    
    // 在开发环境中，我们可以允许一些错误
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase }; 