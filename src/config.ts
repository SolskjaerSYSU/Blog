import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";

export const siteConfig: SiteConfig = {
	title: "SolskjaerSYSU",
	subtitle: "记录 C++、数据结构与日常学习笔记",
	homeHero: {
		title: "Welcome to SolskjaerHu's Blog",
		subtitle: "Postscriptum ad infinitum",
	},
	lang: "zh_CN",
	themeColor: {
		hue: 210,
		fixed: false,
	},
	banner: {
		enable: true,
		src: "assets/images/banner1.jpg",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		{
			name: "首页",
			url: "/",
		},
		{
			name: "作品",
			url: "/artworks/",
		},
		{
			name: "随笔",
			url: "/#home-posts",
		},
		{
			name: "关于我",
			url: "/about/",
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png",
	name: "SolskjaerSYSU",
	bio: "一个持续整理 C++、数据结构和编程学习笔记的个人博客。",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/SolskjaerSYSU",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
