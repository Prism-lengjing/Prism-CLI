export interface Config {
    defaultTemplate: string;
    project: {
        author: string;
        license: string;
    };
}
export declare class ConfigManager {
    private configPath;
    private config;
    constructor();
    private loadConfig;
    private saveConfig;
    getConfig(): Config;
    getDefaultTemplate(): string;
    setDefaultTemplate(template: string): void;
    setAuthor(author: string): void;
    setLicense(license: string): void;
    resetConfig(): void;
}
//# sourceMappingURL=config.d.ts.map