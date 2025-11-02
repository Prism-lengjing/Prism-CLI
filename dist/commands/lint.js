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
exports.lintCommand = void 0;
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger();
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.lintCommand = new commander_1.Command('lint')
    .description('代码规范检查和格式化')
    .option('-f, --fix', '自动修复问题')
    .option('-p, --path <path>', '指定检查路径', '.')
    .option('--eslint-only', '仅运行ESLint')
    .option('--prettier-only', '仅运行Prettier')
    .action(async (options) => {
    try {
        logger.title('🔍 代码规范检查');
        const targetPath = path.resolve(options.path);
        if (!fs.existsSync(targetPath)) {
            logger.error(`路径不存在: ${targetPath}`);
            return;
        }
        // 检查配置文件
        const hasEslintConfig = await checkConfigFile(targetPath, '.eslintrc');
        const hasPrettierConfig = await checkConfigFile(targetPath, '.prettierrc');
        if (!hasEslintConfig && !hasPrettierConfig) {
            logger.warn('未找到ESLint或Prettier配置文件，是否创建默认配置？');
            const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
            const answers = await inquirer.default.prompt([
                {
                    type: 'confirm',
                    name: 'createConfig',
                    message: '创建默认配置文件？',
                    default: true,
                },
            ]);
            if (answers.createConfig) {
                await createDefaultConfigs(targetPath);
            }
            else {
                logger.error('无法继续，缺少配置文件');
                return;
            }
        }
        if (!options.prettierOnly && hasEslintConfig) {
            await runESLint(targetPath, options.fix);
        }
        if (!options.eslintOnly && hasPrettierConfig) {
            await runPrettier(targetPath, options.fix);
        }
        logger.success('代码检查完成！');
    }
    catch (error) {
        logger.error('代码检查失败:', error instanceof Error ? error : String(error));
        process.exit(1);
    }
});
async function checkConfigFile(targetPath, configName) {
    const configFiles = [
        path.join(targetPath, configName),
        path.join(targetPath, `${configName}.js`),
        path.join(targetPath, `${configName}.json`),
        path.join(targetPath, `${configName}.yml`),
        path.join(targetPath, `${configName}.yaml`),
    ];
    for (const file of configFiles) {
        if (fs.existsSync(file)) {
            logger.debug(`找到配置文件: ${file}`);
            return true;
        }
    }
    return false;
}
async function createDefaultConfigs(targetPath) {
    logger.startSpinner('创建默认配置文件...');
    try {
        // 创建ESLint配置
        const eslintConfig = {
            env: {
                browser: true,
                es2021: true,
                node: true,
            },
            extends: [
                'eslint:recommended',
                '@typescript-eslint/recommended',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            plugins: ['@typescript-eslint'],
            rules: {
                '@typescript-eslint/no-unused-vars': 'error',
                '@typescript-eslint/no-explicit-any': 'warn',
            },
        };
        fs.writeFileSync(path.join(targetPath, '.eslintrc.json'), JSON.stringify(eslintConfig, null, 2));
        // 创建Prettier配置
        const prettierConfig = {
            semi: true,
            trailingComma: 'es5',
            singleQuote: true,
            printWidth: 80,
            tabWidth: 2,
        };
        fs.writeFileSync(path.join(targetPath, '.prettierrc'), JSON.stringify(prettierConfig, null, 2));
        logger.stopSpinner(true, '默认配置文件创建完成');
    }
    catch (error) {
        logger.stopSpinner(false, '配置文件创建失败');
        logger.error('配置文件创建失败:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
async function runESLint(targetPath, fix) {
    logger.info('运行ESLint检查...');
    try {
        const command = `npx eslint "${targetPath}/**/*.{js,ts,jsx,tsx}" ${fix ? '--fix' : ''}`;
        const { stdout, stderr } = await execAsync(command);
        if (stdout) {
            console.log(chalk_1.default.yellow('ESLint结果:'));
            console.log(stdout);
        }
        if (stderr && !stderr.includes('warning')) {
            console.log(chalk_1.default.red('ESLint错误:'));
            console.log(stderr);
        }
        if (!stdout && (!stderr || stderr.includes('warning'))) {
            logger.success('ESLint检查通过！');
        }
    }
    catch (error) {
        if (error instanceof Error && 'stdout' in error && typeof error.stdout === 'string') {
            console.log(chalk_1.default.yellow('ESLint发现以下问题:'));
            console.log(error.stdout);
            if (!fix) {
                logger.info('使用 --fix 选项自动修复问题');
            }
        }
        else {
            throw new Error(`ESLint执行失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
async function runPrettier(targetPath, fix) {
    logger.info('运行Prettier格式化...');
    try {
        const command = `npx prettier "${targetPath}/**/*.{js,ts,jsx,tsx,json,css,md}" --check`;
        const { stdout, stderr } = await execAsync(command);
        if (stdout) {
            if (fix) {
                // 如果有问题且需要修复，运行格式化
                const fixCommand = `npx prettier "${targetPath}/**/*.{js,ts,jsx,tsx,json,css,md}" --write`;
                await execAsync(fixCommand);
                logger.success('Prettier格式化完成！');
            }
            else {
                console.log(chalk_1.default.yellow('Prettier发现格式问题:'));
                console.log(stdout);
                logger.info('使用 --fix 选项自动格式化');
            }
        }
        else {
            logger.success('Prettier检查通过！');
        }
    }
    catch (error) {
        if (error instanceof Error && 'stdout' in error && typeof error.stdout === 'string' && !fix) {
            console.log(chalk_1.default.yellow('Prettier发现格式问题:'));
            console.log(error.stdout);
            logger.info('使用 --fix 选项自动格式化');
        }
        else {
            throw new Error(`Prettier执行失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=lint.js.map