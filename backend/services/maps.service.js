const axios = require('axios');
const captainModel = require('../models/captain.model');

// Geoapify is the sole provider for autocomplete and geocoding.
const REQUEST_HEADERS = {
    'User-Agent': 'RideShare-App/1.0'
};

const DEFAULT_SEARCH_COUNTRY_CODES = process.env.MAP_SEARCH_COUNTRY_CODES || 'in';
const SUGGESTION_LIMIT = 8;
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode';

const getGeoapifyApiKey = () => {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
        throw new Error('GEOAPIFY_API_KEY is not configured');
    }
    return apiKey;
};

const uniqueSuggestions = (results) => {
    const seen = new Set();

    return results.filter(result => {
        const key = `${result.main_text}|${result.secondary_text}`.toLowerCase();
        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
};

const formatGeoapifySuggestion = (place) => {
    const subtitleParts = [place.city, place.state, place.country].filter(Boolean);

    return {
        place_id: place.place_id || `${place.lat},${place.lon}`,
        description: place.formatted || place.address_line1 || place.name,
        main_text: place.name || place.address_line1 || place.formatted || 'Unknown place',
        secondary_text: [...new Set(subtitleParts)].join(', '),
        latitude: Number(place.lat),
        longitude: Number(place.lon),
        type: place.result_type,
        category: place.categories?.[0],
    };
};

const getGeoapifySuggestions = async (input, latitude, longitude) => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const response = await axios.get(`${GEOAPIFY_BASE_URL}/autocomplete`, {
        params: {
            text: input,
            format: 'json',
            limit: SUGGESTION_LIMIT,
            filter: `countrycode:${DEFAULT_SEARCH_COUNTRY_CODES}`,
            ...(Number.isFinite(lat) && Number.isFinite(lng)
                ? { bias: `proximity:${lng},${lat}` }
                : {}),
            apiKey: getGeoapifyApiKey(),
        },
        timeout: 7000,
    });

    return (response.data?.results || []).map(formatGeoapifySuggestion);
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

const resolveLocation = async (value) => {
    if (isValidCoordinatePair(value)) {
        const coordinates = parseCoordinatePair(value);
        return {
            ...coordinates,
            address: await module.exports.getReverseGeocode(
                coordinates.latitude,
                coordinates.longitude
            ),
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
            headers: REQUEST_HEADERS,
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
            headers: REQUEST_HEADERS,
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
        const response = await axios.get(`${GEOAPIFY_BASE_URL}/search`, {
            params: {
                text: address,
                format: 'json',
                limit: 1,
                filter: `countrycode:${DEFAULT_SEARCH_COUNTRY_CODES}`,
                apiKey: getGeoapifyApiKey(),
            },
            timeout: 7000,
        });

        const location = response.data?.results?.[0];
        if (!location) {
            throw new Error(`Unable to fetch coordinates for address: ${address}`);
        }

        return {
            latitude: Number(location.lat),
            longitude: Number(location.lon),
        };
    } catch (err) {
        throw new Error(`Geoapify could not find coordinates: ${err.message}`);
    }
};

module.exports.getReverseGeocode = async (lat, lng) => {
    try {
        const response = await axios.get(`${GEOAPIFY_BASE_URL}/reverse`, {
            params: {
                lat,
                lon: lng,
                format: 'json',
                apiKey: getGeoapifyApiKey(),
            },
            timeout: 7000,
        });

        const location = response.data?.results?.[0];
        if (location?.formatted) {
            return location.formatted;
        }

        throw new Error('No address found for these coordinates');
    } catch (err) {
        throw new Error(`Geoapify could not reverse geocode location: ${err.message}`);
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

module.exports.getSuggestions = async (input, latitude, longitude) => {
    if (!input || input.trim().length === 0) {
        throw new Error('Query is required');
    }

    try {
        const trimmedInput = input.trim();
        const geoapifySuggestions = await getGeoapifySuggestions(
            trimmedInput,
            latitude,
            longitude
        );

        return uniqueSuggestions(geoapifySuggestions).slice(0, SUGGESTION_LIMIT);
    }
    catch (err) {
        console.error('Geoapify suggestions failed:', err.response?.status || err.message);
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
