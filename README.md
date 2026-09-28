# 青柠平台

> 一个功能齐全的个人游戏官网 —— 主页 + 小游戏 + 实用工具 + 音乐播放器

- 站点地址：[nifun.top](https://nifun.top)
- 仓库地址：https://github.com/longgnc/nifun.top
- 基于 Vue 3 + Vite 构建，支持 Docker 一键部署

## 功能

### 主页

- [x] 载入动画
- [x] 站点简介（点击可触发隐藏彩蛋）
- [x] Hitokoto 一言
- [x] 日期及时间展示
- [x] 实时天气（高德 API，无 Key 时自动切换 open-meteo / wttr.in 免费接口链）
- [x] 时光进度条（今日 / 本周 / 本月 / 今年进度）
- [x] 随机背景图 + 粒子特效
- [x] 移动端适配 / PWA 支持

### 百宝箱（Box）

| 模块 | 内容 |
| --- | --- |
| 小游戏 | 2048、扫雷、贪吃蛇、纸牌、五子棋 |
| 实用工具 | 计算器、单位换算、世界时间、Linux 终端命令速查 |
| 其他 | 论坛、音乐、影视、书籍、网址导航 |

### 音乐播放器

- 基于 Aplayer 的悬浮播放器
- 支持本地歌单（`src/assets/musicList.json`，可用脚本生成）与 Meting API 在线歌单两种方式

## 快速开始

> 环境要求：Node.js > 16.16.0

```bash
# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 本地预览
pnpm dev

# 构建（产物在 dist 目录）
pnpm build
```

## 配置

复制 `.env.example` 为 `.env`，按需修改：

```bash
# 站点信息
VITE_SITE_NAME = "青柠平台"        # 站点名称
VITE_SITE_AUTHOR = "青柠"          # 作者
VITE_SITE_URL = "nifun.top"        # 站点地址

# 天气 Key（高德开放平台 Web 服务 Key，留空则使用免费备用接口）
VITE_WEATHER_KEY = ""

# 建站日期（用于时光胶囊，YYYY-MM-DD，留空关闭）
VITE_SITE_START = "2020-10-24"

# ICP 备案号（留空不显示）
VITE_SITE_ICP = ""

# 在线歌单（Meting API）
VITE_SONG_API = "https://api.wuenci.com/meting/api/"
VITE_SONG_SERVER = "netease"       # netease-网易云 / tencent-QQ音乐
VITE_SONG_TYPE = "playlist"
VITE_SONG_ID = "9379831714"        # 留空则关闭在线歌单
```

### 自定义内容

| 内容 | 位置 |
| --- | --- |
| 网站链接（导航） | `src/assets/siteLinks.json` |
| 社交链接 | `src/assets/socialLinks.json` |
| 本地歌单 | `src/assets/musicList.json`（修改 `public/Music/` 后运行 `node scripts/generateMusicList.cjs` 重新生成） |
| 网站背景图 | `public/images/background*.jpg` |
| 网站图标 | `public/images/icon/` |

> 注：`public/Music/` 目录与 `*.mp3` 已被 `.gitignore` 排除，音乐文件不会进入 git 仓库。

## Docker 部署

```bash
# 方式一：Docker
docker build -t nifun-top .
docker run -p 12445:12445 -d nifun-top

# 方式二：docker-compose
docker-compose up -d
```

构建完成后访问 `http://localhost:12445` 即可。也可将 `dist` 目录上传至任意静态服务器，或使用 Vercel 等平台一键部署。

## 技术栈

- [Vue 3](https://cn.vuejs.org/) + [Vite](https://vitejs.cn/) + [Pinia](https://pinia.vuejs.org/zh/)
- [Element Plus](https://element-plus.org/) / [IconPark](https://iconpark.oceanengine.com/) / [xicons](https://xicons.org/)
- [Aplayer](https://aplayer.js.org/) / [Swiper](https://swiperjs.com/) / [tsParticles](https://particles.js.org/)
- [dayjs](https://day.js.org/) / [axios](https://axios-http.com/) / [lodash-es](https://lodash.com/)

## API

- [高德开放平台](https://lbs.amap.com/)（天气，可选）
- [open-meteo](https://open-meteo.com/) / [wttr.in](https://wttr.in/)（免费备用天气）
- [Hitokoto 一言](https://hitokoto.cn/)
- [Meting API](https://github.com/xizeyoupan/Meting-API)（在线歌单）

## 说明

本项目最初基于 [imsyy/home](https://github.com/imsyy/home) 二次开发，已在原基础上做了大量功能扩展与改造（小游戏、工具箱、免费天气接口链、本地歌单等）。
