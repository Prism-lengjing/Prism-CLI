export declare class Logger {
    private spinner;
    title(message: string): void;
    info(message: string): void;
    success(message: string): void;
    warn(message: string): void;
    error(message: string, error?: Error | string): void;
    startSpinner(message: string): void;
    stopSpinner(success?: boolean, message?: string): void;
    updateSpinner(message: string): void;
    log(message: string): void;
    newLine(): void;
}
//# sourceMappingURL=logger.d.ts.map