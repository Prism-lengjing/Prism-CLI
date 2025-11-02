"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
class Logger {
    constructor() {
        this.spinner = null;
    }
    title(message) {
        console.log(chalk_1.default.bold.blue(message));
    }
    info(message) {
        console.log(chalk_1.default.blue('ℹ'), message);
    }
    success(message) {
        console.log(chalk_1.default.green('✓'), message);
    }
    warn(message) {
        console.log(chalk_1.default.yellow('⚠'), message);
    }
    error(message, error) {
        console.log(chalk_1.default.red('✗'), message);
        if (error) {
            console.log(chalk_1.default.red(error));
        }
    }
    startSpinner(message) {
        this.spinner = (0, ora_1.default)(message).start();
    }
    stopSpinner(success = true, message) {
        if (this.spinner) {
            if (success) {
                this.spinner.succeed(message);
            }
            else {
                this.spinner.fail(message);
            }
            this.spinner = null;
        }
    }
    updateSpinner(message) {
        if (this.spinner) {
            this.spinner.text = message;
        }
    }
    log(message) {
        console.log(message);
    }
    newLine() {
        console.log();
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map