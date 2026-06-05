import { Request, Response } from 'express';
import * as weatherService from '../services/weatherService';
import User, { UserRole } from '../models/User';
import { Farmer } from '../models/types';

const queryString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return queryString(value[0]);
  }
  return typeof value === 'string' ? value : undefined;
};

export const getFarmerDashboard = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user || user.role !== UserRole.FARMER) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmer: Farmer = {
      id: user.profileData?.farmerId || user._id.toString(),
      name: user.profileData?.name || user.username,
      county: user.profileData?.county || 'Unknown',
      ward: user.profileData?.ward || 'Unknown',
      location: user.profileData?.location || 'Unknown',
      acres: user.profileData?.acres || 0,
      crop: user.profileData?.crop || 'Unknown',
      risk: 'low', 
      phone: user.profileData?.phone || '',
      lat: user.profileData?.lat || -1.2921, 
      lon: user.profileData?.lon || 36.8219,
      timezone: user.profileData?.timezone || 'Africa/Nairobi',
    };

    const data = await weatherService.getFarmerDashboardData(farmer);
    res.json(data);
  } catch (error) {
    console.error('Error fetching farmer dashboard data:', error);
    res.status(500).json({ message: 'Error fetching farmer dashboard data' });
  }
};

export const getOfficerDashboard = async (req: Request, res: Response) => {
  try {
    const farmersFromDb = await User.find({ role: UserRole.FARMER });
    const farmers: Farmer[] = farmersFromDb.map(f => ({
      id: f.profileData?.farmerId || f._id.toString(),
      name: f.profileData?.name || f.username,
      county: f.profileData?.county || 'Unknown',
      ward: f.profileData?.ward || 'Unknown',
      location: f.profileData?.location || 'Unknown',
      acres: f.profileData?.acres || 0,
      crop: f.profileData?.crop || 'Unknown',
      risk: 'low',
      phone: f.profileData?.phone || '',
      lat: f.profileData?.lat || -1.2921,
      lon: f.profileData?.lon || 36.8219,
      timezone: f.profileData?.timezone || 'Africa/Nairobi',
    }));

    const data = await weatherService.getOfficerDashboardData();
    data.farmers = farmers;
    data.counts = {
      total: farmers.length,
      high: farmers.filter(f => f.risk === 'high').length,
      moderate: farmers.filter(f => f.risk === 'moderate').length,
      low: farmers.filter(f => f.risk === 'low').length,
    };
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching officer dashboard data:', error);
    res.status(500).json({ message: 'Error fetching officer dashboard data' });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const data = await weatherService.getAdminDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ message: 'Error fetching admin dashboard data' });
  }
};

export const resolveLocation = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: 'Location name is required' });
    const data = await weatherService.resolveLocation(String(name));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving location' });
  }
};

export const getWeatherGeo = async (req: Request, res: Response) => {
  try {
    const ip = queryString(req.query.ip);
    const lat = queryString(req.query.lat);
    const lon = queryString(req.query.lon);
    const days = queryString(req.query.days);
    const ai = queryString(req.query.ai);

    if (!ip && (!lat || !lon)) {
      return res.status(400).json({ message: 'ip or lat and lon are required' });
    }

    const data = await weatherService.getWeatherGeo({
      ip,
      lat: lat ? Number(lat) : undefined,
      lon: lon ? Number(lon) : undefined,
      days: days ? Number(days) : undefined,
      ai: ai === undefined ? undefined : ai === 'true',
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather geo:', error);
    res.status(500).json({ message: 'Error fetching weather geo' });
  }
};

export const getUSSDSnapshot = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'GPS coordinates required' });
    const data = await weatherService.getCurrentUSSD(Number(lat), Number(lon));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching USSD snapshot' });
  }
};

export const analyzeTrees = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    
    Object.keys(req.body).forEach(key => {
      form.append(key, req.body[key]);
    });

    const data = await weatherService.analyzeTrees(form);
    res.json(data);
  } catch (error) {
    console.error('Error analyzing trees:', error);
    res.status(500).json({ message: 'Error analyzing trees' });
  }
};

export const registerBometFarmer = async (req: Request, res: Response) => {
  try {
    const { phone, name, location, cropType } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ message: 'Phone and Name are required' });
    }
    const data = await weatherService.registerBometFarmer({ phone, name, location, cropType });
    res.json(data);
  } catch (error) {
    console.error('Error registering Bomet farmer:', error);
    res.status(500).json({ message: 'Error registering Bomet farmer' });
  }
};

export const sendWeatherAlert = async (req: Request, res: Response) => {
  try {
    const { to, alertType, data } = req.body;
    if (!to || !alertType) {
      return res.status(400).json({ message: 'Recipient (to) and alertType are required' });
    }
    const result = await weatherService.sendWeatherAlert({ to, alertType, data });
    res.json(result);
  } catch (error) {
    console.error('Error sending weather alert:', error);
    res.status(500).json({ message: 'Error sending weather alert' });
  }
};

export const sendDirectSms = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ message: 'Recipient (to) and message are required' });
    }
    const result = await weatherService.sendDirectSms({ to, message });
    res.json(result);
  } catch (error) {
    console.error('Error sending direct SMS:', error);
    res.status(500).json({ message: 'Error sending direct SMS' });
  }
};

export const getSmsHealth = async (req: Request, res: Response) => {
  try {
    const result = await weatherService.getSmsHealth();
    res.json(result);
  } catch (error) {
    console.error('Error fetching SMS health:', error);
    res.status(500).json({ message: 'Error fetching SMS health' });
  }
};

export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Webhook ID is required' });
    }
    const result = await weatherService.deleteWebhook(String(id));
    res.json(result);
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ message: 'Error deleting webhook' });
  }
};

export const getIpLookup = async (req: Request, res: Response) => {
  try {
    const { ip } = req.query;
    const result = await weatherService.getIpLookup(ip as string);
    res.json(result);
  } catch (error) {
    console.error('Error performing IP lookup:', error);
    res.status(500).json({ message: 'Error performing IP lookup' });
  }
};

export const getForecast = async (req: Request, res: Response) => {
  try {
    const { lat, lon, days, ai } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: 'lat and lon are required' });
    }
    const result = await weatherService.getForecast({
      lat: Number(lat),
      lon: Number(lon),
      days: days ? Number(days) : undefined,
      ai: ai === 'true'
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ message: 'Error fetching forecast' });
  }
};

export const getForecast14 = async (req: Request, res: Response) => {
  try {
    const { lat, lon, days, ai, units, lang } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: 'lat and lon are required' });
    }
    const result = await weatherService.getForecast14({
      lat: Number(lat),
      lon: Number(lon),
      days: days ? Number(days) : undefined,
      ai: ai !== 'false', 
      units: units as string,
      lang: lang as string
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching forecast14:', error);
    res.status(500).json({ message: 'Error fetching 14-day forecast' });
  }
};

export const getCurrent = async (req: Request, res: Response) => {
  try {
    const { lat, lon, ai, units, lang } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });
    const result = await weatherService.getCurrent({
      lat: Number(lat),
      lon: Number(lon),
      ai: ai === 'true',
      units: units as string,
      lang: lang as string
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current weather' });
  }
};

export const getInsights = async (req: Request, res: Response) => {
  try {
    const { lat, lon, days, units, lang } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });
    const result = await weatherService.getInsights({
      lat: Number(lat),
      lon: Number(lon),
      days: days ? Number(days) : undefined,
      units: units as string,
      lang: lang as string
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching insights' });
  }
};

export const getDaily = async (req: Request, res: Response) => {
  try {
    const { lat, lon, days, ai, units, lang } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });
    const result = await weatherService.getDaily({
      lat: Number(lat),
      lon: Number(lon),
      days: days ? Number(days) : undefined,
      ai: ai === 'true',
      units: units as string,
      lang: lang as string
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily forecast' });
  }
};

export const getHourly = async (req: Request, res: Response) => {
  try {
    const { lat, lon, days, ai, units, lang } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });
    const result = await weatherService.getHourly({
      lat: Number(lat),
      lon: Number(lon),
      days: days ? Number(days) : undefined,
      ai: ai === 'true',
      units: units as string,
      lang: lang as string
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hourly forecast' });
  }
};

export const countTrees = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    
    Object.keys(req.body).forEach(key => {
      form.append(key, req.body[key]);
    });

    const data = await weatherService.countTrees(form);
    res.json(data);
  } catch (error) {
    console.error('Error counting trees:', error);
    res.status(500).json({ message: 'Error counting trees' });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const result = await weatherService.cancelSubscription();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
};

export const contactSales = async (req: Request, res: Response) => {
  try {
    const result = await weatherService.contactSales(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting sales lead' });
  }
};

export const getPaystackConfig = async (req: Request, res: Response) => {
  try {
    const result = await weatherService.getPaystackConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment config' });
  }
};

export const requestSmsAccess = async (req: Request, res: Response) => {
  try {
    const result = await weatherService.requestSmsAccess(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error requesting SMS access' });
  }
};
