# SolskjaerSYSU Blog

基于 Hexo 8 + Butterfly 5 的个人博客，部署到 https://solskjaersysu.github.io/Blog/ 。

## 开发与发布
需要 Node.js 22 或更新版本、pnpm 9.14.4。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
pnpm check
pnpm new-post my-new-note
```

本地地址：http://localhost:4000/Blog/ 。`preview` 需要先执行 `build`。
`build` 会准备图片、本地图标与交互库、生成静态网站，再验证链接。
推送 main 后由 GitHub Actions 发布 dist；Pages 的 Source 使用 GitHub Actions。

## 内容维护
- 文章：`source/_posts/`。使用 Hexo 字段 `title/date/tags/categories/description`；草稿放在 `source/_drafts/`，不参与发布。
- 已迁移笔记用 `permalink: posts/cpp/xxx/` 保留旧地址。不要加 /Blog 前缀；Hexo 会自动添加。
- 页面：`source/about/`、`source/essays/`、`source/artworks/`。
- 配置：`_config.yml` 管站点和路径；`_config.butterfly.yml` 管导航、封面、侧栏与交互。
- 原图：`assets/images/`。数字文件名自动进入摄影墙，`draw数字.png` 等进入绘画墙；`DSC_1724.jpg` 同时作为摄影封面和作品。
- 技术笔记插画：`source/images/notes/`，每篇文章各自引用对应的原创 SVG 封面；构建会校验封面文件与文章匹配。
- 生成的图片位于 `source/media/`，不要手工编辑；重新运行 build/dev 更新图片。WebP 编码会移除原始 EXIF，页面不公开原图。
- 封面配置使用 `/media/banner1.webp`；手写原始 HTML 中的站内路径使用 `/Blog/...`。
- 关于页的 GitHub 贡献图由 ghchart 第三方服务提供；其他核心交互资源均在站内托管。
- 摄影原文件编号并不连续；当前实际接入 62 张摄影和 4 张绘画，不生成不存在的占位图。
- 点击左下角动效按钮可关闭飘带、连线和烟花；手机及减少动态效果模式默认不运行画布。

## 验证
`pnpm build` 会验证旧笔记地址、作品完整性、搜索/RSS 和本地链接。
`pnpm test:browser` 会启动临时静态预览并运行浏览器检查，覆盖搜索跳转、摄影和绘画放大、About、明暗主题、键盘操作，以及 8 篇笔记在桌面/平板/手机视口的布局。
Windows 默认使用已安装的 Microsoft Edge；GitHub Actions 安装 Chromium 后执行同一套检查，并在检查通过后才发布。可用 `BROWSER_CHANNEL=chromium` 选择本地 Chromium；设置 `SCREENSHOT_DIR` 可保存首页首屏、文章流和深色 About 截图。
如需检查已有预览，可设置 `TEST_BASE_URL`；`PLAYWRIGHT_MODULE` 可指定已有 Playwright 模块路径。

## 迁移与来源
Astro/Fuwari 已移除；迁移前最后一个版本是 Git 提交 `c53d964`，可从历史取回旧文件。
8 篇文章只转换 Front Matter，正文保持原样。
参考站：https://www.taozhiyy.top/blog/ 。其公开仓库只有生成网页，未找到授权许可证，未复制它的文章、图片、密钥或统计服务。
使用官方 Apache-2.0 授权的 Butterfly，保留页脚主题与框架署名。动态背景为本站独立实现，非逐像素复制。
原 Fuwari 的 MIT 许可证仍保留在 LICENSE，其他依赖许可证见各 npm 包及发布的 vendor 目录。
