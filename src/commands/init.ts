import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';

const logger = new Logger();
const configManager = new ConfigManager();

interface TemplateChoice {
  name: string;
  value: string;
  description?: string;
}

interface PackageManagerChoice {
  name: string;
  value: string;
  installCommand: string;
  runCommand: string;
}

const TEMPLATES: TemplateChoice[] = [
  { name: 'React + TypeScript', value: 'react-ts', description: '现代React应用，使用TypeScript和Vite' },
  { name: 'Vue + TypeScript', value: 'vue-ts', description: 'Vue 3应用，使用TypeScript和Vite' },
  { name: 'Node.js + TypeScript', value: 'node-ts', description: 'Node.js后端应用，使用TypeScript' },
  { name: 'Express + TypeScript', value: 'express-ts', description: 'Express Web服务器，使用TypeScript' },
  { name: 'Python', value: 'python', description: 'Python应用，包含基础项目结构' },
];

const PACKAGE_MANAGERS: PackageManagerChoice[] = [
  { name: 'npm', value: 'npm', installCommand: 'npm install', runCommand: 'npm run' },
  { name: 'yarn', value: 'yarn', installCommand: 'yarn install', runCommand: 'yarn' },
  { name: 'pnpm', value: 'pnpm', installCommand: 'pnpm install', runCommand: 'pnpm' },
  { name: 'bun', value: 'bun', installCommand: 'bun install', runCommand: 'bun run' },
];

export const initCommand = new Command('init')
  .description('初始化新项目')
  .argument('[project-name]', '项目名称')
  .option('-t, --template <template>', '使用指定模板')
  .option('-p, --package-manager <manager>', '指定包管理器 (npm, yarn, pnpm, bun)')
  .option('-y, --yes', '使用默认配置')
  .action(async (projectName: string, options: { template?: string; packageManager?: string; yes?: boolean }) => {
    try {
      logger.title('🚀 初始化新项目');

      // 获取项目名称
      if (!projectName) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: '请输入项目名称:',
            validate: (input: string) => {
              if (!input.trim()) {
                return '项目名称不能为空';
              }
              if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                return '项目名称只能包含字母、数字、连字符和下划线';
              }
              return true;
            },
          },
        ]);
        projectName = answers.projectName;
      }

      const projectPath = path.resolve(projectName);

      // 检查目录是否已存在
      if (fs.existsSync(projectPath)) {
        logger.error(`目录 ${projectName} 已存在`);
        return;
      }

      // 选择模板
      let template = options.template;
      if (!template && !options.yes) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'template',
            message: '选择项目模板:',
            choices: TEMPLATES.map(t => ({
              name: `${t.name} - ${t.description}`,
              value: t.value
            })),
            default: configManager.getDefaultTemplate(),
          },
        ]);
        template = answers.template;
      } else if (!template) {
        template = configManager.getDefaultTemplate();
      }

      // 选择包管理器
      let packageManager = options.packageManager;
      if (!packageManager && !options.yes && template !== 'python') {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'packageManager',
            message: '选择包管理器:',
            choices: PACKAGE_MANAGERS,
            default: 'npm',
          },
        ]);
        packageManager = answers.packageManager;
      } else if (!packageManager && template !== 'python') {
        packageManager = 'npm';
      }

      logger.info(`创建项目: ${chalk.cyan(projectName)}`);
      logger.info(`使用模板: ${chalk.cyan(template)}`);
      if (packageManager) {
        logger.info(`包管理器: ${chalk.cyan(packageManager)}`);
      }

      // 确保template不为空
      if (!template) {
        template = configManager.getDefaultTemplate();
      }

      // 创建项目目录
      fs.ensureDirSync(projectPath);

      // 生成项目
      await generateProject(projectPath, projectName, template, packageManager);

      logger.success(`✨ 项目 ${chalk.cyan(projectName)} 创建成功！`);
      
      // 显示下一步操作
      showNextSteps(projectName, packageManager, template);

    } catch (error) {
      logger.error('项目初始化失败:', error instanceof Error ? error : String(error));
      process.exit(1);
    }
  });

async function generateProject(
  projectPath: string,
  projectName: string,
  template: string,
  packageManager?: string
): Promise<void> {
  logger.startSpinner('正在生成项目文件...');

  try {
    // 复制模板文件
    await copyTemplateFiles(projectPath, template);
    
    // 复制通用配置文件
    await copyCommonFiles(projectPath, template, packageManager);
    
    // 处理模板变量
    await processTemplateVariables(projectPath, projectName, template);

    logger.stopSpinner(true, '项目文件生成完成');
  } catch (error) {
    logger.stopSpinner(false, '项目文件生成失败');
    throw error;
  }
}

async function copyTemplateFiles(projectPath: string, template: string): Promise<void> {
  const templatePath = path.join(__dirname, '..', 'templates', template);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`模板 ${template} 不存在`);
  }

  // 复制模板文件
  await fs.copy(templatePath, projectPath, {
    filter: (src) => {
      // 排除某些文件
      const relativePath = path.relative(templatePath, src);
      return !relativePath.includes('node_modules');
    }
  });
}

async function copyCommonFiles(
  projectPath: string,
  template: string,
  packageManager?: string
): Promise<void> {
  const commonPath = path.join(__dirname, '..', 'templates', 'common');
  
  if (!fs.existsSync(commonPath)) {
    return;
  }

  // 复制通用配置文件
  const commonFiles = [
    '.gitignore',
    '.editorconfig',
    '.eslintrc.json',
    '.prettierrc'
  ];

  for (const file of commonFiles) {
    const srcPath = path.join(commonPath, file);
    const destPath = path.join(projectPath, file);
    
    if (fs.existsSync(srcPath)) {
      await fs.copy(srcPath, destPath);
    }
  }

  // 复制GitHub Actions工作流
  const workflowsPath = path.join(commonPath, '.github');
  if (fs.existsSync(workflowsPath)) {
    await fs.copy(workflowsPath, path.join(projectPath, '.github'));
  }

  // 根据包管理器复制相应配置
  if (packageManager === 'pnpm') {
    const pnpmWorkspace = path.join(commonPath, 'pnpm-workspace.yaml');
    if (fs.existsSync(pnpmWorkspace)) {
      await fs.copy(pnpmWorkspace, path.join(projectPath, 'pnpm-workspace.yaml'));
    }
  } else if (packageManager === 'yarn') {
    const yarnrc = path.join(commonPath, '.yarnrc.yml');
    if (fs.existsSync(yarnrc)) {
      await fs.copy(yarnrc, path.join(projectPath, '.yarnrc.yml'));
    }
  }
}

async function processTemplateVariables(
  projectPath: string,
  projectName: string,
  template: string
): Promise<void> {
  // 处理所有文件中的模板变量
  const files = await getFilesRecursively(projectPath);
  
  for (const file of files) {
    if (isTextFile(file)) {
      let content = await fs.readFile(file, 'utf-8');
      
      // 替换模板变量
      content = content.replace(/\{\{projectName\}\}/g, projectName);
      content = content.replace(/\{\{template\}\}/g, template);
      
      await fs.writeFile(file, content);
    }
  }
}

async function getFilesRecursively(dir: string): Promise<string[]> {
  const files: string[] = [];
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...await getFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

function isTextFile(filePath: string): boolean {
  const textExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.json', '.md', '.txt',
    '.html', '.css', '.scss', '.sass', '.less', '.yml', '.yaml', '.xml'
  ];
  
  const ext = path.extname(filePath).toLowerCase();
  return textExtensions.includes(ext);
}

function showNextSteps(projectName: string, packageManager?: string, template?: string): void {
  logger.info('\n下一步操作:');
  logger.info(`  cd ${projectName}`);
  
  if (template === 'python') {
    logger.info('  python -m venv venv');
    logger.info('  # Windows: venv\\Scripts\\activate');
    logger.info('  # macOS/Linux: source venv/bin/activate');
    logger.info('  pip install -r requirements.txt');
    logger.info('  python main.py');
  } else if (packageManager) {
    const pm = PACKAGE_MANAGERS.find(p => p.value === packageManager);
    if (pm) {
      logger.info(`  ${pm.installCommand}`);
      logger.info(`  ${pm.runCommand} dev`);
    }
  } else {
    logger.info('  npm install');
    logger.info('  npm run dev');
  }
}