import { Router } from 'express';
import * as weatherController from '../controllers/weatherController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Dashboard Routes
router.get('/farmer-dashboard', protect, authorize(UserRole.FARMER), weatherController.getFarmerDashboard);
router.get('/officer-dashboard', protect, authorize(UserRole.OFFICER), weatherController.getOfficerDashboard);
router.get('/admin-dashboard', protect, authorize(UserRole.ADMIN), weatherController.getAdminDashboard);

// Business Logic Routes
router.get('/geo', protect, weatherController.getWeatherGeo);
router.get('/ussd-snapshot', weatherController.getUSSDSnapshot); // Public for USSD access
router.post('/analyze-trees', protect, authorize(UserRole.FARMER, UserRole.OFFICER, UserRole.ADMIN), upload.single('image'), weatherController.analyzeTrees);
router.post('/forestry/count-trees', protect, authorize(UserRole.FARMER, UserRole.OFFICER, UserRole.ADMIN), upload.single('image'), weatherController.countTrees);
router.post('/sms/register-bomet', protect, authorize(UserRole.OFFICER, UserRole.ADMIN), weatherController.registerBometFarmer);
router.post('/sms/alert', protect, authorize(UserRole.OFFICER, UserRole.ADMIN), weatherController.sendWeatherAlert);
router.post('/sms/send', protect, authorize(UserRole.OFFICER, UserRole.ADMIN), weatherController.sendDirectSms);
router.get('/sms/health', protect, authorize(UserRole.ADMIN), weatherController.getSmsHealth);
router.delete('/webhooks/:id', protect, authorize(UserRole.ADMIN), weatherController.deleteWebhook);
router.get('/ip-lookup', protect, weatherController.getIpLookup);
router.get('/forecast', protect, weatherController.getForecast);
router.get('/forecast14', protect, weatherController.getForecast14);
router.get('/current', protect, weatherController.getCurrent);
router.get('/insights', protect, weatherController.getInsights);
router.get('/daily', protect, weatherController.getDaily);
router.get('/hourly', protect, weatherController.getHourly);

// Billing & Account
router.post('/billing/cancel', protect, weatherController.cancelSubscription);
router.post('/billing/contact-sales', weatherController.contactSales);
router.get('/billing/config', weatherController.getPaystackConfig);
router.post('/billing/sms-access', protect, authorize(UserRole.ADMIN), weatherController.requestSmsAccess);

export default router;
