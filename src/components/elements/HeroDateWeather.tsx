"use client";

import { log } from "node:console";
import { useEffect, useState } from "react";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

const WMO_WEATHER: Record<number, string> = {
  0: "晴れ",
  1: "晴れ",
  2: "くもり時々晴れ",
  3: "くもり",
  45: "霧",
  48: "霧",
  51: "小雨",
  53: "小雨",
  55: "雨",
  56: "凍雨",
  57: "凍雨",
  61: "雨",
  63: "雨",
  65: "大雨",
  66: "凍雨",
  67: "凍雨",
  71: "雪",
  73: "雪",
  75: "大雪",
  77: "霧雪",
  80: "にわか雨",
  81: "にわか雨",
  82: "大雨",
  85: "にわか雪",
  86: "にわか雪",
  95: "雷雨",
  96: "雷雨",
  99: "雷雨",
};

type WeatherData = {
  description: string;
  temperature: number;
};

const NIRASAKI_LAT = 35.7125;
const NIRASAKI_LON = 138.4531;

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_LABELS[date.getDay()];
  return `${y}年${m}月${d}日（${day}）`;
}

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${NIRASAKI_LAT}&longitude=${NIRASAKI_LON}` +
      `&current_weather=true&timezone=Asia%2FTokyo`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const cw = json.current_weather;
    return {
      description: WMO_WEATHER[cw.weathercode] ?? "—",
      temperature: Math.round(cw.temperature),
    };
  } catch {
    return null;
  }
}

export default function HeroDateWeather() {
  //const [dateStr, setDateStr] = useState<string>("");
  const [dateStr] = useState(() => formatDate(new Date()));
  const [weather, setWeather] = useState<WeatherData | null>(null);

  

  useEffect(() => {
    fetchWeather().then(setWeather);
  }, []);

  if (!dateStr) return null;

  console.log(weather);
  

  return (
    <p className="text-base text-[#7A756D]">
      {dateStr}
      {weather && (
        <>
          ｜ {weather.description} {weather.temperature}°C
        </>
      )}
    </p>
  );
}
