import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(morgan('combined')); // 日志
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 路由
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚀 欢迎使用棱镜团队CLI创建的Express TypeScript项目！',
    project: '{{projectName}}',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API路由示例
app.get('/api/users', (req: Request, res: Response) => {
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' }
  ];
  res.json(users);
});

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 404处理
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: '路由未找到',
    path: req.originalUrl
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🌟 {{projectName}} 服务器运行在 http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

export default app;