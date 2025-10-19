'use client';
import { useEffect, useRef, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';

const MapContainerComponent = ({ mapData }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const leafletMarkersRef = useRef([]); // store markers for updates

  const baseIconSize = 20;

  // Prepare markersData
  const markersData = useMemo(() => {
    if (!mapData || mapData.length === 0) return [];
    return mapData.map((item) => ({
      id: item.id,
      pos: [parseFloat(item.latitude), parseFloat(item.longitude)],
      popup: `
        <div class="popup-custom">
          <div class="popup-text">
            ${item.name}<br>
            <div>${item.description}</div>
          </div>
        </div>
      `,
      popupDouble: {
        points: parseInt(item.points) || 0,
        description: item.description || "No description",
        image: item.picture || "/images/default.png",
        video: item.video || "",
        audio: item.audio || ""
      }
    }));
  }, [mapData]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let L;
    (async () => {
      L = await import('leaflet');

      // Default marker setup
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: '/leaflet/marker-icon.png',
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });

      // Initialize map only once
      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [27.7172, 85.3240],
          zoom: 14,
          attributionControl: false,
        });
        mapRef.current = map;

        L.tileLayer(
          `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=o5HKmzYWt25adtDkDQQK`,
          { attribution: '' }
        ).addTo(map);

        // Zoom scaling
        map.on('zoom', () => {
          const zoom = map.getZoom();
          const scale = zoom / 14;
          const newSize = baseIconSize * scale;
          leafletMarkersRef.current.forEach((marker) => marker.setIcon(createQrIcon(newSize, L)));
        });

        // User location
        if (navigator.geolocation) {
          const watchId = navigator.geolocation.watchPosition(
            ({ coords: { latitude: lat, longitude: lng } }) => {
              if (!userMarkerRef.current) {
                const userMarker = L.circleMarker([lat, lng], {
                  radius: 4,
                  color: 'red',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8,
                }).addTo(map);
                userMarker.bindPopup('<b>You are here!</b>');
                userMarkerRef.current = userMarker;
                userMarker.openPopup();
              } else {
                userMarkerRef.current.setLatLng([lat, lng]);
              }
            },
            (error) => console.error('Geolocation error:', error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      }

      // Create icon function
      function createQrIcon(size, L) {
        return L.icon({
          iconUrl: '/images/qrpic.png',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [size / 2 + 15, 0],
          className: 'qr-marker',
        });
      }

      // Remove existing markers
      leafletMarkersRef.current.forEach((marker) => marker.remove());
      leafletMarkersRef.current = [];

      // Add new markers
      markersData.forEach((m) => {
        const marker = L.marker(m.pos, { icon: createQrIcon(baseIconSize, L) }).addTo(mapRef.current);
        marker.bindPopup(m.popup, { offset: L.point(40, 0), closeButton: true, autoPan: true });

        marker.on('dblclick', () => {
          marker.closePopup();
          const data = m.popupDouble;
          const popup = L.popup({
            offset: L.point(0, -10),
            closeButton: false,
            autoPan: true,
            className: 'custom-popup',
          })
            .setLatLng(m.pos)
            .setContent(`
              <div class="popup-card">
                <div class="popup-header">
                  <span class="popup-points">${data.points} PTS</span>
                  <button class="popup-close">✖</button>
                </div>
                <div class="popup-body">
                  <p class="popup-text">${data.description}</p>
                  ${data.image ? `<img src="${data.image}" alt="Image" class="popup-img"/>` : ''}
                  ${data.video ? `<video controls class="popup-video"><source src="${data.video}" type="video/mp4"></video>` : ''}
                  ${data.audio ? `<audio controls class="popup-audio"><source src="${data.audio}" type="audio/mpeg"></audio>` : ''}
                </div>
              </div>
            `)
            .openOn(mapRef.current);

          setTimeout(() => {
            const closeBtn = document.querySelector('.custom-popup .popup-close');
            if (closeBtn) closeBtn.addEventListener('click', () => mapRef.current.closePopup(popup));
          }, 0);
        });

        leafletMarkersRef.current.push(marker);
      });
    })();
  }, [markersData]);

  return (
    <div className="map-wrapper">
      <div className="map-container" ref={mapContainerRef}></div>
    </div>
  );
};

export default MapContainerComponent;
