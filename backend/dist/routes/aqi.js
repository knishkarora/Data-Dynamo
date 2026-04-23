import axios from 'axios';
import { config } from '../config/env.js';
export const getCurrentAqi = async (req, res) => {
    try {
        if (!config.aqi.googleApiKey) {
            res.status(500).json({ error: 'GOOGLE_AIR_QUALITY_API_KEY is not configured' });
            return;
        }
        const lat = Number(req.query.lat ?? config.aqi.defaultLat);
        const lng = Number(req.query.lng ?? config.aqi.defaultLng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            res.status(400).json({ error: 'Invalid lat/lng values' });
            return;
        }
        const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${config.aqi.googleApiKey}`;
        const response = await axios.post(url, {
            location: {
                latitude: lat,
                longitude: lng,
            },
            extraComputations: ['LOCAL_AQI'],
            languageCode: 'en',
        });
        res.json(response.data);
    }
    catch (err) {
        console.error('AQI fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch AQI data' });
    }
};
