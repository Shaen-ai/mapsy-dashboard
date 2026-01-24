import { Edit2, Trash2, Phone, Mail, Globe, MapPin, Clock, Image } from 'lucide-react';
import { Location } from '../types/location';

interface LocationListProps {
  locations: Location[];
  loading?: boolean;
  onEdit: (location: Location) => void;
  onDelete: (id: string | number) => void;
}

const LocationList: React.FC<LocationListProps> = ({ locations, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
        <div className="inline-flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading locations...</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
        <MapPin className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No locations yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Click "Add Location" to get started with your first location.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {locations.map((location) => {
        const locationId = (location as any)._id || location.id;
        return (
          <div
            key={locationId}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500"
          >
            {/* Image Section */}
            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
              {location.image_url ? (
                <img
                  src={location.image_url}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="h-16 w-16 text-blue-300 dark:text-gray-500" />
                </div>
              )}

              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur text-blue-700 dark:text-blue-400 shadow-sm">
                  {location.category}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(location)}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-blue-600 dark:text-blue-400 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    const id = (location as any)._id || location.id;
                    if (id) onDelete(id);
                  }}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-red-600 dark:text-red-400 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-1">
                {location.name}
              </h3>

              <div className="space-y-2.5">
                {/* Address */}
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <MapPin size={18} className="mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm line-clamp-2">{location.address}</span>
                </div>

                {/* Phone */}
                {location.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <a
                      href={`tel:${location.phone}`}
                      className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {location.phone}
                    </a>
                  </div>
                )}

                {/* Email */}
                {location.email && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <a
                      href={`mailto:${location.email}`}
                      className="text-sm truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {location.email}
                    </a>
                  </div>
                )}

                {/* Website */}
                {location.website && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Globe size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <a
                      href={location.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {location.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Business Hours */}
              {location.business_hours && (
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={18} className="text-gray-400 dark:text-gray-500" />
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Business Hours</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {Object.entries(location.business_hours).slice(0, 6).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400 capitalize">{day}:</span>
                        <span className="text-gray-700 dark:text-gray-200 font-medium">{hours || 'Closed'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => onEdit(location)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 font-medium rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-200 text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LocationList;