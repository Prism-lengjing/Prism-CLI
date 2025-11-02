# Prism-CLI

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

- `init` 初始化新项目
- `lint` 代码规范检查与格式化
- `git` Git 工作流辅助（`commit`/`branch`/`status`）
- `template` 模板管理（`list`/`create`/`delete`/`info`/`set-default`）
- `config` 配置管理（`list`/`set`/`reset`/`template-path`）

---

## init 初始化项目

- 用法：

```bash
node dist/index.js init [options] [project-name]
```

- 选项：
- `-t, --template <template>` 指定模板（`react-ts`、`vue-ts`、`node-ts`、`express-ts`）
- `-y, --yes` 使用默认配置与默认模板

- 行为说明：
- 未提供项目名时会交互式询问并校验命名规则（字母、数字、`-`、`_`）
- 未指定模板且未 `--yes` 时，会交互选择模板，默认值取自全局配置
- 会创建工程目录、写入 `package.json`、生成基础文件与模板文件

- 示例：

```bash
# 使用交互式创建
node dist/index.js init

# 指定项目名与模板
node dist/index.js init my-app -t react-ts

# 使用默认模板直接创建
node dist/index.js init my-app -y
```

---

## lint 代码检查与格式化

- 用法：

```bash
node dist/index.js lint [options]
```

- 选项：
- `-f, --fix` 自动修复问题/格式
- `-p, --path <path>` 指定检查路径（默认 `.`）
- `--eslint-only` 仅运行 ESLint
- `--prettier-only` 仅运行 Prettier

- 行为说明：
- 会检测是否存在 ESLint/Prettier 配置文件，若缺失将提示是否创建默认配置
- 默认 ESLint 规则包含 `@typescript-eslint` 推荐规则；Prettier 使用常见风格设定

- 示例：

```bash
# 检查当前目录并输出问题
node dist/index.js lint

# 自动修复并格式化
node dist/index.js lint --fix

# 仅运行 ESLint
node dist/index.js lint --eslint-only

# 指定子目录
node dist/index.js lint -p src
```

---

## git 工作流辅助

- 子命令：

### commit 规范化提交

- 选项：
- `-m, --message <message>` 提交信息
- `-a, --add-all` 提交前添加所有更改

- 行为：非 `-m` 情况下进入交互模式，支持类型选择（`feat`/`fix`/`docs`/`style`/`refactor`/`perf`/`test`/`build`/`ci`/`chore`），可选 `scope`、`subject`、`body`、`breaking` 和 `issues`

- 示例：

```bash
# 交互式提交
node dist/index.js git commit

# 快速提交所有更改
node dist/index.js git commit -a -m "feat: 添加用户中心"
```

### branch 创建规范分支

- 参数：`<branch-name>` 分支名
- 选项：
- `-t, --type <type>` 分支类型（默认 `feature`）
- `-b, --base <base>` 基础分支（默认 `main`）

- 示例：

```bash
node dist/index.js git branch user-auth -t feature -b main
```

### status 查看仓库状态

```bash
node dist/index.js git status
```

- 输出：当前分支、工作区文件变更摘要与最近 5 次提交

---

## template 模板管理

- 子命令：
- `list` 列出可用模板，并标注默认模板
- `create <name>` 创建新模板（`-d, --description` 模板描述）
- `delete <name>` 删除模板（交互确认）
- `info <name>` 查看模板配置与文件统计
- `set-default <name>` 设置默认模板

- 示例：

```bash
# 列出模板
node dist/index.js template list

# 创建模板
node dist/index.js template create admin -d "管理后台通用模板"

# 查看模板信息
node dist/index.js template info admin

# 设置默认模板
node dist/index.js template set-default admin
```

- 模板目录：默认存放于 `~/.prism/templates`（由全局配置管理）
- 每个模板包含 `template.json` 与模板文件夹，`template.json` 示例：

```json
{
  "name": "admin",
  "description": "管理后台通用模板",
  "version": "1.0.0",
  "created": "2025-01-01T00:00:00.000Z",
  "files": []
}
```

---

## config 配置管理

- 子命令：
- `list` 显示当前配置
- `set` 交互式设置配置项
- `reset` 重置为默认配置（交互确认）
- `template-path [path]` 设置或查看模板根路径

- 默认配置结构（保存在 `~/.prism/config.json`）：

```json
{
  "version": "1.0.0",
  "templatesPath": "~/.prism/templates",
  "defaultTemplate": "react-ts",
  "git": {
    "commitConvention": "conventional",
    "branchPrefix": "feature"
  },
  "lint": {
    "eslintConfig": "standard",
    "prettierConfig": "default",
    "autoFix": true
  },
  "project": {
    "author": "棱镜Prism",
    "license": "MIT",
    "repository": ""
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
- 提交信息：推荐遵循 Conventional Commits（可使用交互式 `git commit` 子命令）

---

## 常见问题（FAQ）

- Q：运行 `git` 子命令提示“当前目录不是 Git 仓库”？
- A：先执行 `git init` 初始化仓库。

- Q：`lint` 提示未找到配置文件？
- A：将进入交互提示是否创建默认配置，选择“是”即可继续。

- Q：模板路径在哪里？
- A：默认在 `~/.prism/templates`，可用 `node dist/index.js config template-path` 查看或设置。

- Q：如何使用 `pnpm` 管理依赖？
- A：使用 `pnpm add <pkg>` / `pnpm remove <pkg>`，并保持 `pnpm-lock.yaml` 一致。

---

## 许可证

本项目采用 `MIT` 许可证，详见 `LICENSE`（若未提供，请遵循默认 MIT 许可约定）。