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
exports.templateCommand = void 0;
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger();
exports.templateCommand = new commander_1.Command('template')
    .description('管理项目模板')
    .action(async () => {
    try {
        logger.title('📋 模板管理');
        const choices = [
            { name: '查看可用模板', value: 'list' },
            { name: '查看模板详情', value: 'info' },
            { name: '验证模板', value: 'validate' },
        ];
        const { action } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: '选择操作:',
                choices,
            },
        ]);
        switch (action) {
            case 'list':
                await listTemplates();
                break;
            case 'info':
                await showTemplateInfo();
                break;
            case 'validate':
                await validateTemplates();
                break;
        }
    }
    catch (error) {
        logger.error('模板操作失败:', error instanceof Error ? error : String(error));
    }
});
async function listTemplates() {
    const templatesPath = path.join(__dirname, '..', 'templates');
    if (!fs.existsSync(templatesPath)) {
        logger.error('模板目录不存在');
        return;
    }
    const templates = fs
        .readdirSync(templatesPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && dirent.name !== 'common')
        .map((dirent) => dirent.name);
    if (templates.length === 0) {
        logger.warn('没有找到可用的模板');
        return;
    }
    logger.info('\n可用模板:');
    templates.forEach((template) => {
        const templatePath = path.join(templatesPath, template);
        const packageJsonPath = path.join(templatePath, 'package.json');
        let description = '';
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = fs.readJsonSync(packageJsonPath);
                description = packageJson.description || '';
            }
            catch {
                // 忽略错误
            }
        }
        logger.info(`  ${chalk_1.default.cyan(template)} ${description ? `- ${description}` : ''}`);
    });
}
async function showTemplateInfo() {
    const templatesPath = path.join(__dirname, '..', 'templates');
    const templates = fs
        .readdirSync(templatesPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && dirent.name !== 'common')
        .map((dirent) => dirent.name);
    if (templates.length === 0) {
        logger.warn('没有找到可用的模板');
        return;
    }
    const { template } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'template',
            message: '选择要查看的模板:',
            choices: templates,
        },
    ]);
    const templatePath = path.join(templatesPath, template);
    const packageJsonPath = path.join(templatePath, 'package.json');
    logger.info(`\n模板: ${chalk_1.default.cyan(template)}`);
    logger.info(`路径: ${templatePath}`);
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = fs.readJsonSync(packageJsonPath);
            logger.info(`描述: ${packageJson.description || '无'}`);
            logger.info(`版本: ${packageJson.version || '无'}`);
            if (packageJson.dependencies) {
                logger.info('\n依赖:');
                Object.entries(packageJson.dependencies).forEach(([name, version]) => {
                    logger.info(`  ${name}: ${version}`);
                });
            }
            if (packageJson.devDependencies) {
                logger.info('\n开发依赖:');
                Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
                    logger.info(`  ${name}: ${version}`);
                });
            }
        }
        catch {
            logger.error('读取package.json失败');
        }
    }
    // 显示文件结构
    logger.info('\n文件结构:');
    await showDirectoryTree(templatePath, '', 0, 2);
}
async function validateTemplates() {
    const templatesPath = path.join(__dirname, '..', 'templates');
    const templates = fs
        .readdirSync(templatesPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && dirent.name !== 'common')
        .map((dirent) => dirent.name);
    logger.info('\n验证模板...');
    for (const template of templates) {
        const templatePath = path.join(templatesPath, template);
        const isValid = await validateTemplate(template, templatePath);
        if (isValid) {
            logger.success(`✓ ${template} - 有效`);
        }
        else {
            logger.error(`✗ ${template} - 无效`);
        }
    }
}
// 每个模板需要包含的关键文件/路径
const REQUIRED_FILES_BY_TEMPLATE = {
    'react-ts': [
        'package.json',
        'index.html',
        'tsconfig.json',
        'tsconfig.node.json',
        'vite.config.ts',
        path.join('src', 'main.tsx'),
        path.join('src', 'App.tsx'),
        path.join('src', 'vite-env.d.ts'),
    ],
    'vue-ts': [
        'package.json',
        'index.html',
        'tsconfig.json',
        'tsconfig.node.json',
        'vite.config.ts',
        path.join('src', 'main.ts'),
        path.join('src', 'App.vue'),
        path.join('src', 'vite-env.d.ts'),
    ],
    'node-ts': [
        'package.json',
        path.join('src', 'index.ts'),
    ],
    'express-ts': [
        'package.json',
        path.join('src', 'app.ts'),
    ],
    python: [
        'requirements.txt',
        path.join('src', 'main.py'),
    ],
};
async function validateTemplate(templateName, templatePath) {
    try {
        // 检查必需文件
        const requiredFiles = REQUIRED_FILES_BY_TEMPLATE[templateName] || [
            'package.json',
        ];
        for (const file of requiredFiles) {
            const filePath = path.join(templatePath, file);
            if (!fs.existsSync(filePath)) {
                logger.warn(`  缺少文件: ${file}`);
                return false;
            }
        }
        // 验证package.json
        const packageJsonPath = path.join(templatePath, 'package.json');
        const packageJson = fs.readJsonSync(packageJsonPath);
        if (!packageJson.name || !packageJson.version) {
            logger.warn(`  package.json缺少必需字段`);
            return false;
        }
        // 前端模板（react/vue）验证脚本命令
        if (templateName === 'react-ts' || templateName === 'vue-ts') {
            const scripts = packageJson.scripts || {};
            const hasDev = typeof scripts.dev === 'string';
            const hasBuild = typeof scripts.build === 'string';
            const hasPreview = typeof scripts.preview === 'string';
            if (!hasDev || !hasBuild || !hasPreview) {
                logger.warn('  scripts 中缺少 dev/build/preview 命令');
                return false;
            }
        }
        return true;
    }
    catch (error) {
        logger.warn(`  验证失败: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}
async function showDirectoryTree(dirPath, prefix = '', depth = 0, maxDepth = 2) {
    if (depth > maxDepth)
        return;
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const isLast = i === items.length - 1;
            const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
            const nextPrefix = prefix + (isLast ? '    ' : '│   ');
            logger.info(`${currentPrefix}${item.name}`);
            if (item.isDirectory() && depth < maxDepth) {
                const itemPath = path.join(dirPath, item.name);
                await showDirectoryTree(itemPath, nextPrefix, depth + 1, maxDepth);
            }
        }
    }
    catch {
        // 忽略错误
    }
}
//# sourceMappingURL=template.js.map