import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  defaultTemplate: string;
  project: {
    author: string;
    license: string;
  };
}

const DEFAULT_CONFIG: Config = {
  defaultTemplate: 'react-ts',
  project: {
    author: 'Your Name',
    license: 'MIT',
  },
};

export class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor() {
    this.configPath = path.join(os.homedir(), '.prism-cli-config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readJsonSync(this.configPath);
        return { ...DEFAULT_CONFIG, ...configData };
      }
    } catch {
      // 如果读取失败，使用默认配置
    }

    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(): void {
    try {
      fs.ensureFileSync(this.configPath);
      fs.writeJsonSync(this.configPath, this.config, { spaces: 2 });
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  }

  getConfig(): Config {
    return { ...this.config };
  }

  getDefaultTemplate(): string {
    return this.config.defaultTemplate;
  }

  setDefaultTemplate(template: string): void {
    this.config.defaultTemplate = template;
    this.saveConfig();
  }

  setAuthor(author: string): void {
    this.config.project.author = author;
    this.saveConfig();
  }

  setLicense(license: string): void {
    this.config.project.license = license;
    this.saveConfig();
  }

  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }
}
