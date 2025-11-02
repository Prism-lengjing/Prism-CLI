import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';

const logger = new Logger();
const configManager = new ConfigManager();

export const configCommand = new Command('config')
  .description('管理CLI配置')
  .action(async () => {
    try {
      logger.title('⚙️  配置管理');

      const choices = [
        { name: '查看当前配置', value: 'view' },
        { name: '设置默认模板', value: 'template' },
        { name: '设置作者信息', value: 'author' },
        { name: '设置许可证', value: 'license' },
        { name: '重置配置', value: 'reset' },
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
        case 'view':
          await viewConfig();
          break;
        case 'template':
          await setDefaultTemplate();
          break;
        case 'author':
          await setAuthor();
          break;
        case 'license':
          await setLicense();
          break;
        case 'reset':
          await resetConfig();
          break;
      }
    } catch (error) {
      logger.error(
        '配置操作失败:',
        error instanceof Error ? error : String(error)
      );
    }
  });

async function viewConfig(): Promise<void> {
  const config = configManager.getConfig();

  logger.info('\n当前配置:');
  logger.info(`默认模板: ${chalk.cyan(config.defaultTemplate)}`);
  logger.info(`作者: ${chalk.cyan(config.project.author)}`);
  logger.info(`许可证: ${chalk.cyan(config.project.license)}`);
}

async function setDefaultTemplate(): Promise<void> {
  const templates = [
    { name: 'React + TypeScript', value: 'react-ts' },
    { name: 'Vue + TypeScript', value: 'vue-ts' },
    { name: 'Node.js + TypeScript', value: 'node-ts' },
    { name: 'Express + TypeScript', value: 'express-ts' },
    { name: 'Python', value: 'python' },
  ];

  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '选择默认模板:',
      choices: templates,
      default: configManager.getDefaultTemplate(),
    },
  ]);

  configManager.setDefaultTemplate(template);
  logger.success(`默认模板已设置为: ${chalk.cyan(template)}`);
}

async function setAuthor(): Promise<void> {
  const { author } = await inquirer.prompt([
    {
      type: 'input',
      name: 'author',
      message: '输入作者名称:',
      default: configManager.getConfig().project.author,
      validate: (input: string) => {
        if (!input.trim()) {
          return '作者名称不能为空';
        }
        return true;
      },
    },
  ]);

  configManager.setAuthor(author);
  logger.success(`作者已设置为: ${chalk.cyan(author)}`);
}

async function setLicense(): Promise<void> {
  const licenses = [
    'MIT',
    'Apache-2.0',
    'GPL-3.0',
    'BSD-3-Clause',
    'ISC',
    'Unlicense',
  ];

  const { license } = await inquirer.prompt([
    {
      type: 'list',
      name: 'license',
      message: '选择许可证:',
      choices: licenses,
      default: configManager.getConfig().project.license,
    },
  ]);

  configManager.setLicense(license);
  logger.success(`许可证已设置为: ${chalk.cyan(license)}`);
}

async function resetConfig(): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '确定要重置所有配置吗？',
      default: false,
    },
  ]);

  if (confirm) {
    configManager.resetConfig();
    logger.success('配置已重置');
  } else {
    logger.info('操作已取消');
  }
}
