---
title: 使用 GitHub Pages 部署 Astro 博客
published: 2026-04-19
description: 记录将 Astro 博客发布到 GitHub Pages 时需要处理的关键配置。
tags: [Astro, GitHub Actions, GitHub Pages]
category: 部署
draft: false
---

把 Astro 博客部署到 GitHub Pages，核心是两件事：

1. 在 `astro.config.mjs` 中设置正确的 `site`
2. 使用 GitHub Actions 构建并发布 `dist` 目录

如果站点部署在 GitHub Pages 的项目仓库下，比如 `/Blog/`，就需要在 `astro.config.mjs` 中显式设置 `base`，否则静态资源和页面链接会指向错误路径。

我在这个站点里选择了源码和构建产物分离的方式：主分支只保留源码，构建后的静态文件由 Actions 发布到 Pages。
