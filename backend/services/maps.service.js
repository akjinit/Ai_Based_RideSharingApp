const axios = require('axios');
const captainModel = require('../models/captain.model');

// Using free APIs: Nominatim (OpenStreetMap) for geocoding and OpenRouteService/OSRM for routes
// No API keys required for Nominatim (fair use policy)

const NOMINATIM_HEADERS = {
    'User-Agent': 'RideShare-App/1.0'
};

const isValidCoordinatePair = (value) => {
    if (typeof value !== 'string') {
        return false;
    }

    const parts = value.split(',').map(v => parseFloat(v.trim()));

    return parts.length === 2 &&
        parts.every(Number.isFinite) &&
        Math.abs(parts[0]) <= 90 &&
        Math.abs(parts[1]) <= 180;
};

const parseCoordinatePair = (value) => {
    const [latitude, longitude] = value.split(',').map(v => parseFloat(v.trim()));
    return { latitude, longitude };
};

const reverseGeocode = async (latitude, longitude, fallback) => {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: 'json',
                },
                headers: NOMINATIM_HEADERS,
                timeout: 5000,
            }
        );

        return response.data?.display_name || fallback;
    } catch (err) {
        return fallback;
    }
};

const resolveLocation = async (value) => {
    if (isValidCoordinatePair(value)) {
        const coordinates = parseCoordinatePair(value);
        return {
            ...coordinates,
            address: await reverseGeocode(coordinates.latitude, coordinates.longitude, value),
        };
    }

    const coordinates = await module.exports.getAddressCoordinate(value);

    return {
        ...coordinates,
        address: value,
    };
};

const getRouteFromOpenRouteService = async (origin, destination) => {
    if (!process.env.ORS_API_KEY) {
        throw new Error('ORS_API_KEY is not configured');
    }

    const response = await axios.get(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        {
            params: {
                api_key: process.env.ORS_API_KEY,
                start: `${origin.longitude},${origin.latitude}`,
                end: `${destination.longitude},${destination.latitude}`,
            },
            headers: NOMINATIM_HEADERS,
            timeout: 8000,
        }
    );

    const segment = response.data?.features?.[0]?.properties?.segments?.[0];
    const summary = response.data?.routes?.[0]?.summary;
    const route = segment || summary;

    if (!route?.distance || !route?.duration) {
        throw new Error('OpenRouteService returned no route');
    }

    return {
        distance: Math.round(route.distance),
        duration: Math.round(route.duration),
    };
};

const getRouteFromOsrm = async (origin, destination) => {
    const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}`,
        {
            params: {
                overview: 'false',
            },
            headers: NOMINATIM_HEADERS,
            timeout: 8000,
        }
    );

    const route = response.data?.routes?.[0];

    if (!route?.distance || !route?.duration) {
        throw new Error('OSRM returned no route');
    }

    return {
        distance: Math.round(route.distance),
        duration: Math.round(route.duration),
    };
};

module.exports.getAddressCoordinate = async (address) => {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: address,
                    format: 'json',
                    limit: 1,
                },
                headers: NOMINATIM_HEADERS,
                timeout: 5000,
            }
        );

        if (!response.data || response.data.length === 0) {
            throw new Error(`Unable to fetch coordinates for address: ${address}`);
        }

        const location = response.data[0];

        return {
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
        };
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports.getReverseGeocode = async (lat, lng) => {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
                params: {
                    lat,
                    lon: lng,
                    format: 'json',
                },
                headers: NOMINATIM_HEADERS,
                timeout: 5000,
            }
        );

        if (response.data && response.data.address) {
            return response.data.display_name;
        }
        return null;
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports.getDistanceTime = async (origins, destinations) => {
    if (!origins || !destinations) {
        throw new Error('Origin and destination are required');
    }

    try {
        const origin = await resolveLocation(origins);
        const destination = await resolveLocation(destinations);

        let route;
        try {
            route = await getRouteFromOpenRouteService(origin, destination);
        } catch (orsError) {
            console.error('OpenRouteService route failed, using OSRM fallback:', orsError.response?.status || orsError.message);
            route = await getRouteFromOsrm(origin, destination);
        }

        return {
            origin: origin.address,
            destination: destination.address,
            distance: route.distance, // in meters
            duration: route.duration, // in seconds
        };

    } catch (err) {
        console.error('Distance/time error:', err.response?.status || err.message);
        throw new Error('Unable to fetch distance and time');
    }
};

module.exports.getSuggestions = async (input) => {
    if (!input || input.trim().length === 0) {
        throw new Error('Query is required');
    }

    try {
        const response = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            {
                params: {
                    q: input.trim(),
                    format: 'json',
                    limit: 5,
                    // Remove 'addressdetails' - it's causing 400 error
                },
                headers: {
                    'User-Agent': 'RideShare-App/1.0',
                    'Accept-Language': 'en'
                },
                timeout: 10000,
            }
        );

        return response.data.length > 0 ? response.data.map(result => ({
            place_id: result.place_id,
            description: result.display_name,
            main_text: result.name || result.display_name.split(',')[0],
            secondary_text: result.address ? Object.values(result.address).slice(1, 3).join(', ') : '',
        })) : [];
    }
    catch (err) {
        console.error('Nominatim Error:', err.response?.status, err.message);
        throw new Error('Unable to fetch suggestions');
    }
};



module.exports.getCaptainsInTheRadius = async (latitude, longitude, radius) => {
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [longitude, latitude],
                    radius / 6371
                ]
            }
        },
        captainState: 'active',
        rideId: null
    });

    return captains;
}
