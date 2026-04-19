# SolskjaerSYSU Blog

基于 [Astro](https://astro.build) 和 [Fuwari](https://github.com/saicaca/fuwari) 搭建的个人博客，计划部署到 [GitHub Pages](https://pages.github.com/)。

线上地址：

- `https://solskjaersysu.github.io/Blog/`

## 本地开发

项目使用 `pnpm`。

```sh
pnpm install
pnpm dev
```

默认开发地址为 `http://localhost:4321/`。

## 常用命令

```sh
pnpm dev
pnpm build
pnpm preview
pnpm check
pnpm new-post <filename>
```

## 内容维护

- 文章目录：`src/content/posts/`
- 关于页：`src/content/spec/about.md`
- 站点信息：`src/config.ts`
- 部署配置：`.github/workflows/deploy.yml`
- 当前博客正文已经从 `D:\\笔记` 首批迁移完成，后续发布内容以仓库内文章为准，不再直接依赖原笔记目录

文章 Front Matter 示例：

```yaml
---
title: 我的第一篇文章
published: 2026-04-19
description: 一段简短描述
tags: [Astro, Blogging]
category: 建站
draft: false
lang: zh_CN
---
```

## 部署方式

主分支只保存源码，GitHub Actions 会在推送到 `main` 后自动构建并发布到 GitHub Pages。

当前仓库地址：

- `SolskjaerSYSU/Blog`

GitHub Pages 地址为：

- `https://solskjaersysu.github.io/Blog/`
