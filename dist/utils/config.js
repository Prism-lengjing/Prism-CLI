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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const DEFAULT_CONFIG = {
    defaultTemplate: 'react-ts',
    project: {
        author: 'Your Name',
        license: 'MIT',
    },
};
class ConfigManager {
    constructor() {
        this.configPath = path.join(os.homedir(), '.prism-cli-config.json');
        this.config = this.loadConfig();
    }
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = fs.readJsonSync(this.configPath);
                return { ...DEFAULT_CONFIG, ...configData };
            }
        }
        catch {
            // 如果读取失败，使用默认配置
        }
        return { ...DEFAULT_CONFIG };
    }
    saveConfig() {
        try {
            fs.ensureFileSync(this.configPath);
            fs.writeJsonSync(this.configPath, this.config, { spaces: 2 });
        }
        catch (error) {
            console.error('保存配置失败:', error);
        }
    }
    getConfig() {
        return { ...this.config };
    }
    getDefaultTemplate() {
        return this.config.defaultTemplate;
    }
    setDefaultTemplate(template) {
        this.config.defaultTemplate = template;
        this.saveConfig();
    }
    setAuthor(author) {
        this.config.project.author = author;
        this.saveConfig();
    }
    setLicense(license) {
        this.config.project.license = license;
        this.saveConfig();
    }
    resetConfig() {
        this.config = { ...DEFAULT_CONFIG };
        this.saveConfig();
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map