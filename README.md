# 英语学习工具网站

一个现代化的英语词句查询与谐音辅助学习平台，帮助用户快速查询英语翻译、音标和谐音记忆。

## 🚀 功能特性

### 用户功能
- **词句查询**：实时查询英语词汇，展示中文译文、国际音标、音节划分
- **谐音记忆**：查看人工审核的谐音记忆，帮助快速记忆
- **提交谐音**：用户可为词条提交谐音建议，经审核后展示
- **分类学习**：按三级分类体系浏览词库，查看各类别高频词
- **查询历史**：自动保存查询记录，支持回顾和管理

### 管理功能
- **词库管理**：添加、编辑、删除词条，批量导入支持
- **谐音审核**：多人审核机制，至少2名审核员通过
- **分类管理**：三级分类体系管理
- **用户管理**：用户列表、角色权限控制
- **数据统计**：热词榜单、分类热度、用户活跃度分析

## 🛠️ 技术栈

### 前端
- **React 19** - UI框架
- **TypeScript** - 类型安全
- **TailwindCSS 4** - 样式方案
- **tRPC** - 类型安全的API调用
- **Wouter** - 轻量级路由
- **shadcn/ui** - UI组件库

### 后端
- **Node.js + Express** - 服务端框架
- **tRPC 11** - 端到端类型安全
- **Drizzle ORM** - 数据库ORM
- **MySQL/TiDB** - 数据库
- **Manus OAuth** - 用户认证

## 📁 项目结构

```
english_learning_tool/
├── client/                 # 前端代码
│   ├── public/            # 静态资源
│   └── src/
│       ├── components/    # 可复用组件
│       │   ├── ui/       # shadcn/ui组件
│       │   ├── Sidebar.tsx
│       │   ├── EmptyState.tsx
│       │   └── LoadingState.tsx
│       ├── pages/         # 页面组件
│       │   ├── Home.tsx
│       │   ├── Categories.tsx
│       │   ├── History.tsx
│       │   └── admin/     # 管理后台页面
│       ├── contexts/      # React上下文
│       ├── hooks/         # 自定义Hooks
│       ├── lib/           # 工具函数
│       ├── App.tsx        # 路由配置
│       ├── main.tsx       # 入口文件
│       └── index.css      # 全局样式
├── server/                # 后端代码
│   ├── _core/            # 核心框架代码
│   ├── db.ts             # 数据库查询辅助
│   ├── routers.ts        # tRPC路由定义
│   └── *.test.ts         # 单元测试
├── drizzle/              # 数据库相关
│   └── schema.ts         # 数据库表结构
├── shared/               # 前后端共享代码
├── scripts/              # 脚本文件
│   └── seed-data.mjs     # 初始化数据
└── todo.md               # 任务清单
```

## 🎨 设计规范

### 颜色系统
- **主色调**：蓝色 (oklch(0.6 0.2 250)) - 教育品牌色
- **背景色**：深黑 (oklch(0.08 0 0))
- **卡片色**：浅黑 (oklch(0.13 0 0))
- **边框色**：灰色 (oklch(0.27 0 0))

### 间距系统
- 使用 Tailwind 标准间距 (4px基准)
- 组件间距：8px、12px、16px、24px
- 页面边距：移动端16px、平板24px、桌面32px

### 圆角系统
- 基础圆角：12px (--radius: 0.75rem)
- 小圆角：8px
- 大圆角：16px
- 超大圆角：20px

## 🚦 开发指南

### 环境要求
- Node.js 22+
- pnpm 10+
- MySQL 8+ 或 TiDB

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 数据库迁移
```bash
pnpm db:push
```

### 运行测试
```bash
pnpm test
```

### 构建生产版本
```bash
pnpm build
pnpm start
```

## 📝 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 使用 tRPC 进行API调用，避免手动fetch
- 使用 shadcn/ui 组件保持UI一致性

### 命名规范
- 组件：PascalCase (例如：`HomePage.tsx`)
- 函数/变量：camelCase (例如：`getUserData`)
- 常量：UPPER_SNAKE_CASE (例如：`API_BASE_URL`)
- CSS类：kebab-case (例如：`user-profile`)

### Git提交规范
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 🔐 权限说明

### 角色类型
- **普通用户**：查询词条、查看历史、提交谐音
- **审核员**：普通用户权限 + 审核谐音
- **管理员**：所有权限 + 词库管理 + 用户管理

### 访问控制
- 用户前端：所有人可访问 (`/`, `/categories`, `/history`)
- 管理后台：仅管理员可访问 (`/admin/*`)
- 管理员通过直接访问 `/admin` 网址进入后台

## 📊 数据库设计

### 核心表
- `users` - 用户表
- `english_entry` - 词库表
- `homophone` - 谐音表
- `category` - 分类表
- `query_history` - 查询历史表
- `audit_record` - 审核记录表
- `auditor` - 审核员表

详见 `drizzle/schema.ts`

## 🎯 性能优化

- ✅ 使用 tRPC 减少网络请求
- ✅ 组件懒加载
- ✅ 数据库索引优化
- ✅ 图片优化和CDN
- ⏳ Redis缓存高频词库 (待实现)
- ⏳ 防刷限流机制 (待实现)

## 📄 License

MIT

## 👥 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📮 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者
