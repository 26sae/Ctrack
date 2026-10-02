import React, { useMemo, useRef, useState } from 'react';
import { Autocomplete, GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 };
const MAP_LIBRARIES = ['places'];

function GoogleMapPicker({ value, onChange, height = '260px' }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        style={{
          border: '1px dashed var(--gray300)',
          borderRadius: 'var(--r-md)',
          padding: '12px',
          background: 'white',
          color: 'var(--gray700)',
          fontSize: '.85rem',
          lineHeight: '1.45',
        }}
      >
        Google Maps is not configured yet. Add your key to Vite env as VITE_GOOGLE_MAPS_API_KEY, then restart the dev server.
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={MAP_LIBRARIES}>
      <GoogleMapPickerInner value={value} onChange={onChange} height={height} />
    </LoadScript>
  );
}

function GoogleMapPickerInner({ value, onChange, height }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);

  const center = useMemo(() => {
    if (Number.isFinite(value?.lat) && Number.isFinite(value?.lng)) {
      return { lat: value.lat, lng: value.lng };
    }
    return DEFAULT_CENTER;
  }, [value]);

  const ensureGeocoder = () => {
    if (!geocoderRef.current && window.google?.maps?.Geocoder) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    return geocoderRef.current;
  };

  const reverseGeocode = (lat, lng) => {
    const geocoder = ensureGeocoder();
    if (!geocoder) return;

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        onChange({ lat, lng, address: results[0].formatted_address });
      } else {
        onChange({ lat, lng, address: value?.address || '' });
      }
    });
  };

  const handlePlaceChanged = () => {
    const place = autocomplete?.getPlace();
    const lat = place?.geometry?.location?.lat?.();
    const lng = place?.geometry?.location?.lng?.();

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const next = {
      address: place.formatted_address || place.name || value?.address || '',
      lat,
      lng,
    };
    onChange(next);

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <Autocomplete onLoad={(a) => setAutocomplete(a)} onPlaceChanged={handlePlaceChanged}>
        <input
          type="text"
          placeholder="Search location"
          value={value?.address || ''}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height }}
        center={center}
        zoom={Number.isFinite(value?.lat) && Number.isFinite(value?.lng) ? 16 : 12}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onClick={(e) => {
          const lat = e.latLng?.lat?.();
          const lng = e.latLng?.lng?.();
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          reverseGeocode(lat, lng);
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {Number.isFinite(value?.lat) && Number.isFinite(value?.lng) && (
          <Marker position={{ lat: value.lat, lng: value.lng }} />
        )}
      </GoogleMap>
      {Number.isFinite(value?.lat) && Number.isFinite(value?.lng) && (
        <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--gray600)' }}>
          Selected coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}

export default GoogleMapPicker;