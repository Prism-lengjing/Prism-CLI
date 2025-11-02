import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private spinner: Ora | null = null;

  title(message: string): void {
    console.log(chalk.bold.blue(message));
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string, error?: Error | string): void {
    console.log(chalk.red('✗'), message);
    if (error) {
      console.log(chalk.red(error));
    }
  }

  startSpinner(message: string): void {
    this.spinner = ora(message).start();
  }

  stopSpinner(success: boolean = true, message?: string): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(message);
      } else {
        this.spinner.fail(message);
      }
      this.spinner = null;
    }
  }

  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  log(message: string): void {
    console.log(message);
  }

  newLine(): void {
    console.log();
  }
}
