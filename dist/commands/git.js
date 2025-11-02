"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitCommand = void 0;
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const util_1 = require("util");
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger();
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.gitCommand = new commander_1.Command('git')
    .description('Git工作流辅助工具')
    .addCommand(new commander_1.Command('commit')
    .description('规范化提交代码')
    .option('-m, --message <message>', '提交信息')
    .option('-a, --add-all', '添加所有更改')
    .action(async (options) => {
    try {
        logger.title('📝 Git 规范化提交');
        // 检查是否是Git仓库
        if (!await isGitRepository()) {
            logger.error('当前目录不是Git仓库，请先运行 git init');
            return;
        }
        let message = options.message;
        // 如果没有提供提交信息，使用交互式方式获取
        if (!message) {
            message = await getCommitMessage();
        }
        // 添加所有更改（如果指定了-a选项）
        if (options.addAll) {
            logger.info('添加所有更改...');
            await execAsync('git add .');
        }
        // 检查是否有暂存的更改
        const { stdout: stagedFiles } = await execAsync('git diff --cached --name-only');
        if (!stagedFiles.trim()) {
            logger.warn('没有暂存的更改，请先添加要提交的文件');
            logger.info('使用 git add <file> 添加文件，或使用 -a 选项');
            return;
        }
        // 执行提交
        logger.startSpinner('正在提交...');
        await execAsync(`git commit -m "${message}"`);
        logger.stopSpinner(true, '提交成功！');
        logger.info(`提交信息: ${chalk_1.default.cyan(message)}`);
    }
    catch (error) {
        logger.stopSpinner(false, '提交失败');
        logger.error('Git提交失败:', error instanceof Error ? error : String(error));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('branch')
    .description('创建规范化的分支')
    .argument('<branch-name>', '分支名称')
    .option('-t, --type <type>', '分支类型', 'feature')
    .option('-b, --base <base>', '基础分支', 'main')
    .action(async (branchName, options) => {
    try {
        logger.title('🌿 创建规范化分支');
        if (!await isGitRepository()) {
            logger.error('当前目录不是Git仓库，请先运行 git init');
            return;
        }
        const branchType = options.type;
        const baseBranch = options.base;
        const formattedBranchName = formatBranchName(branchName, branchType);
        logger.info(`创建分支: ${chalk_1.default.cyan(formattedBranchName)}`);
        logger.info(`分支类型: ${chalk_1.default.cyan(branchType)}`);
        logger.info(`基础分支: ${chalk_1.default.cyan(baseBranch)}`);
        // 检查基础分支是否存在
        try {
            await execAsync(`git show-ref --verify --quiet refs/heads/${baseBranch}`);
        }
        catch {
            logger.error(`基础分支 ${baseBranch} 不存在`);
            return;
        }
        // 创建并切换到新分支
        await execAsync(`git checkout -b ${formattedBranchName} ${baseBranch}`);
        logger.success(`分支 ${formattedBranchName} 创建成功！`);
    }
    catch (error) {
        logger.error('分支创建失败:', error instanceof Error ? error : String(error));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('status')
    .description('查看Git仓库状态')
    .action(async () => {
    try {
        logger.title('📊 Git 仓库状态');
        if (!await isGitRepository()) {
            logger.error('当前目录不是Git仓库');
            return;
        }
        // 获取分支信息
        const { stdout: branchInfo } = await execAsync('git branch --show-current');
        const currentBranch = branchInfo.trim();
        // 获取状态信息
        const { stdout: statusInfo } = await execAsync('git status --porcelain');
        const { stdout: logInfo } = await execAsync('git log --oneline -5');
        logger.info(`当前分支: ${chalk_1.default.cyan(currentBranch)}`);
        if (statusInfo.trim()) {
            logger.info('\n文件状态:');
            const files = statusInfo.trim().split('\n');
            files.forEach(file => {
                const status = file.substring(0, 2);
                const filename = file.substring(3);
                const statusText = getStatusText(status);
                console.log(`  ${statusText} ${filename}`);
            });
        }
        else {
            logger.info('工作目录干净，没有更改');
        }
        if (logInfo.trim()) {
            logger.info('\n最近提交:');
            logInfo.trim().split('\n').forEach(line => {
                console.log(`  ${chalk_1.default.gray(line)}`);
            });
        }
    }
    catch (error) {
        logger.error('获取Git状态失败:', error instanceof Error ? error : String(error));
    }
}));
async function isGitRepository() {
    try {
        await execAsync('git rev-parse --git-dir');
        return true;
    }
    catch {
        return false;
    }
}
async function getCommitMessage() {
    const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
    const answers = await inquirer.default.prompt([
        {
            type: 'list',
            name: 'type',
            message: '选择提交类型:',
            choices: [
                { name: '✨ feat: 新功能', value: 'feat' },
                { name: '🐛 fix: 修复bug', value: 'fix' },
                { name: '📚 docs: 文档更新', value: 'docs' },
                { name: '💎 style: 代码格式', value: 'style' },
                { name: '📦 refactor: 重构', value: 'refactor' },
                { name: '🚀 perf: 性能优化', value: 'perf' },
                { name: '🚨 test: 测试相关', value: 'test' },
                { name: '🚧 build: 构建相关', value: 'build' },
                { name: '🔧 ci: CI相关', value: 'ci' },
                { name: '🗯 chore: 其他修改', value: 'chore' },
            ],
        },
        {
            type: 'input',
            name: 'scope',
            message: '影响范围（可选）:',
        },
        {
            type: 'input',
            name: 'subject',
            message: '简短描述:',
            validate: (input) => {
                if (!input.trim()) {
                    return '描述不能为空';
                }
                if (input.length > 50) {
                    return '描述不能超过50个字符';
                }
                return true;
            },
        },
        {
            type: 'input',
            name: 'body',
            message: '详细描述（可选）:',
        },
        {
            type: 'confirm',
            name: 'isBreaking',
            message: '是否有破坏性更改?',
            default: false,
        },
    ]);
    let message = answers.type;
    if (answers.scope) {
        message += `(${answers.scope})`;
    }
    message += `: ${answers.subject}`;
    if (answers.body) {
        message += `\n\n${answers.body}`;
    }
    if (answers.isBreaking) {
        message += '\n\nBREAKING CHANGE: 破坏性更改说明';
    }
    return message;
}
function formatBranchName(branchName, type) {
    // 清理分支名称
    const cleanName = branchName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return `${type}/${cleanName}`;
}
function getStatusText(status) {
    const statusMap = {
        'A ': chalk_1.default.green('新增'),
        ' M': chalk_1.default.yellow('修改'),
        ' D': chalk_1.default.red('删除'),
        '??': chalk_1.default.cyan('未跟踪'),
        'R ': chalk_1.default.blue('重命名'),
        'C ': chalk_1.default.magenta('复制'),
    };
    return statusMap[status] || chalk_1.default.gray(status);
}
//# sourceMappingURL=git.js.map