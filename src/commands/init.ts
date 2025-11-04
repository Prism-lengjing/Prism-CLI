import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';
import { execSync } from 'child_process';

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
  {
    name: 'React + TypeScript',
    value: 'react-ts',
    description: '现代React应用，使用TypeScript和Vite',
  },
  {
    name: 'Vue + TypeScript',
    value: 'vue-ts',
    description: 'Vue 3应用，使用TypeScript和Vite',
  },
  {
    name: 'Node.js + TypeScript',
    value: 'node-ts',
    description: 'Node.js后端应用，使用TypeScript',
  },
  {
    name: 'Express + TypeScript',
    value: 'express-ts',
    description: 'Express Web服务器，使用TypeScript',
  },
  {
    name: 'Python',
    value: 'python',
    description: 'Python应用，包含基础项目结构',
  },
];

const PACKAGE_MANAGERS: PackageManagerChoice[] = [
  {
    name: 'npm',
    value: 'npm',
    installCommand: 'npm install',
    runCommand: 'npm run',
  },
  {
    name: 'yarn',
    value: 'yarn',
    installCommand: 'yarn install',
    runCommand: 'yarn',
  },
  {
    name: 'pnpm',
    value: 'pnpm',
    installCommand: 'pnpm install',
    runCommand: 'pnpm',
  },
  {
    name: 'bun',
    value: 'bun',
    installCommand: 'bun install',
    runCommand: 'bun run',
  },
];

export const initCommand = new Command('init')
  .description('初始化新项目')
  .argument('[project-name]', '项目名称')
  .option('-t, --template <template>', '使用指定模板')
  .option(
    '-p, --package-manager <manager>',
    '指定包管理器 (npm, yarn, pnpm, bun)'
  )
  .option('-y, --yes', '使用默认配置')
  .option('-i, --install', '创建后自动安装依赖')
  .option('-g, --git', '创建后初始化Git仓库并首个提交')
  .action(
    async (
      projectName: string,
      options: {
        template?: string;
        packageManager?: string;
        yes?: boolean;
        install?: boolean;
        git?: boolean;
      }
    ) => {
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
              choices: TEMPLATES.map((t) => ({
                name: `${t.name} - ${t.description}`,
                value: t.value,
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
        const detectedPM = template !== 'python' ? detectPackageManager() : undefined;
        if (!packageManager && !options.yes && template !== 'python') {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'packageManager',
              message: '选择包管理器:',
              choices: PACKAGE_MANAGERS,
              default: detectedPM || 'npm',
            },
          ]);
          packageManager = answers.packageManager;
        } else if (!packageManager && template !== 'python') {
          packageManager = detectedPM || 'npm';
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
        await generateProject(
          projectPath,
          projectName,
          template,
          packageManager
        );

        logger.success(`✨ 项目 ${chalk.cyan(projectName)} 创建成功！`);

        // 可选：安装依赖
        let didInstall = false;
        if (options.install && template !== 'python') {
          try {
            await installDependencies(projectPath, packageManager);
            didInstall = true;
          } catch (e) {
            logger.warn('自动安装依赖失败，请手动安装');
          }
        }

        // 可选：初始化Git
        let didGitInit = false;
        if (options.git) {
          try {
            await initGitRepo(projectPath);
            didGitInit = true;
          } catch (e) {
            logger.warn('Git初始化失败，请手动执行 git 命令');
          }
        }

        // 创建项目README
        await createProjectReadme(projectPath, projectName, template, packageManager);

        // 显示下一步操作
        showNextSteps(projectName, packageManager, template, didInstall, didGitInit);
      } catch (error) {
        logger.error(
          '项目初始化失败:',
          error instanceof Error ? error : String(error)
        );
        process.exit(1);
      }
    }
  );

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

async function copyTemplateFiles(
  projectPath: string,
  template: string
): Promise<void> {
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
    },
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
    '.prettierrc',
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
      await fs.copy(
        pnpmWorkspace,
        path.join(projectPath, 'pnpm-workspace.yaml')
      );
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

  // 从配置中获取作者与许可证信息
  const { project: projectConfig } = configManager.getConfig();

  for (const file of files) {
    if (isTextFile(file)) {
      let content = await fs.readFile(file, 'utf-8');

      // 替换模板变量
      content = content.replace(/\{\{projectName\}\}/g, projectName);
      content = content.replace(/\{\{template\}\}/g, template);
      content = content.replace(/\{\{author\}\}/g, projectConfig.author);
      content = content.replace(/\{\{license\}\}/g, projectConfig.license);

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
      files.push(...(await getFilesRecursively(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function isTextFile(filePath: string): boolean {
  const textExtensions = [
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.vue',
    '.py',
    '.json',
    '.md',
    '.txt',
    '.html',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.yml',
    '.yaml',
    '.xml',
  ];

  const ext = path.extname(filePath).toLowerCase();
  return textExtensions.includes(ext);
}

function showNextSteps(
  projectName: string,
  packageManager?: string,
  template?: string,
  didInstall: boolean = false,
  didGitInit: boolean = false
): void {
  logger.info('\n下一步操作:');
  logger.info(`  cd ${projectName}`);

  if (template === 'python') {
    logger.info('  python -m venv venv');
    logger.info('  # Windows: venv\\Scripts\\activate');
    logger.info('  # macOS/Linux: source venv/bin/activate');
    logger.info('  pip install -r requirements.txt');
    logger.info('  python main.py');
  } else if (packageManager) {
    const pm = PACKAGE_MANAGERS.find((p) => p.value === packageManager);
    if (pm) {
      if (!didInstall) {
        logger.info(`  ${pm.installCommand}`);
      }
      logger.info(`  ${pm.runCommand} dev`);
    }
  } else {
    if (!didInstall) {
      logger.info('  npm install');
    }
    logger.info('  npm run dev');
  }

  if (!didGitInit) {
    logger.info('  git init && git add -A && git commit -m "chore: init"');
  }
}

function detectPackageManager(): string | undefined {
  // 优先通过 npm user agent 检测
  const ua = process.env.npm_config_user_agent || '';
  if (ua.includes('pnpm')) return 'pnpm';
  if (ua.includes('yarn')) return 'yarn';
  if (ua.includes('bun')) return 'bun';

  // 回退：检测可执行命令
  try {
    execSync('pnpm -v', { stdio: 'ignore' });
    return 'pnpm';
  } catch {}
  try {
    execSync('yarn -v', { stdio: 'ignore' });
    return 'yarn';
  } catch {}
  try {
    execSync('bun -v', { stdio: 'ignore' });
    return 'bun';
  } catch {}
  try {
    execSync('npm -v', { stdio: 'ignore' });
    return 'npm';
  } catch {}
  return undefined;
}

async function installDependencies(
  projectPath: string,
  packageManager?: string
): Promise<void> {
  if (!packageManager) packageManager = 'npm';
  const pm = PACKAGE_MANAGERS.find((p) => p.value === packageManager);
  const command = pm ? pm.installCommand : 'npm install';
  logger.startSpinner('正在安装依赖...');
  try {
    execSync(command, { cwd: projectPath, stdio: 'inherit' });
    logger.stopSpinner(true, '依赖安装完成');
  } catch (e) {
    logger.stopSpinner(false, '依赖安装失败');
    throw e;
  }
}

async function initGitRepo(projectPath: string): Promise<void> {
  logger.startSpinner('正在初始化Git仓库...');
  try {
    execSync('git init', { cwd: projectPath, stdio: 'inherit' });
    execSync('git add -A', { cwd: projectPath, stdio: 'inherit' });
    execSync('git commit -m "chore: init project"', {
      cwd: projectPath,
      stdio: 'inherit',
    });
    logger.stopSpinner(true, 'Git初始化完成');
  } catch (e) {
    logger.stopSpinner(false, 'Git初始化失败');
    throw e;
  }
}

async function createProjectReadme(
  projectPath: string,
  projectName: string,
  template: string,
  packageManager?: string
): Promise<void> {
  // 若模板已提供 README，则不覆盖
  const readmePath = path.join(projectPath, 'README.md');
  if (fs.existsSync(readmePath)) return;

  const pm = PACKAGE_MANAGERS.find((p) => p.value === packageManager) || {
    installCommand: 'npm install',
    runCommand: 'npm run',
  };

  let content = `# ${projectName}\n\n` +
    `使用 Prism-CLI 生成的项目（模板：${template}）。\n\n` +
    `## 快速开始\n\n` +
    `\`${pm.installCommand}\`\n\n`;

  if (template === 'react-ts' || template === 'vue-ts') {
    content += `开发：\`${pm.runCommand} dev\`\n` +
      `构建：\`${pm.runCommand} build\`\n` +
      `预览：\`${pm.runCommand} preview\`\n\n`;
  } else if (template === 'node-ts' || template === 'express-ts') {
    content += `开发：\`${pm.runCommand} dev\`\n` +
      `构建：\`${pm.runCommand} build\`\n` +
      `运行：\`${pm.runCommand} start\`\n\n`;
  } else if (template === 'python') {
    content += `创建虚拟环境：\`python -m venv venv\`\n` +
      `Windows 激活：\`venv\\Scripts\\activate\`\n` +
      `macOS/Linux 激活：\`source venv/bin/activate\`\n` +
      `安装依赖：\`pip install -r requirements.txt\`\n` +
      `运行：\`python src/main.py\`\n\n`;
  }

  content += `由 Prism-CLI 创建。`;

  try {
    await fs.writeFile(readmePath, content, 'utf-8');
  } catch (e) {
    // 非关键步骤，写入失败时忽略
  }
}
