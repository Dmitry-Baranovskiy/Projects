import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import '../index.css'; // Импортируем стили

const MapComponent = () => {
  const [selected, setSelected] = useState(null);
  const [weatherStations, setWeatherStations] = useState([]);
  const [soilProfiles, setSoilProfiles] = useState([]);
  const [showStations, setShowStations] = useState(true);
  const [showSoilProfiles, setShowSoilProfiles] = useState(true);
  const [center, setCenter] = useState({ lat: 55.7558, lng: 37.6173 });
  const [zoom, setZoom] = useState(5);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchWeatherStations = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/weatherstations');
        setWeatherStations(response.data);
      } catch (error) {
        console.error('Error fetching weather stations:', error);
      }
    };

    const fetchSoilProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/soilprofiles');
        setSoilProfiles(response.data);
      } catch (error) {
        console.error('Error fetching soil profiles:', error);
      }
    };

    fetchWeatherStations();
    fetchSoilProfiles();
  }, []);

  const mapStyles = {
    height: '100vh',
    width: '100%',
  };

  const onLoad = map => {
    mapRef.current = map;
  };

  const onUnmount = () => {
    mapRef.current = null;
  };

  const handleToggleStations = () => {
    if (mapRef.current) {
      setCenter({
        lat: mapRef.current.getCenter().lat(),
        lng: mapRef.current.getCenter().lng()
      });
      setZoom(mapRef.current.getZoom());
    }
    setShowStations(!showStations);
  };

  const handleToggleSoilProfiles = () => {
    if (mapRef.current) {
      setCenter({
        lat: mapRef.current.getCenter().lat(),
        lng: mapRef.current.getCenter().lng()
      });
      setZoom(mapRef.current.getZoom());
    }
    setShowSoilProfiles(!showSoilProfiles);
  };

  return (
    <div>
      <button onClick={handleToggleStations}>
        {showStations ? 'Hide' : 'Show'} Weather Stations
      </button>
      <button onClick={handleToggleSoilProfiles}>
        {showSoilProfiles ? 'Hide' : 'Show'} Soil Profiles
      </button>
      <LoadScript googleMapsApiKey="AIzaSyDP859gleh5EhRp9hUUGKLpr0-1hHEJ7o8">
        <GoogleMap
          mapContainerClassName="map-container"
          zoom={zoom}
          center={center}
          onLoad={onLoad}
          onUnmount={onUnmount}
          mapContainerStyle={mapStyles}
        >
          {showStations && weatherStations.map((item) => (
            <Marker
              key={item.id}
              position={{ lat: item.latitude, lng: item.longitude }}
              onClick={() => setSelected(item)}
            />
          ))}

          {showSoilProfiles && soilProfiles.map((item) => (
            <Marker
              key={item.soil_id}
              position={{ lat: item.latitude, lng: item.longitude }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' // Иконка для почвенных разрезов
              }}
              onClick={() => setSelected(item)}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{
                lat: selected.latitude,
                lng: selected.longitude
              }}
              onCloseClick={() => setSelected(null)}
            >
              <div>
                {selected.name && <h2>{selected.name}</h2>}
                {selected.region && <h2>{selected.region}</h2>}
                <p>Coordinates: ({selected.latitude}, {selected.longitude})</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
