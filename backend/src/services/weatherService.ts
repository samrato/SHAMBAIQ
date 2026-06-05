import axios from 'axios';
import {
  AdminDashboardData,
  Advisory,
  CurrentWeather,
  DailyForecast,
  Farmer,
  FarmerDashboardData,
  OfficerDashboardData,
  UsageOverview,
  SprayHour,
  TreeScan
} from '../models/types';

const DEFAULT_LANG = "sw"; 
const DEFAULT_UNITS = "metric";

// Global Throttle State
let isAIThrottled = false;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class WeatherAIError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "WeatherAIError";
    this.status = status;
    this.code = code;
  }
}

async function weatherAICall<T = any>(path: string, options: any = {}, retries = 3): Promise<T> {
  const apiKey = process.env.WEATHERAI_API_KEY;
  const baseUrl = process.env.WEATHERAI_BASE_URL;

  if (!apiKey) {
    throw new WeatherAIError(503, "WEATHERAI_NOT_CONFIGURED", "API Key missing. Cannot fetch weather data.");
  }

  const url = new URL(`${baseUrl}${path}`);
  if (!url.searchParams.has('ai')) {
    url.searchParams.set('ai', isAIThrottled ? 'false' : 'true');
  }

  try {
    const response = await axios({
      method: options.method || 'GET',
      url: url.toString(),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...options.headers,
      },
      data: options.body,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    
    // Automatic Retry for 429
    if (status === 429 && retries > 0) {
      const waitTime = (4 - retries) * 2000; 
      console.log(`429 Hit on ${path}. Waiting ${waitTime}ms... (${retries} left)`);
      await sleep(waitTime);
      return weatherAICall(path, options, retries - 1);
    }

    const message = error.response?.data?.message || error.message;
    throw new WeatherAIError(status, `WEATHERAI_${status}`, `WeatherAI API Error: ${message}`);
  }
}

// Data Processors
const processSprayHours = (hourly: any[]) => {
  const hours = hourly || [];
  const goodHours = hours.filter(h => (h.wind_speed || 0) <= 15 && (h.precipitation_probability || 0) <= 10);
  if (goodHours.length === 0) return { window: "No safe window today", hours: [] };
  return {
    window: `Best window: ${new Date(goodHours[0].time).getHours()}:00 - ${new Date(goodHours[goodHours.length - 1].time).getHours()}:00`,
    hours: hours.map(h => ({
      hour: `${new Date(h.time).getHours()}:00`,
      tempC: h.temperature,
      windKmh: h.wind_speed,
      rainMm: h.precipitation_probability || 0,
      good: (h.wind_speed || 0) <= 15 && (h.precipitation_probability || 0) <= 10
    }))
  };
};

const processPlantingCalendar = (daily: any[]) => {
  return (daily || []).map((d: any) => ({
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tempMin: d.temp_min || 0,
    tempMax: d.temp_max || 0,
    rainChance: d.precipitation_probability || 0,
    windKmh: d.wind_max || 0,
    advice: d.precipitation_probability > 60 ? "✓ Good for planting" : d.wind_max > 40 ? "✗ Avoid spraying" : "Field work OK"
  }));
};

export const checkUsageAndThrottle = async () => {
  try {
    const usage = await weatherAICall<any>('/v1/usage');
    if (usage.remaining?.requests < 200 || usage.remaining?.aiRequests < 50) {
      isAIThrottled = true;
    } else {
      isAIThrottled = false;
    }
    return usage;
  } catch (error) {
    isAIThrottled = true;
    throw error;
  }
};

export const getWeather = async (params: { lat: number; lon: number; days?: number; ai?: boolean; units?: string; lang?: string }) => {
  const query = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon), units: params.units || DEFAULT_UNITS, lang: params.lang || DEFAULT_LANG });
  if (params.days) query.set('days', String(params.days));
  if (params.ai !== undefined) query.set('ai', String(params.ai));
  return await weatherAICall<any>(`/v1/weather?${query.toString()}`);
};

export const getCurrent = async (params: { lat: number; lon: number; ai?: boolean; units?: string; lang?: string }) => {
  const query = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon), units: params.units || DEFAULT_UNITS, lang: params.lang || DEFAULT_LANG });
  if (params.ai !== undefined) query.set('ai', String(params.ai));
  return await weatherAICall<any>(`/v1/current?${query.toString()}`);
};

export const getInsights = async (params: { lat: number; lon: number; days?: number; units?: string; lang?: string }) => {
  const query = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon), units: params.units || DEFAULT_UNITS, lang: params.lang || DEFAULT_LANG, ai: 'true' });
  if (params.days) query.set('days', String(params.days));
  return await weatherAICall<any>(`/v1/insights?${query.toString()}`);
};

export const getDaily = async (params: { lat: number; lon: number; days?: number; ai?: boolean; units?: string; lang?: string }) => {
  const query = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon), units: params.units || DEFAULT_UNITS, lang: params.lang || DEFAULT_LANG });
  if (params.days) query.set('days', String(params.days));
  if (params.ai !== undefined) query.set('ai', String(params.ai));
  return await weatherAICall<any>(`/v1/daily?${query.toString()}`);
};

export const getHourly = async (params: { lat: number; lon: number; days?: number; ai?: boolean; units?: string; lang?: string }) => {
  const query = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon), units: params.units || DEFAULT_UNITS, lang: params.lang || DEFAULT_LANG });
  if (params.days) query.set('days', String(params.days));
  if (params.ai !== undefined) query.set('ai', String(params.ai));
  return await weatherAICall<any>(`/v1/hourly?${query.toString()}`);
};

export const getForecast = async (params: { lat: number; lon: number; days?: number; ai?: boolean }) => {
  const query = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon) });
  if (params.days) query.set('days', String(params.days));
  if (params.ai !== undefined) query.set('ai', String(params.ai));
  return await weatherAICall<any>(`/v1/forecast?${query.toString()}`);
};

export const getForecast14 = async (params: { lat: number; lon: number; days?: number; ai?: boolean; units?: string; lang?: string }) => {
  const query = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon), units: params.units || 'metric', lang: params.lang || 'en' });
  if (params.days) query.set('days', String(params.days));
  if (params.ai !== undefined) query.set('ai', String(params.ai));
  return await weatherAICall<any>(`/v1/forecast14?${query.toString()}`);
};

export const getCurrentUSSD = async (lat: number, lon: number) => {
  return await getCurrent({ lat, lon, ai: false });
};

export const resolveLocation = async (name: string) => {
  return await weatherAICall<any>(`/v1/weather-geo?location=${encodeURIComponent(name)}`);
};

export const getWeatherGeo = async (params: { ip?: string; lat?: number; lon?: number; days?: number; ai?: boolean }) => {
  const query = new URLSearchParams();
  if (params.ip) query.set('ip', params.ip);
  if (params.lat !== undefined) query.set('lat', String(params.lat));
  if (params.lon !== undefined) query.set('lon', String(params.lon));
  if (params.days !== undefined) query.set('days', String(params.days));
  if (params.ai !== undefined) query.set('ai', String(params.ai));
  return await weatherAICall<any>(`/v1/weather-geo?${query.toString()}`);
};

export const getIpLookup = async (ip?: string) => {
  const path = ip ? `/v1/ip-lookup?ip=${ip}` : '/v1/ip-lookup';
  return await weatherAICall<any>(path);
};

export const analyzeTrees = async (form: any) => {
  return await weatherAICall<any>('/v1/trees/analyze', { method: 'POST', body: form, headers: form.getHeaders ? form.getHeaders() : { 'Content-Type': 'multipart/form-data' } });
};

export const countTrees = async (form: any) => {
  return await weatherAICall<any>('/v1/forestry/count-trees', { method: 'POST', body: form, headers: form.getHeaders ? form.getHeaders() : { 'Content-Type': 'multipart/form-data' } });
};

export const registerBometFarmer = async (data: { phone: string; name: string; location?: string; cropType?: string }) => {
  return await weatherAICall<any>('/v1/sms/bomet/register', { method: 'POST', body: data });
};

export const sendWeatherAlert = async (data: { to: string; alertType: string; data?: object }) => {
  return await weatherAICall<any>('/v1/sms/alert', { method: 'POST', body: data });
};

export const sendDirectSms = async (data: { to: string; message: string }) => {
  return await weatherAICall<any>('/v1/sms/send', { method: 'POST', body: data });
};

export const getSmsHealth = async () => {
  return await weatherAICall<any>('/v1/sms/health');
};

export const deleteWebhook = async (id: string) => {
  return await weatherAICall<any>(`/v1/webhooks/${id}`, { method: 'DELETE' });
};

export const cancelSubscription = async () => {
  return await weatherAICall<any>('/functions/cancelSubscription', { method: 'POST' });
};

export const contactSales = async (data: any) => {
  return await weatherAICall<any>('/functions/contactSales', { method: 'POST', body: data });
};

export const getPaystackConfig = async () => {
  return await weatherAICall<any>('/functions/getPaystackConfig');
};

export const requestSmsAccess = async (data: any) => {
  return await weatherAICall<any>('/functions/requestSmsAccess', { method: 'POST', body: data });
};

// Global Cache
const dashboardCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export const getFarmerDashboardData = async (farmer: Farmer): Promise<FarmerDashboardData> => {
  const cacheKey = `farmer_${farmer.id}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;

  // Use AI only if NOT throttled
  const weather = await getWeather({ 
    lat: farmer.lat, 
    lon: farmer.lon, 
    days: 7, 
    lang: DEFAULT_LANG, 
    units: DEFAULT_UNITS, 
    ai: !isAIThrottled 
  }).catch(async (err) => {
    // If it still fails with 403/429, try one last time with AI forced OFF
    if (err.status === 403 || err.status === 429) {
      isAIThrottled = true;
      return await getWeather({ 
        lat: farmer.lat, 
        lon: farmer.lon, 
        days: 7, 
        lang: DEFAULT_LANG, 
        units: DEFAULT_UNITS, 
        ai: false 
      });
    }
    throw err;
  });

  await sleep(500);
  const treeHistory = await weatherAICall<any>(`/v1/trees/history?limit=20&farmerId=${farmer.id}`).catch(() => ({ analyses: [] }));
  await sleep(500);
  const treeQuota = await weatherAICall<any>(`/v1/trees/quota`).catch(() => ({ used: 0, limit: 5, resets_at: new Date().toISOString() }));

  const spray = processSprayHours(weather.hourly || []);
  const calendar = processPlantingCalendar(weather.daily || []);
  const treeHistoryData = treeHistory.analyses || [];

  const data: FarmerDashboardData = {
    farmer,
    current: { 
      tempC: weather.current.temperature, 
      humidity: weather.hourly?.[0]?.humidity || 0, 
      windKmh: weather.current.wind_speed, 
      rainStatus: weather.current.condition_code, 
      risk: (weather.current.wind_speed || 0) > 25 ? "moderate" : "low", 
      updatedAt: weather.current.time 
    },
    forecast: calendar as any,
    sprayHours: spray.hours,
    sprayWindowLabel: spray.window,
    advisory: weather.insights || { 
      riskFlags: [], 
      cropRecommendation: "Consult local officer (AI insights currently unavailable)", 
      weatherExplanation: "WeatherAI is running in standard mode.", 
      actions: ["Continue monitoring local conditions"] 
    },
    treeHistory: treeHistoryData,
    latestScan: treeHistoryData[0],
    treeQuota: { ...treeQuota, resetsAt: treeQuota.resets_at || new Date().toISOString() },
    meta: { source: "live", weatherAIConfigured: true, aiThrottle: isAIThrottled, generatedAt: new Date().toISOString(), messages: [] }
  };
  dashboardCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });
  return data;
};

export const getOfficerDashboardData = async (): Promise<OfficerDashboardData> => {
  const cacheKey = 'officer_dashboard';
  const cached = dashboardCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;
  const weather = await getWeather({ lat: -0.7829, lon: 35.3447, days: 14, lang: DEFAULT_LANG, ai: true });
  await sleep(500);
  const treeHistory = await weatherAICall<any>('/v1/trees/history?limit=50').catch(() => ({ analyses: [] }));
  const data: OfficerDashboardData = { farmers: [], counts: { total: 0, high: 0, moderate: 0, low: 0 }, advisory: weather.insights || { riskFlags: [], cropRecommendation: "Check local field reports", weatherExplanation: "Normal conditions", actions: [] }, treeHistory: treeHistory.analyses || [], meta: { source: "live", weatherAIConfigured: true, aiThrottle: isAIThrottled, generatedAt: new Date().toISOString(), messages: [] } };
  dashboardCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });
  return data;
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const cacheKey = 'admin_dashboard';
  const cached = dashboardCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;
  const usageRaw = await checkUsageAndThrottle();
  await sleep(500);
  const webhooks = await weatherAICall<any>('/v1/webhooks').catch(() => ({ data: [] }));
  await sleep(500);
  const smsStats = await weatherAICall<any>('/v1/sms/stats').catch(() => ({ data: { total: 0, deliveryRate: 0, optOutRate: 0, byCounty: [] } }));
  const usage: UsageOverview = { plan: usageRaw.plan, periodStart: usageRaw.period?.start, periodEnd: usageRaw.period?.end, requests: { used: usageRaw.period?.requestCount || 0, limit: usageRaw.limits?.requests || 0, remaining: usageRaw.remaining?.requests || 0, unlimited: false }, aiRequests: { used: usageRaw.period?.aiRequestCount || 0, limit: usageRaw.limits?.aiRequests || 0, remaining: usageRaw.remaining?.aiRequests || 0, unlimited: false }, treeScans: { used: 0, limit: 20, remaining: 20, unlimited: false }, webhooks: { used: 0, limit: usageRaw.limits?.webhooks ? 10 : 0, remaining: usageRaw.limits?.webhooks ? 10 : 0, unlimited: false }, smsEnabled: usageRaw.limits?.sms || false };
  const data: AdminDashboardData = { usage, webhookZones: webhooks.data || [], smsStats: smsStats.data || { total: 0, deliveryRate: 0, optOutRate: 0, byCounty: [] }, throttle: isAIThrottled, meta: { source: "live", weatherAIConfigured: true, aiThrottle: isAIThrottled, generatedAt: new Date().toISOString(), messages: [] } };
  dashboardCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });
  return data;
};
