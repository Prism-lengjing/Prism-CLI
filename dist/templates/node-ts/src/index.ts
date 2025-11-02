import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

console.log('🚀 欢迎使用棱镜团队CLI创建的Node.js TypeScript项目！');
console.log(`📦 项目名称: {{projectName}}`);
console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);

// 示例函数
function greet(name: string): string {
  return `Hello, ${name}! 这是一个TypeScript项目。`;
}

// 示例类
class Application {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public start(): void {
    console.log(`🎯 ${this.name} 应用程序启动成功！`);
    console.log(greet('开发者'));
  }
}

// 启动应用
const app = new Application('{{projectName}}');
app.start();