# 链家风控稽查规则引擎 Demo

## 项目简介

这是一个静态展示版本的风控稽查规则引擎 Demo，可部署到 GitHub Pages。

## 功能特性

- 📊 预警记录展示（高危/需关注）
- 🏢 门店风险概览
- 🔍 多维度筛选（大类/风险程度）
- 📱 响应式设计

## 本地预览

直接用浏览器打开 `index.html` 文件即可预览。

## 部署到 GitHub Pages

### 方式一：手动上传

1. 在 GitHub 创建新仓库（如 `lianjia-risk-demo`）
2. 上传以下文件/文件夹：
   - `index.html`
   - `css/` 文件夹
   - `js/` 文件夹
   - `data/` 文件夹
3. 进入仓库 Settings → Pages
4. Source 选择 `Deploy from a branch`
5. Branch 选择 `main`，目录选择 `/ (root)`
6. 点击 Save，等待部署完成
7. 访问地址：`https://你的用户名.github.io/lianjia-risk-demo/`

### 方式二：Git 命令行

```bash
# 进入项目目录
cd /home/jr12138/lianjia-risk-demo-ghpages

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/lianjia-risk-demo.git

# 推送
git push -u origin main
```

然后在 GitHub 仓库设置中启用 Pages。

## 文件结构

```
lianjia-risk-demo-ghpages/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── app.js          # JavaScript 逻辑
├── data/
│   ├── alerts.json     # 预警记录数据
│   ├── rules.json      # 规则配置数据
│   └── store_risks.json # 门店风险汇总
└── README.md           # 说明文档
```

## 技术栈

- HTML5 + CSS3 + JavaScript
- Bootstrap 5
- 静态 JSON 数据

## 规则说明

| 大类 | 规则名称 | 风险等级 |
|------|----------|----------|
| 飞单风险 | 客户存在明显交易意向但房源最终外部成交 | 高危/需关注 |
| 飞单风险 | 下架房源下架前30天内多次带看无平台交易 | 高危/需关注 |
| 飞单风险 | 工作手机聊天记录命中高危敏感词 | 高危 |
| 虚假带看/虚假报备风险 | GPS轨迹偏离带看区域 | 需关注 |
| 虚假带看/虚假报备风险 | 同房源在同一天被多个经纪人带看 | 需关注 |

---

*Demo 版本 - 仅供展示*
