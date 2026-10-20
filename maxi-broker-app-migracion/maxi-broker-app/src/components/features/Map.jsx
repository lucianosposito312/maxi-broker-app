import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({ projects }) => {
    const projectsWithCoords = projects.filter(p => p.lat && p.lng);
    
    if (projectsWithCoords.length === 0) {
        return (
            <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-xl border border-gold-500/30 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No hay proyectos con ubicación en mapa</p>
            </div>
        );
    }

    const center = projectsWithCoords.length > 0 ? [projectsWithCoords[0].lat, projectsWithCoords[0].lng] : [-34.6037, -58.3816];

    return (
        <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-xl border border-gold-500/30">
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {projectsWithCoords.map((project) => (
                    <Marker key={project.id} position={[project.lat, project.lng]}>
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-serif font-bold text-forest-900">{project.title}</h3>
                                <p className="text-sm text-gray-600">{project.type}</p>
                                <p className="font-medium text-gold-600">{project.price}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
