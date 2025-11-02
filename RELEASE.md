# 发布指南

本文档描述了如何发布 Prism CLI 的新版本。

## 准备工作

### 1. 配置 NPM Token

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下密钥：

- `NPM_TOKEN`: 你的 NPM 发布令牌

获取 NPM Token：
```bash
npm login
npm token create --read-only=false
```

### 2. 确保代码质量

发布前确保所有测试通过：
```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

## 发布方式

### 方式一：自动发布（推荐）

1. 更新版本号并创建标签：
```bash
# 更新版本号（patch/minor/major）
npm version patch  # 或 minor, major

# 推送标签到 GitHub
git push origin main --tags
```

2. GitHub Actions 会自动：
   - 运行所有测试
   - 构建项目
   - 发布到 NPM
   - 创建 GitHub Release

### 方式二：手动发布

1. 在 GitHub 仓库的 Actions 页面
2. 选择 "Release" workflow
3. 点击 "Run workflow"
4. 输入要发布的版本号（如 1.0.1）
5. 点击 "Run workflow"

## 发布检查清单

发布前请确认：

- [ ] 所有功能都已测试
- [ ] CHANGELOG.md 已更新
- [ ] 版本号符合语义化版本规范
- [ ] 所有 CI 测试通过
- [ ] 代码已合并到 main 分支
- [ ] NPM_TOKEN 已正确配置

## 发布后验证

发布完成后，验证：

1. 检查 NPM 包是否可用：
```bash
npm view @lengjing-prism/prism-cli
```

2. 测试全局安装：
```bash
npm install -g @lengjing-prism/prism-cli@latest
prism --version
```

3. 测试基本功能：
```bash
mkdir test-install
cd test-install
prism init test-project -t react-ts -p npm -y
```

## 版本号规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **MAJOR**: 不兼容的 API 修改
- **MINOR**: 向下兼容的功能性新增
- **PATCH**: 向下兼容的问题修正

## 回滚

如果发布出现问题，可以：

1. 撤销 NPM 包（24小时内）：
```bash
npm unpublish @lengjing-prism/prism-cli@版本号
```

2. 删除 GitHub Release 和标签：
```bash
git tag -d v版本号
git push origin :refs/tags/v版本号
```

## 故障排除

### NPM 发布失败
- 检查 NPM_TOKEN 是否正确
- 确认包名没有冲突
- 验证版本号是否已存在

### GitHub Actions 失败
- 检查工作流日志
- 确认所有依赖都已安装
- 验证测试是否通过