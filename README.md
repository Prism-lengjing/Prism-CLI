# Prism-CLI

新增特性与改进（本次更新）：

- init 支持 `-i, --install` 自动安装依赖、`-g, --git` 初始化 Git 并提交。
- 模板变量替换新增 `{{author}}` 与 `{{license}}`，来源于用户配置。
- 模板验证加强：按模板校验关键文件（React/Vue/Node/Express/Python）。
- Vue TypeScript 模板新增 `src/vite-env.d.ts`，完整提供 Vite 类型声明。

示例：

```
prism init my-app -t vue-ts -p npm -i -g -y
```

执行后将自动安装依赖并完成 Git 初始化，项目目录下会生成简要的 README。

棱镜团队 CLI（Prism-CLI）是一套提升团队开发效率的命令行工具，聚合了项目初始化、模板管理、代码规范检查（ESLint/Prettier）、Git 工作流辅助、以及全局配置管理等能力。

- 快速初始化：交互式选择模板，一键生成工程骨架
- 统一规范：一站式代码检查与格式化，支持自动修复
- 团队工作流：规范化提交、分支创建与仓库状态查看
- 可扩展模板：支持自定义模板目录与默认模板设置
- 全局配置：在用户目录下集中管理所有配置

---

## 快速开始

- 环境要求：`Node >= 18`，已安装 `pnpm`
- 安装依赖：在项目根目录执行

```bash
pnpm install
```

- 查看帮助与命令总览：

```bash
node dist/index.js --help
```

- 在任意命令前加 `--help` 可查看该命令的详细用法（示例：`node dist/index.js init --help`）。

### 通过 npm 安装（发布后）

```bash
# 全局安装
npm i -g prism-team-cli
# 或使用 pnpm
pnpm add -g prism-team-cli

# 使用
prism --help
```

- 如遇 `prism` 未被识别（Windows），请确保 `npm` 或 `pnpm` 的全局 bin 目录在 `PATH` 中：
  - npm 全局目录：`%APPDATA%\npm`（通常是 `C:\Users\<用户名>\AppData\Roaming\npm`）
  - pnpm 全局目录：`C:\Users\<用户名>\AppData\Local\pnpm\global\<N>\node_modules\.bin`

> 说明：本仓库默认也可通过 `node dist/index.js` 方式运行；开发时可使用 `pnpm link --global` 进行本地全局测试。

---

## 命令总览

- `init` 初始化新项目（支持 `-i/--install`、`-g/--git`）
- `template` 模板管理（`list`/`info`/`validate`）
- `config` 配置管理（查看/设置默认模板/设置作者/设置许可证/重置）

---

## init 初始化项目

- 用法：

```bash
node dist/index.js init [options] [project-name]
```

- 选项：
- `-t, --template <template>` 指定模板（`react-ts`、`vue-ts`、`node-ts`、`express-ts`）
- `-p, --package-manager <manager>` 指定包管理器（`npm`/`pnpm`/`yarn`/`bun`），默认自动检测
- `-y, --yes` 使用默认配置与默认模板
- `-i, --install` 创建后自动安装依赖（前端/Node 模板）
- `-g, --git` 创建后自动 `git init` 并提交首个 commit

- 行为说明：
- 未提供项目名时会交互式询问并校验命名规则（字母、数字、`-`、`_`）
- 未指定模板且未 `--yes` 时，会交互选择模板，默认值取自全局配置
- 会创建工程目录、写入 `package.json`、生成基础文件与模板文件，并生成项目级 README

- 示例：

```bash
# 使用交互式创建
node dist/index.js init

# 指定项目名与模板
node dist/index.js init my-app -t react-ts

# 自动安装依赖并初始化 Git
node dist/index.js init my-app -t vue-ts -i -g

# 使用默认模板直接创建
node dist/index.js init my-app -y
```

---

## lint 代码检查与格式化（规划中）

该命令将在后续版本接入，包含 ESLint/Prettier 的一键检查与修复。

---

## git 工作流辅助（规划中）

该命令将在后续版本接入，包含规范化 `commit/branch/status` 等功能。

---

## template 模板管理

- 子命令：
- `list` 查看可用模板（react-ts/vue-ts/node-ts/express-ts/python）
- `info` 查看指定模板的关键信息（脚本、关键文件）
- `validate` 校验所有模板的关键文件是否齐全

- 示例：

```bash
# 列出模板
node dist/index.js template list

# 查看模板信息（交互选择）
node dist/index.js template info

# 校验模板完整性
node dist/index.js template validate
```

---

## config 配置管理

- 交互操作（进入后选择对应功能）：
- 查看当前配置
- 设置默认模板（react-ts/vue-ts/node-ts/express-ts/python）
- 设置作者信息
- 设置许可证（MIT/Apache-2.0/GPL-3.0/ISC/BSD-3-Clause/Unlicense）
- 重置配置

- 默认配置结构（保存在用户主目录 `~/.prism-cli-config.json`）：

```json
{
  "defaultTemplate": "react-ts",
  "project": {
    "author": "Your Name",
    "license": "MIT"
  }
}
```

---

## 开发指南（贡献）

- 代码位置：`src/`（TypeScript），编译输出：`dist/`
- 本地开发：

```bash
pnpm install
# 按需运行 TypeScript 编译（例如）
# npx tsc -p tsconfig.json
node dist/index.js --help
```

- 代码规范：提交前使用 `node dist/index.js lint --fix` 保持风格统一
- 提交信息：推荐遵循 Conventional Commits

---

## 常见问题（FAQ）

- Q：如何选择包管理器？
- A：未指定 `-p` 时将自动检测（优先 `pnpm`/`yarn`/`bun`，否则回退 `npm`）。

- Q：项目初始化后是否自动安装依赖与初始化 Git？
- A：使用 `-i` 自动安装依赖（前端/Node 模板），使用 `-g` 自动执行 `git init && git add -A && git commit -m "chore: init"`。

- Q：模板关键文件校验失败如何处理？
- A：使用 `node dist/index.js template validate` 查看缺少的文件并补齐。

---

## 许可证

本项目采用 `MIT` 许可证，详见 `LICENSE`（若未提供，请遵循默认 MIT 许可约定）。
