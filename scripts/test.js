#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const testDir = path.join(__dirname, '..', 'test-output');

async function runTest() {
  let chalk;
  try {
    chalk = (await import('chalk')).default;
  } catch (error) {
    // Fallback if chalk import fails
    chalk = {
      blue: (text) => `\x1b[34m${text}\x1b[0m`,
      yellow: (text) => `\x1b[33m${text}\x1b[0m`,
      green: (text) => `\x1b[32m${text}\x1b[0m`,
      red: (text) => `\x1b[31m${text}\x1b[0m`
    };
  }

  console.log(chalk.blue('🧪 Running CLI tests...'));

  try {
    // Clean test directory
    if (fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
    fs.ensureDirSync(testDir);

    // Build CLI first
    console.log(chalk.yellow('📦 Building CLI...'));
    execSync('pnpm build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

    const cliPath = path.join(__dirname, '..', 'dist', 'index.js');

    // Test React template
    console.log(chalk.yellow('🧪 Testing React template...'));
    execSync(`node "${cliPath}" init test-react -t react-ts -p npm -y`, {
      stdio: 'inherit',
      cwd: testDir
    });

    const reactDir = path.join(testDir, 'test-react');
    execSync('npm install', { stdio: 'inherit', cwd: reactDir });
    execSync('npm run build', { stdio: 'inherit', cwd: reactDir });

    // Test Vue template
    console.log(chalk.yellow('🧪 Testing Vue template...'));
    execSync(`node "${cliPath}" init test-vue -t vue-ts -p npm -y`, {
      stdio: 'inherit',
      cwd: testDir
    });

    const vueDir = path.join(testDir, 'test-vue');
    execSync('npm install', { stdio: 'inherit', cwd: vueDir });
    execSync('npm run build', { stdio: 'inherit', cwd: vueDir });

    // Test Node.js template
    console.log(chalk.yellow('🧪 Testing Node.js template...'));
    execSync(`node "${cliPath}" init test-node -t node-ts -p npm -y`, {
      stdio: 'inherit',
      cwd: testDir
    });

    const nodeDir = path.join(testDir, 'test-node');
    execSync('npm install', { stdio: 'inherit', cwd: nodeDir });
    execSync('npm run build', { stdio: 'inherit', cwd: nodeDir });

    // Test Express template
    console.log(chalk.yellow('🧪 Testing Express template...'));
    execSync(`node "${cliPath}" init test-express -t express-ts -p npm -y`, {
      stdio: 'inherit',
      cwd: testDir
    });

    const expressDir = path.join(testDir, 'test-express');
    execSync('npm install', { stdio: 'inherit', cwd: expressDir });
    execSync('npm run build', { stdio: 'inherit', cwd: expressDir });

    console.log(chalk.green('✅ All tests passed!'));
  } catch (error) {
    console.error(chalk.red('❌ Tests failed:'), error.message);
    process.exit(1);
  } finally {
    // Clean up
    if (fs.existsSync(testDir)) {
      try {
        fs.removeSync(testDir);
      } catch (err) {
        const msg = err && err.message ? String(err.message) : String(err);
        if (msg.includes('EBUSY')) {
          console.warn(chalk.yellow('⚠️  Cleanup skipped due to EBUSY; temporary files remain.'));
        } else {
          throw err;
        }
      }
    }
  }
}

runTest().catch(console.error);