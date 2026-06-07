const axios = require('axios');
const captainModel = require('../models/captain.model');

// Using free APIs: Nominatim (OpenStreetMap) for geocoding and Open Route Service for distance matrix
// No API keys required for Nominatim (fair use policy)

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
                headers: {
                    'User-Agent': 'RideShare-App/1.0'
                },
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
                headers: {
                    'User-Agent': 'RideShare-App/1.0'
                },
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
        // Parse origins and destinations (format: "lat,lng")
        const [originLat, originLng] = origins.split(',').map(v => parseFloat(v.trim()));
        const [destLat, destLng] = destinations.split(',').map(v => parseFloat(v.trim()));

        // Get origin address
        const originResponse = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
                params: {
                    lat: originLat,
                    lon: originLng,
                    format: 'json',
                },
                headers: {
                    'User-Agent': 'RideShare-App/1.0'
                },
                timeout: 5000,
            }
        );

        // Get destination address
        const destResponse = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
                params: {
                    lat: destLat,
                    lon: destLng,
                    format: 'json',
                },
                headers: {
                    'User-Agent': 'RideShare-App/1.0'
                },
                timeout: 5000,
            }
        );

        // Get distance and duration using Open Route Service (free tier available)
        const routeResponse = await axios.get(
            'https://api.openrouteservice.org/v2/directions/driving',
            {
                params: {
                    api_key: process.env.ORS_API_KEY || '',
                    start: `${originLng},${originLat}`,
                    end: `${destLng},${destLat}`,
                },
                headers: {
                    'User-Agent': 'RideShare-App/1.0'
                },
                timeout: 5000,
            }
        );

        if (routeResponse.data && routeResponse.data.features && routeResponse.data.features.length > 0) {
            const route = routeResponse.data.features[0].properties.segments[0];
            return {
                origin: originResponse.data.display_name || origins,
                destination: destResponse.data.display_name || destinations,
                distance: Math.round(route.distance), // in meters
                duration: Math.round(route.duration), // in seconds
            };
        } else {
            throw new Error('Unable to fetch route information');
        }

    } catch (err) {
        console.log(err);
        throw new Error('Unable to fetch distance and time');
    }
};

module.exports.getSuggestions = async (input) => {
    if (!input) {
        throw new Error('Query is required');
    }

    try {
        const response = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            {
                params: {
                    q: input,
                    format: 'json',
                    limit: 5,
                    addressdetails: 1,
                },
                headers: {
                    'User-Agent': 'RideShare-App/1.0'
                },
                timeout: 5000,
            }
        );

        if (!response.data || response.data.length === 0) {
            throw new Error('Unable to fetch suggestions');
        }

        // Map Nominatim results to similar format as Google Places API
        return response.data.map(result => ({
            place_id: result.place_id,
            description: result.display_name,
            main_text: result.name || result.display_name.split(',')[0],
            secondary_text: result.address ? Object.values(result.address).slice(1, 3).join(', ') : '',
        }));
    }
    catch (err) {
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