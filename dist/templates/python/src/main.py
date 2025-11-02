#!/usr/bin/env python3
"""
{{projectName}} - 由棱镜团队CLI创建的Python项目
"""

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


def greet(name: str) -> str:
    """问候函数"""
    return f"Hello, {name}! 这是一个Python项目。"


class Application:
    """应用程序主类"""
    
    def __init__(self, name: str):
        self.name = name
    
    def start(self) -> None:
        """启动应用程序"""
        print(f"🚀 欢迎使用棱镜团队CLI创建的Python项目！")
        print(f"📦 项目名称: {self.name}")
        print(f"🌍 环境: {os.getenv('ENVIRONMENT', 'development')}")
        print(f"🎯 {self.name} 应用程序启动成功！")
        print(greet("开发者"))


def main():
    """主函数"""
    app = Application("{{projectName}}")
    app.start()


if __name__ == "__main__":
    main()