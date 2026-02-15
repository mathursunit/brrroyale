import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import citiesData from '../data/cities.json';
import snowyData from '../../public/data/season_current.json';
import coldData from '../../public/data/coldest_cities.json';

// Build a coordinate lookup from cities.json
const coordMap = {};
citiesData.forEach(c => {
    coordMap[c.id] = { lat: c.lat, lon: c.lon };
});

/** Custom snowflake/frost marker as a styled div */
const createMarkerIcon = (rank, value, isSnow) => {
    const size = rank === 1 ? 52 : rank <= 3 ? 42 : 34;
    const bgColor = rank === 1
        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
        : rank === 2
            ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)'
            : rank === 3
                ? 'linear-gradient(135deg, #d97706, #b45309)'
                : 'linear-gradient(135deg, #38bdf8, #0ea5e9)';

    return L.divIcon({
        className: 'snow-map-marker',
        html: `
            <div class="map-marker-inner" style="width:${size}px;height:${size}px;background:${bgColor};">
                <span class="map-marker-rank">#${rank}</span>
                <span class="map-marker-value">${value}${isSnow ? '"' : '°'}</span>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

const SnowMap = ({ dataset, onCityClick }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);

    const isSnow = dataset === 'snow';
    const data = isSnow ? snowyData : coldData;
    const rankings = data.rankings || [];

    useEffect(() => {
        if (mapInstance.current) return; // Already initialized

        // Dark-themed map tiles (CartoDB Dark Matter)
        const tileLayer = L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 10,
            }
        );

        mapInstance.current = L.map(mapRef.current, {
            center: [44.5, -85],
            zoom: 4,
            zoomControl: true,
            scrollWheelZoom: true,
            layers: [tileLayer],
        });

        // Fit bounds to include all cities with coordinates
        const points = rankings
            .map(city => coordMap[city.id])
            .filter(Boolean)
            .map(c => [c.lat, c.lon]);

        if (points.length > 0) {
            mapInstance.current.fitBounds(points, { padding: [40, 40], maxZoom: 7 });
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Update markers when dataset changes
    useEffect(() => {
        if (!mapInstance.current) return;

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        rankings.forEach(city => {
            const coords = coordMap[city.id];
            if (!coords) return;

            const value = isSnow ? city.total_snow : city.lowest_temp;
            const icon = createMarkerIcon(city.rank, value, isSnow);

            const marker = L.marker([coords.lat, coords.lon], { icon })
                .addTo(mapInstance.current);

            // Tooltip on hover
            marker.bindTooltip(
                `<div class="map-tooltip">
                    <strong>${city.city}, ${city.state}</strong><br/>
                    <span>${isSnow ? 'Total Snow' : 'Low Temp'}: <b>${value}${isSnow ? '"' : '°F'}</b></span><br/>
                    <span>Rank: <b>#${city.rank}</b></span>
                    ${isSnow && city.avg_annual ? `<br/><span>Avg: ${city.avg_annual}" / Season</span>` : ''}
                </div>`,
                {
                    direction: 'top',
                    offset: [0, -20],
                    className: 'snow-map-tooltip',
                }
            );

            marker.on('click', () => {
                if (onCityClick) onCityClick(city.id);
            });

            markersRef.current.push(marker);
        });
    }, [dataset, rankings, isSnow, onCityClick]);

    return (
        <div className="snow-map-container">
            <div className="snow-map-header">
                <h3 className="snow-map-title">
                    {isSnow ? '❄️ Snowfall Battleground' : '🥶 Coldest Cities Map'}
                </h3>
                <span className="snow-map-subtitle">
                    Click a marker for city details
                </span>
            </div>
            <div ref={mapRef} className="snow-map" id="snow-map" />
        </div>
    );
};

export default SnowMap;
