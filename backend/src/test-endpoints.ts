import * as weatherService from './services/weatherService';
import * as dotenv from 'dotenv';
import { Farmer } from './models/types';

dotenv.config();

async function test() {
  console.log('--- Testing WeatherAI Endpoints ---');
  
  const testFarmer: Farmer = {
    id: 'test-farmer-123',
    name: 'Joseph Kiprono',
    county: 'Bomet',
    ward: 'Bomet Central',
    location: 'Bomet Central',
    acres: 3.2,
    crop: 'Maize',
    risk: 'low',
    phone: '+254700000000',
    lat: -0.7829,
    lon: 35.3447,
    timezone: 'Africa/Nairobi'
  };

  try {
    console.log('\n--- RAW WEATHER TEST ---');
    const rawWeather = await weatherService.getWeather({ lat: testFarmer.lat, lon: testFarmer.lon, ai: true });
    console.log('Raw Weather Keys:', Object.keys(rawWeather));
    console.log('Current Keys:', Object.keys(rawWeather.current));
    if (rawWeather.daily?.[0]) console.log('Daily[0] Keys:', Object.keys(rawWeather.daily[0]));

    console.log('\n1. Testing Farmer Dashboard Data...');
    const farmerData = await weatherService.getFarmerDashboardData(testFarmer);
    console.log('SUCCESS: Farmer dashboard data fetched.');
    console.log('Advisory:', JSON.stringify(farmerData.advisory));

    console.log('\n2. Testing Officer Dashboard Data...');
    const officerData = await weatherService.getOfficerDashboardData();
    console.log('SUCCESS: Officer dashboard data fetched.');
    console.log('Advisory:', JSON.stringify(officerData.advisory));
    console.log('Messages:', officerData.meta.messages);

    console.log('\n3. Testing Admin Dashboard Data...');
    const adminData = await weatherService.getAdminDashboardData();
    console.log('SUCCESS: Admin dashboard data fetched.');
    console.log('Usage Plan:', adminData.usage.plan);
    console.log('Messages:', adminData.meta.messages);

    console.log('\n--- ALL TESTS COMPLETED ---');
  } catch (error) {
    console.error('FAILURE: Error during testing:', error);
  }
}

test();
