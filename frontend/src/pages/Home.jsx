import React, { useContext, useState } from "react";
import LocationSearchPanel from "../Components/LocationSearchPanel";
import VehiclePanel from "../Components/VehiclePanel";
import ConfirmVehicle from "../Components/ConfirmVehicle";
import WaitingForDriver from "../Components/WaitingForDriver";
import LookingForDriver from "../Components/LookingForDriver";
import AiRecommendationsPanel from "../Components/AiRecommendationsPanel";
import axios from "axios";
import { useEffect } from "react";
import { SocketDataContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet'


const vehicleImageMap = {
  location: "./location-marker.png",
  car: "car.png",
  motorcycle: "motorbike.webp",
  auto: "auto.webp"
};


const leafLetIcons = {};

for (const key in vehicleImageMap) {
  leafLetIcons[key] = L.icon({
    iconUrl: vehicleImageMap[key],
    iconSize: key !== "location" ? [60, 40] : [70, 70],
    iconAnchor: key !== "location" ? [30, 20] : [35, 35],
  })
}


const UpdateMapComponent = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([location.lat, location.lng], 15);
  }, [location]);
  return null;
}

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupPanelOpen, setpickupPanelClose] = useState(true); //for the pickup panel -> true minimised

  const [vehiclePanelOpen, setvehiclePanelOpen] = useState(false);
  const [confirmVehiclePanel, setConfirmVehiclePanel] = useState(false);
  const [lookingForDriverPanel, setlookingForDriverPanel] = useState(false);
  const [waitingForDriver, setWatingForDriver] = useState(false);

  const [pickupInputFocused, setPickupInputFocused] = useState(false);
  const [destinationInputFocused, setDestinationInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fare, setFare] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [location, setLocation] = useState({ lat: 22.961074, lng: 88.433524 });
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();
  const { sendMessage, recieveMessage, socket } = useContext(SocketDataContext);

  const { user } = useContext(UserDataContext);
  const [ride, setRide] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude
        })
      }, (err) => {
        console.error("Error getting location:", err);
      });
    }
  }

  const fetchActiveRide = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active-ride/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data) {
        setRide(response.data);
        console.log(response.data);
      }
    } catch (err) {
      console.log("Error fetching active ride:", err.message);
    }
  }

  const fetchNearbyDrivers = async (location) => {
    try {
      const captains = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/get-nearby-captains`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          lat: location.lat,
          lng: location.lng
        }
      });
      console.log(captains.data);
      setDrivers(captains.data);
    }
    catch (err) {
      console.log("Error fetching location:", err);
    }
  }

  console.log(drivers);
  const createRide = async (vehicleType) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
        origin: pickup,
        destination,
        vehicleType,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRide(response.data);
    }
    catch (err) {
      console.log("Error creating ride frontend:", err);
    }
  }

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          input: query,
          lat: location.lat,
          lng: location.lng,
        }
      });
      setSuggestions(response.data);
    } catch (err) {
      console.log("Error fetching suggestions:", err);
    }
  }

  const fetchAiRecommendations = async () => {
    setIsAiLoading(true);
    setAiPanelOpen(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-ai-recommendations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          lat: location.lat,
          lng: location.lng
        }
      });
      setAiRecommendations(response.data);
    } catch (err) {
      console.log("Error fetching AI recommendations:", err);
    } finally {
      setIsAiLoading(false);
    }
  }

  const cancelRide = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/cancel`, {
        rideId: ride._id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      setRide(null)
      setlookingForDriverPanel(false)
      setWatingForDriver(false)
    } catch (error) {
      console.log("Error cancelling ride", error)
    }
  }

  const fetchFareEstimate = async (origin, destination) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/fare-estimate`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          origin,
          destination,
        }
      });

      return response.data;
    } catch (err) {
      console.log("Error fetching fare estimate:", err);
    }
  }

  // Initial load - check for active ride immediately
  useEffect(() => {
    if (user?._id) {
      updateLocation();
      fetchActiveRide();
    }
  }, [user]);

  // Handle ride status display
  useEffect(() => {
    if (ride) {
      if (ride.status === 'requested') {
        setlookingForDriverPanel(true);
        setWatingForDriver(false);
      } else if (ride.status === 'accepted') {
        setlookingForDriverPanel(false);
        setWatingForDriver(true);
      } else if (ride.status === 'in_progress') {
        navigate('/riding');
      }
    }
  }, [ride, navigate]);

  useEffect(() => {  //socket effects
    if (user?._id) {
      sendMessage('join', { userType: "user", userId: user._id });
    }
    if (socket) {
      recieveMessage('ride-accepted', (ride) => {
        setlookingForDriverPanel(false);
        setWatingForDriver(true);
        setRide(ride);
      });

      recieveMessage('ride-started', (ride) => {
        setWatingForDriver(false);

        navigate('/riding');
      });
    }
  }, [socket, user]);   //all socket stuff


  useEffect(() => {
    updateLocation();
    const locationInterval = setInterval(() => {
      updateLocation();
    }, 8000);

    return () => clearInterval(locationInterval);
  }, []);


  useEffect(() => {
    // Only poll nearby drivers if not actively riding
    const driverInterval = setInterval(() => {
      if (!ride || (ride && ride.status === 'requested')) {
        fetchNearbyDrivers(location);
      }
    }, 9000);

    return () => clearInterval(driverInterval);
  }, [ride, location]);



  useEffect(() => {  //pickup recomendation
    if (!pickup) {
      return;
    }

    const timer = setTimeout(async () => {
      fetchSuggestions(pickup);
    }, 300);

    return () => {
      clearTimeout(timer);
    }
  }, [pickup]);


  useEffect(() => {//destination recomendation
    if (!destination) {
      return;
    }

    const timer = setTimeout(async () => {
      fetchSuggestions(destination);
    }, 300);

    return () => {
      clearTimeout(timer);
    }
  }, [destination]);


  const submitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <div className="relative h-screen">
      <h2 className="absolute left-5 top-5 text-2xl font-bold text-black pointer-events-none">rideShare</h2>

      <Link to="/user/logout" className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full">
        <i className="text-lg font-medium ri-logout-box-r-line"></i>
      </Link>

      <div className="h-screen w-screen absolute z-0">
        {/* image for temp use */}
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={14}
          className="h-full w-full "
        >

          <TileLayer
            attribution="© OpenStreetMap"
            className=""
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[location.lat, location.lng]} icon={leafLetIcons.location}>
          </Marker>


          {drivers.map((d) => {
            return (<Marker key={d._id} position={[d.location.coordinates[1], d.location.coordinates[0]]} icon={leafLetIcons[d.vehicle.vehicleType]}></Marker>)
          })}

          {/* captainId,
              vehicle,
              lat: latitude,
              lng: longitude,
              lastSeen: Date.now() */}

          <UpdateMapComponent location={location} />
        </MapContainer>


      </div>

      <div className=" flex flex-col justify-end h-screen bottom-0 absolute w-full pointer-events-none">
        <div className={`shrink-0 ${pickupPanelOpen ? "p-6" : "px-6 pt-5 pb-4"} bg-white/95 backdrop-blur-xl relative rounded-t-[2rem] pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/20`}>
          <div 
            onClick={() => setpickupPanelClose(true)}
            className={`absolute left-1/2 -translate-x-1/2 top-3 w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors ${pickupPanelOpen ? "hidden" : ""}`}
          ></div>

          <h4 className={`${pickupPanelOpen ? "text-2xl mt-2" : "text-xl mt-1"} font-bold tracking-tight text-gray-900`}>
            Find a trip
          </h4>
          
          <button 
            type="button"
            onClick={fetchAiRecommendations}
            className={`w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md shadow-indigo-500/20 ${pickupPanelOpen ? "flex" : "hidden"}`}
          >
            <i className="ri-magic-line text-xl"></i> AI: Explore Nearby
          </button>
          
          <form
            onSubmit={(e) => submitHandler(e)}
            className={`${pickupPanelOpen ? "mt-4" : "mt-3"} flex flex-col gap-3`}
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black rounded-full"></div>
              <div className="absolute left-[1.1rem] top-[60%] w-0.5 h-8 bg-gray-300 z-10"></div>
              <input
                className="bg-gray-100/80 border border-gray-200 px-10 py-3.5 text-base font-medium text-gray-900 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-500"
                type="text"
                placeholder="Add a pickup location"
                onClick={() => setpickupPanelClose(false)}
                onFocus={() => {
                  setPickupInputFocused(true);
                  setDestinationInputFocused(false);
                }}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div>
              <input
                className="bg-gray-100/80 border border-gray-200 px-10 py-3.5 text-base font-medium text-gray-900 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-500"
                type="text"
                placeholder="Enter your destination"
                onClick={() => setpickupPanelClose(false)}
                onFocus={() => {
                  setDestinationInputFocused(true)
                  setPickupInputFocused(false);
                }}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        {!pickupPanelOpen && (
          <div className="bg-white/95 backdrop-blur-xl flex-1 min-h-0 flex flex-col pointer-events-auto">
            <div className="px-6 pb-2">
              <button className="bg-black w-full py-3.5 rounded-xl text-white font-semibold text-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/20" onClick={async () => {
                const fareDetails = await fetchFareEstimate(pickup, destination);
                setFare(fareDetails);
                setvehiclePanelOpen(true);
                setpickupPanelClose(true);
              }} >
                Confirm Pickup
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <LocationSearchPanel
                pickupInputFocused={pickupInputFocused}
                destinationInputFocused={destinationInputFocused}
                suggestions={suggestions}
                setPickup={setPickup}
                setDestination={setDestination}
              />
            </div>
          </div>
        )}
      </div>

      <AiRecommendationsPanel 
        aiPanelOpen={aiPanelOpen}
        setAiPanelOpen={setAiPanelOpen}
        recommendations={aiRecommendations}
        isAiLoading={isAiLoading}
        onSelectPlace={(placeName) => {
           setDestination(placeName);
           // Also make sure to open the destination suggestions / close the panel state if needed
           setpickupPanelClose(false);
           setDestinationInputFocused(true);
           setPickupInputFocused(false);
        }}
      />

      <VehiclePanel
        setvehiclePanelOpen={setvehiclePanelOpen}
        vehiclePanelOpen={vehiclePanelOpen}
        setConfirmVehiclePanel={setConfirmVehiclePanel}
        fareDetails={fare}
        setSelectedVehicle={setSelectedVehicle}
      />

      <ConfirmVehicle
        selectedVehicle={selectedVehicle}
        fareDetails={fare}
        pickup={pickup}
        destination={destination}

        confirmVehiclePanel={confirmVehiclePanel}
        setConfirmVehiclePanel={setConfirmVehiclePanel}
        setlookingForDriverPanel={setlookingForDriverPanel}
        createRide={createRide}
      />

      <LookingForDriver
        lookingForDriverPanel={lookingForDriverPanel}
        ride={ride}
        cancelRide={cancelRide}
      />
      <WaitingForDriver
        waitingForDriver={waitingForDriver}
        ride={ride}
      />
    </div>
  );
};

export default Home;
