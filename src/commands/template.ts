import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { Logger } from '../utils/logger';

const logger = new Logger();

export const templateCommand = new Command('template')
  .description('管理项目模板')
  .action(async () => {
    try {
      logger.title('📋 模板管理');
      
      const choices = [
        { name: '查看可用模板', value: 'list' },
        { name: '查看模板详情', value: 'info' },
        { name: '验证模板', value: 'validate' },
      ];

      const { action } = await inquirer.prompt([
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
    } catch (error) {
      logger.error('模板操作失败:', error instanceof Error ? error : String(error));
    }
  });

async function listTemplates(): Promise<void> {
  const templatesPath = path.join(__dirname, '..', 'templates');
  
  if (!fs.existsSync(templatesPath)) {
    logger.error('模板目录不存在');
    return;
  }

  const templates = fs.readdirSync(templatesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'common')
    .map(dirent => dirent.name);

  if (templates.length === 0) {
    logger.warn('没有找到可用的模板');
    return;
  }

  logger.info('\n可用模板:');
  templates.forEach(template => {
    const templatePath = path.join(templatesPath, template);
    const packageJsonPath = path.join(templatePath, 'package.json');
    
    let description = '';
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = fs.readJsonSync(packageJsonPath);
        description = packageJson.description || '';
      } catch {
        // 忽略错误
      }
    }
    
    logger.info(`  ${chalk.cyan(template)} ${description ? `- ${description}` : ''}`);
  });
}

async function showTemplateInfo(): Promise<void> {
  const templatesPath = path.join(__dirname, '..', 'templates');
  const templates = fs.readdirSync(templatesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'common')
    .map(dirent => dirent.name);

  if (templates.length === 0) {
    logger.warn('没有找到可用的模板');
    return;
  }

  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '选择要查看的模板:',
      choices: templates,
    },
  ]);

  const templatePath = path.join(templatesPath, template);
  const packageJsonPath = path.join(templatePath, 'package.json');

  logger.info(`\n模板: ${chalk.cyan(template)}`);
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
    } catch {
      logger.error('读取package.json失败');
    }
  }

  // 显示文件结构
  logger.info('\n文件结构:');
  await showDirectoryTree(templatePath, '', 0, 2);
}

async function validateTemplates(): Promise<void> {
  const templatesPath = path.join(__dirname, '..', 'templates');
  const templates = fs.readdirSync(templatesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'common')
    .map(dirent => dirent.name);

  logger.info('\n验证模板...');

  for (const template of templates) {
    const templatePath = path.join(templatesPath, template);
    const isValid = await validateTemplate(templatePath);
    
    if (isValid) {
      logger.success(`✓ ${template} - 有效`);
    } else {
      logger.error(`✗ ${template} - 无效`);
    }
  }
}

async function validateTemplate(templatePath: string): Promise<boolean> {
  try {
    // 检查必需文件
    const requiredFiles = ['package.json'];
    
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

    return true;
  } catch (error) {
    logger.warn(`  验证失败: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function showDirectoryTree(
  dirPath: string,
  prefix: string = '',
  depth: number = 0,
  maxDepth: number = 2
): Promise<void> {
  if (depth > maxDepth) return;

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
  } catch {
    // 忽略错误
  }
}