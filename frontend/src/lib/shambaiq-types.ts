export type RiskLevel = "low" | "moderate" | "high";

export type DataSource = "live" | "fallback";

export type BackendMeta = {
  source: DataSource;
  weatherAIConfigured: boolean;
  aiThrottle: boolean;
  generatedAt: string;
  messages: string[];
};

export type CurrentWeather = {
  tempC: number;
  humidity: number;
  windKmh: number;
  rainStatus: string;
  risk: RiskLevel;
  updatedAt: string;
};

export type DailyForecast = {
  day: string;
  date: string;
  tempMin: number;
  tempMax: number;
  rainChance: number;
  windKmh: number;
  advice: string;
};

export type SprayHour = {
  hour: string;
  tempC: number;
  windKmh: number;
  rainMm: number;
  good: boolean;
};

export type TreeScan = {
  id: string;
  date: string;
  trees: number;
  canopyPct: number;
  healthy: number;
  needCare: number;
  needReplace: number;
};

export type Farmer = {
  id: string;
  name: string;
  county: string;
  ward: string;
  location: string;
  acres: number;
  crop: string;
  risk: RiskLevel;
  phone: string;
  lat: number;
  lon: number;
  timezone: string;
};

export type Advisory = {
  riskFlags: string[];
  cropRecommendation: string;
  weatherExplanation: string;
  actions: string[];
};

export type QuotaMetric = {
  used: number;
  limit: number;
  remaining: number;
  unlimited?: boolean;
};

export type UsageOverview = {
  plan: string;
  periodStart?: string;
  periodEnd: string;
  requests: QuotaMetric;
  aiRequests: QuotaMetric;
  treeScans: QuotaMetric;
  webhooks: QuotaMetric;
  smsEnabled: boolean;
};

export type TreeQuota = {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  resetsAt: string;
};

export type WebhookZone = {
  id?: string;
  zone: string;
  farmers: number;
  triggers: string[];
  active: boolean;
  lat?: number;
  lon?: number;
  timezone?: string;
};

export type SmsStats = {
  total: number;
  deliveryRate: number;
  optOutRate: number;
  byCounty: Array<{ county: string; sent: number }>;
};

export type FarmerDashboardData = {
  farmer: Farmer;
  current: CurrentWeather;
  forecast: DailyForecast[];
  sprayHours: SprayHour[];
  sprayWindowLabel: string;
  advisory: Advisory;
  treeHistory: TreeScan[];
  latestScan: TreeScan;
  treeQuota: TreeQuota;
  meta: BackendMeta;
};

export type OfficerDashboardData = {
  farmers: Farmer[];
  counts: {
    total: number;
    high: number;
    moderate: number;
    low: number;
  };
  advisory: Advisory;
  treeHistory: TreeScan[];
  meta: BackendMeta;
};

export type AdminDashboardData = {
  usage: UsageOverview;
  webhookZones: WebhookZone[];
  smsStats: SmsStats;
  throttle: boolean;
  meta: BackendMeta;
};
