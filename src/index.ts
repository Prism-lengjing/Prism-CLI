#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { configCommand } from './commands/config';
import { templateCommand } from './commands/template';

const program = new Command();

// 读取package.json获取版本信息
const packageJson = require('../package.json');

program
  .name('prism')
  .description('棱镜团队CLI - 快速搭建项目脚手架')
  .version(packageJson.version, '-v, --version', '显示版本号');

// 添加命令
program.addCommand(initCommand);
program.addCommand(configCommand);
program.addCommand(templateCommand);

// 自定义帮助信息
program.on('--help', () => {
  console.log('');
  console.log('示例:');
  console.log('  $ prism init my-project');
  console.log('  $ prism init my-project --template react-ts');
  console.log('  $ prism config');
  console.log('  $ prism template');
  console.log('');
  console.log('更多信息请访问: https://github.com/Prism-lengjing/Prism-CLI');
});

// 处理未知命令
program.on('command:*', () => {
  console.log(chalk.red(`未知命令: ${program.args.join(' ')}`));
  console.log('使用 --help 查看可用命令');
  process.exit(1);
});

// 解析命令行参数
program.parse();

// 如果没有提供任何参数，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
