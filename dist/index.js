#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const init_1 = require("./commands/init");
const config_1 = require("./commands/config");
const template_1 = require("./commands/template");
const program = new commander_1.Command();
// 读取package.json获取版本信息
const packageJson = require('../package.json');
program
    .name('prism')
    .description('棱镜团队CLI - 快速搭建项目脚手架')
    .version(packageJson.version, '-v, --version', '显示版本号');
// 添加命令
program.addCommand(init_1.initCommand);
program.addCommand(config_1.configCommand);
program.addCommand(template_1.templateCommand);
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
    console.log(chalk_1.default.red(`未知命令: ${program.args.join(' ')}`));
    console.log('使用 --help 查看可用命令');
    process.exit(1);
});
// 解析命令行参数
program.parse();
// 如果没有提供任何参数，显示帮助信息
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map