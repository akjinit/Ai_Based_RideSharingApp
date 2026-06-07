const axios = require('axios');
const captainModel = require('../models/captain.model');

// Using free APIs: Nominatim (OpenStreetMap) for geocoding and OpenRouteService/OSRM for routes
// No API keys required for Nominatim (fair use policy)

const NOMINATIM_HEADERS = {
    'User-Agent': 'RideShare-App/1.0'
};

const DEFAULT_SEARCH_COUNTRY_CODES = process.env.MAP_SEARCH_COUNTRY_CODES || 'in';
const SUGGESTION_LIMIT = 8;

const buildSearchViewbox = (latitude, longitude) => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    const offset = 0.6;
    return [
        (lng - offset).toFixed(6),
        (lat + offset).toFixed(6),
        (lng + offset).toFixed(6),
        (lat - offset).toFixed(6),
    ].join(',');
};

const getAddressPart = (address, keys) => {
    if (!address) {
        return '';
    }

    return keys.map(key => address[key]).find(Boolean) || '';
};

const formatSuggestion = (result) => {
    const address = result.address || {};
    const title = result.name ||
        getAddressPart(address, ['amenity', 'building', 'shop', 'tourism', 'road', 'suburb', 'neighbourhood']) ||
        result.display_name.split(',')[0];

    const subtitleParts = [
        getAddressPart(address, ['road', 'neighbourhood', 'suburb']),
        getAddressPart(address, ['city', 'town', 'village', 'municipality', 'county']),
        getAddressPart(address, ['state']),
    ].filter(Boolean);

    return {
        place_id: result.place_id,
        description: result.display_name,
        main_text: title,
        secondary_text: [...new Set(subtitleParts)].join(', '),
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        type: result.type,
        category: result.class,
    };
};

const getSuggestionScore = (result, input) => {
    const query = input.toLowerCase();
    const displayName = (result.display_name || '').toLowerCase();
    const name = (result.name || '').toLowerCase();
    const typeScores = {
        house: 18,
        building: 16,
        residential: 14,
        road: 12,
        amenity: 10,
        shop: 10,
        tourism: 9,
        railway: 8,
        suburb: 4,
        city: 2,
        state: -6,
        country: -10,
    };

    let score = Number(result.importance || 0) * 10;
    score += typeScores[result.type] || typeScores[result.class] || 0;

    if (name === query) {
        score += 20;
    } else if (name.startsWith(query)) {
        score += 12;
    } else if (displayName.includes(query)) {
        score += 4;
    }

    return score;
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

const formatPhotonSuggestion = (feature) => {
    const properties = feature.properties || {};
    const coordinates = feature.geometry?.coordinates || [];
    const titleParts = [
        properties.name,
        properties.housenumber && properties.street ? `${properties.housenumber} ${properties.street}` : '',
        properties.street,
    ].filter(Boolean);
    const subtitleParts = [
        properties.district,
        properties.city,
        properties.state,
        properties.country,
    ].filter(Boolean);

    return {
        place_id: properties.osm_id || `${coordinates[1]},${coordinates[0]}`,
        description: [
            titleParts[0],
            properties.street !== titleParts[0] ? properties.street : '',
            properties.city,
            properties.state,
            properties.country,
        ].filter(Boolean).join(', '),
        main_text: titleParts[0] || properties.city || properties.country || 'Unknown place',
        secondary_text: [...new Set(subtitleParts)].join(', '),
        latitude: coordinates[1],
        longitude: coordinates[0],
        type: properties.osm_value,
        category: properties.osm_key,
    };
};

const getPhotonSuggestions = async (input, latitude, longitude) => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const response = await axios.get(
        'https://photon.komoot.io/api/',
        {
            params: {
                q: input,
                limit: SUGGESTION_LIMIT,
                lang: 'en',
                ...(Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lon: lng } : {}),
            },
            headers: NOMINATIM_HEADERS,
            timeout: 7000,
        }
    );

    return (response.data?.features || []).map(formatPhotonSuggestion);
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

module.exports.getSuggestions = async (input, latitude, longitude) => {
    if (!input || input.trim().length === 0) {
        throw new Error('Query is required');
    }

    try {
        const trimmedInput = input.trim();
        const viewbox = buildSearchViewbox(latitude, longitude);
        const [photonSuggestions, response] = await Promise.all([
            getPhotonSuggestions(trimmedInput, latitude, longitude).catch(err => {
                console.error('Photon suggestions failed:', err.response?.status || err.message);
                return [];
            }),
            axios.get(
                'https://nominatim.openstreetmap.org/search',
                {
                    params: {
                        q: trimmedInput,
                        format: 'json',
                        addressdetails: 1,
                        namedetails: 1,
                        limit: 15,
                        countrycodes: DEFAULT_SEARCH_COUNTRY_CODES,
                        dedupe: 1,
                        ...(viewbox ? { viewbox, bounded: 0 } : {}),
                    },
                    headers: {
                        'User-Agent': 'RideShare-App/1.0',
                        'Accept-Language': 'en'
                    },
                    timeout: 10000,
                },
            )
        ]);

        return uniqueSuggestions(
            [
                ...photonSuggestions,
                ...response.data
                .sort((a, b) => getSuggestionScore(b, trimmedInput) - getSuggestionScore(a, trimmedInput))
                .map(formatSuggestion),
            ]
        ).slice(0, SUGGESTION_LIMIT);
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
