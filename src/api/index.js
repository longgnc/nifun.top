// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
    { signal: AbortSignal.timeout(12000) },
  );
  const data = await res.json();

  if (!Array.isArray(data) || !data.length || !data[0]?.url) throw new Error("歌单暂不可用");
  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn", { signal: AbortSignal.timeout(8000) });
  return await res.json();
};

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取备用天气（免费接口链，无需 Key）
// 方案一：ipwho.is（IP 定位 + 经纬度）→ open-meteo（天气）→ open-meteo 地理编码（中文城市名）
// 方案二：wttr.in（一步获取，英文地名兜底）
export const getOtherWeather = async () => {
  try {
    return await getWeatherByOpenMeteo();
  } catch (err) {
    console.warn("open-meteo 天气获取失败，尝试 wttr.in：", err);
    return await getWeatherByWttr();
  }
};

// open-meteo 方案（中文）
const getWeatherByOpenMeteo = async () => {
  // 1. IP 定位（含经纬度）
  const geoRes = await fetch("https://ipwho.is/");
  const geo = await geoRes.json();
  if (!geo.success) throw new Error("IP 定位失败");

  // 2. 天气数据
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}` +
      `&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`,
  );
  const weather = await weatherRes.json();
  if (!weather.current) throw new Error("天气数据异常");

  // 3. 中文城市名（失败则用英文名，不阻塞）
  let city = geo.city || "未知地区";
  try {
    const nameRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`,
    );
    const nameData = await nameRes.json();
    if (nameData.results?.[0]?.name) {
      city = nameData.results[0].name;
    }
  } catch (err) {
    console.warn("中文城市名获取失败：", err);
  }

  return {
    city,
    weather: wmoCodeToText(weather.current.weather_code),
    temperature: Math.round(weather.current.temperature_2m),
    winddirection: windDegToText(weather.current.wind_direction_10m),
    windpower: kmhToBeaufort(weather.current.wind_speed_10m),
  };
};

// wttr.in 方案（兜底）
const getWeatherByWttr = async () => {
  const res = await fetch("https://wttr.in/?format=j1");
  const data = await res.json();
  const cur = data.current_condition?.[0];
  const area = data.nearest_area?.[0];
  if (!cur) throw new Error("wttr.in 数据异常");
  return {
    city: area?.areaName?.[0]?.value || "未知地区",
    weather: enWeatherToText(cur.weatherDesc?.[0]?.value?.trim()),
    temperature: Number(cur.temp_C),
    winddirection: windEnToText(cur.winddir16Point),
    windpower: kmhToBeaufort(Number(cur.windspeedKmph)),
  };
};

// WMO 天气代码 → 中文
const wmoCodeToText = (code) => {
  const map = {
    0: "晴",
    1: "晴间多云",
    2: "多云",
    3: "阴",
    45: "雾",
    48: "冻雾",
    51: "小毛毛雨",
    53: "毛毛雨",
    55: "大毛毛雨",
    56: "冻毛毛雨",
    57: "强冻毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    66: "冻雨",
    67: "强冻雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    77: "雪粒",
    80: "小阵雨",
    81: "阵雨",
    82: "强阵雨",
    85: "小阵雪",
    86: "大阵雪",
    95: "雷阵雨",
    96: "雷阵雨伴冰雹",
    99: "强雷阵雨伴冰雹",
  };
  return map[code] || "未知";
};

// 英文天气描述 → 中文（wttr.in 兜底用）
const enWeatherToText = (en) => {
  if (!en) return "未知";
  const key = en.toLowerCase();
  const map = [
    [["sunny", "clear"], "晴"],
    [["partly cloudy"], "多云"],
    [["cloudy", "overcast"], "阴"],
    [["mist", "fog", "haze"], "雾"],
    [["thunder"], "雷阵雨"],
    [["snow"], "雪"],
    [["sleet"], "雨夹雪"],
    [["drizzle"], "毛毛雨"],
    [["shower"], "阵雨"],
    [["rain"], "雨"],
  ];
  for (const [keys, text] of map) {
    if (keys.some((k) => key.includes(k))) return text;
  }
  return en;
};

// 风向角度 → 中文方位
const windDegToText = (deg) => {
  const dirs = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  return dirs[Math.round(deg / 45) % 8];
};

// 英文风向缩写 → 中文方位（wttr.in 兜底用）
const windEnToText = (en) => {
  const map = {
    N: "北",
    NNE: "东北",
    NE: "东北",
    ENE: "东",
    E: "东",
    ESE: "东南",
    SE: "东南",
    SSE: "南",
    S: "南",
    SSW: "西南",
    SW: "西南",
    WSW: "西",
    W: "西",
    WNW: "西北",
    NW: "西北",
    NNW: "北",
  };
  return map[en] || "无持续";
};

// 风速 km/h → 蒲福风力等级
const kmhToBeaufort = (kmh) => {
  const levels = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  for (let i = 0; i < levels.length; i++) {
    if (kmh < levels[i]) return i;
  }
  return 12;
};
