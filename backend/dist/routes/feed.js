import { Report } from '../models/report.js';
import { redis } from '../services/redis.js';
export const getFeed = async (req, res) => {
    try {
        const { page = '1', limit = '20', category, lat, lng, radius = '10', } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;
        // Build cache key
        const cacheKey = `feed:${pageNum}:${limitNum}:${category || 'all'}:${lat || ''}:${lng || ''}:${radius}`;
        // Try cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            res.json(JSON.parse(cached));
            return;
        }
        // Build query
        const query = {};
        if (category) {
            query.category = category;
        }
        // Geospatial filter
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const radiusKm = parseFloat(radius);
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: radiusKm * 1000, // convert km to meters
                },
            };
        }
        // Fetch reports sorted by upvotes desc, then createdAt desc
        const [reports, total] = await Promise.all([
            Report.find(query)
                .sort({ upvoteCount: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Report.countDocuments(query),
        ]);
        const response = {
            reports,
            total,
            page: pageNum,
            pageSize: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
        // Cache for 60 seconds
        await redis.set(cacheKey, JSON.stringify(response), 60);
        res.json(response);
    }
    catch (err) {
        console.error('Feed error:', err);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
};
export const getFeedGeoJSON = async (req, res) => {
    try {
        const { category } = req.query;
        const cacheKey = `feed:geojson:${category || 'all'}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            res.json(JSON.parse(cached));
            return;
        }
        const query = {};
        if (category)
            query.category = category;
        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();
        const features = reports.map((r) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: r.location?.coordinates ?? [r.longitude, r.latitude],
            },
            properties: {
                id: r._id.toString(),
                category: r.category,
                status: r.status,
                description: r.description?.slice(0, 100) || '',
                imageUrl: r.imageUrl,
                upvoteCount: r.upvoteCount,
                createdAt: r.createdAt?.toISOString(),
            },
        }));
        const response = {
            type: 'FeatureCollection',
            features,
        };
        await redis.set(cacheKey, JSON.stringify(response), 60);
        res.json(response);
    }
    catch (err) {
        console.error('Feed GeoJSON error:', err);
        res.status(500).json({ error: 'Failed to fetch map data' });
    }
};
