# 青柠平台

> 一个功能齐全的个人游戏官网 —— 主页 + 小游戏 + 实用工具 + 音乐播放器

- 站点地址：[nifun.top](https://nifun.top)
- 仓库地址：https://github.com/longgnc/nifun.top
- 基于 Vue 3 + Vite 构建，支持 Docker 一键部署

## 功能

### 全新个人空间

- 全宽黑白灰界面、独立栏目页、章节导航与底部分页，支持持久化的深浅主题切换
- 首页实时神经网络：空间投影、指针响应、光点传播、点击信号扩散与滚动视差
- 页面使用 Hash 路由，支持浏览器前进后退与子页面直接刷新，无需服务器配置路由重写
- `Ctrl / Cmd + K` 搜索并直接跳转页面、游戏或工具；搜索弹窗支持 Escape 退出
- 25 分钟专注计时器，支持暂停、重置，离开专注页面后继续计时（刷新会重置）
- 26 张本地壁纸漫游，桌面与手机响应式布局
- 可关闭动效，遵循系统减少动态效果设置；神经网络离开视口或切到后台后停止循环，手机限制绘制帧率
- 游戏、工具、音乐等模块按需加载

### 主页

- [x] 轻量入场动画
- [x] 站点简介与独立关于页面
- [x] Hitokoto 一言
- [x] 日期及时间展示
- [x] 实时天气（高德 API，无 Key 时自动切换 open-meteo / wttr.in 免费接口链）
- [x] 时光进度条（今日 / 本周 / 本月 / 今年进度）
- [x] 交互神经网络主视觉 + 独立壁纸漫游页
- [x] 移动端适配 / PWA 支持

### 百宝箱（Box）

| 模块     | 内容                                           |
| -------- | ---------------------------------------------- |
| 小游戏   | 2048、扫雷、贪吃蛇、纸牌、五子棋               |
| 实用工具 | 计算器、单位换算、世界时间、Linux 终端命令速查 |
| 其他     | 论坛、音乐、影视、书籍、网址导航               |

### 音乐播放器

- 本地歌单与 Aplayer 在线播放器整合到音乐工作台；本地音乐由用户主动播放
- 歌单连接异常或本地文件缺失时显示状态提示
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

| 内容             | 位置                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| 网站链接（导航） | `src/assets/siteLinks.json`                                                                              |
| 社交链接         | `src/assets/socialLinks.json`                                                                            |
| 本地歌单         | `src/assets/musicList.json`（修改 `public/Music/` 后运行 `node scripts/generateMusicList.cjs` 重新生成） |
| 网站背景图       | `public/images/background*.jpg`                                                                          |
| 网站图标         | `public/images/icon/`                                                                                    |

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

## 青柠界面与交互验证

主页使用可交互青柠光场；子页面限制内容宽度，游戏和工具不再随屏幕强行拉伸。

- 五款游戏：2048、双人五子棋、贪吃蛇、扫雷、记忆配对。扫雷提供触屏标记模式，贪吃蛇支持暂停。
- 收藏：网址、片单、书架为公开只读展示，支持搜索和查看详情。内容由 src/assets/publicCollections.js 维护，不读取访客 localStorage，不提供新增、编辑、归档或随记入口。它们不是在线媒体播放或电子书资源服务。
- 社区：链接到青柠工作台的 /moments 与 /friends，由工作台负责登录。默认地址为 http://nifun.top:32016，开发和生产环境均使用该地址；可通过 VITE_WORKBENCH_URL 覆盖。
- 关键游戏和计算器回归：node --test tests/interactive-modules.test.cjs。

### 青柠服务友链

入口为 #/services，首页及关于页也提供直达链接。公开服务清单维护在 src/assets/qingningServices.js，包含青柠工作台、云盘、快传、设备互传、备忘与视频。地址经服务器运行服务和域名代理配置核实，仅提供跳转；不收集登录信息，不公开运维面板。
