import { useState, useEffect } from 'react';
import { Plus, AlertCircle, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import LocationList from './components/LocationList';
import LocationForm from './components/LocationForm';
import ConfirmationModal from './components/ConfirmationModal';
import WidgetSelector from './components/WidgetSelector';
import { api } from './services/api';
import { Location } from './types/location';
import { wixAuth } from './services/wixAuth';
import { useDarkMode } from './hooks/useDarkMode';

type DashboardState = 'loading' | 'widget-selector' | 'locations';

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dashboardState, setDashboardState] = useState<DashboardState>('loading');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; locationId: string | null }>({
    isOpen: false,
    locationId: null
  });
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const initialize = async () => {
      // Check URL params first
      const urlParams = new URLSearchParams(window.location.search);
      const hasInstance = urlParams.has('instance');
      const hasCompId = urlParams.has('compId');

      // Initialize Wix authentication and wait for it to complete
      const authState = await wixAuth.initializeFromUrl();

      if (hasInstance) {
        if (!authState.isAuthenticated) {
          setAuthError('Invalid or expired authentication token');
          return;
        }

        // If we have compId, go directly to locations
        if (hasCompId) {
          setDashboardState('locations');
          fetchLocations();
        } else {
          // No compId - show widget selector
          setDashboardState('widget-selector');
        }
      } else {
        // Allow access without Wix authentication for standalone mode
        setDashboardState('locations');
        fetchLocations();
      }
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWidgetSelected = () => {
    setDashboardState('locations');
    fetchLocations();
  };

  const handleBackToWidgetSelector = () => {
    // Remove compId from URL and go back to widget selector
    const url = new URL(window.location.href);
    url.searchParams.delete('compId');
    window.history.pushState({}, '', url.toString());
    wixAuth.setCompId('');
    setDashboardState('widget-selector');
    setLocations([]);
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await api.getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (formData: FormData) => {
    try {
      const newLocation = await api.createLocation(formData);
      setLocations([...locations, newLocation]);
      setIsAddingLocation(false);
      toast.success('Location created successfully!');
    } catch (error) {
      console.error('Failed to create location:', error);
      toast.error('Failed to create location. Please try again.');
    }
  };

  const handleUpdateLocation = async (formData: FormData) => {
    if (!selectedLocation || !selectedLocation._id) return;

    try {
      const updatedLocation = await api.updateLocation(selectedLocation._id, formData);
      setLocations(locations.map((loc) =>
        loc._id === updatedLocation._id ? updatedLocation : loc
      ));
      setSelectedLocation(null);
      toast.success('Location updated successfully!');
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error('Failed to update location. Please try again.');
    }
  };

  const handleDeleteLocation = (id: string | number) => {
    const idString = String(id);
    setDeleteModal({ isOpen: true, locationId: idString });
  };

  const confirmDelete = async () => {
    if (!deleteModal.locationId) return;

    try {
      await api.deleteLocation(deleteModal.locationId);
      setLocations(locations.filter((loc) => loc._id !== deleteModal.locationId));
      if (selectedLocation?._id === deleteModal.locationId) {
        setSelectedLocation(null);
      }
      toast.success('Location deleted successfully');
    } catch (error) {
      console.error('Failed to delete location:', error);
      toast.error('Failed to delete location. Please try again.');
    }
  };

  // Show authentication error if present
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">{authError}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Please ensure you have a valid instance token in the URL.
          </p>
        </div>
      </div>
    );
  }

  // Show widget selector when no compId is provided
  if (dashboardState === 'widget-selector') {
    return <WidgetSelector onSelect={handleWidgetSelected} />;
  }

  // Show loading state
  if (dashboardState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#1f2937' : '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src="/mapsy.png"
                alt="Mapsy Logo"
                className="h-8 w-8 object-contain"
              />
              <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                Mapsy Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {wixAuth.isAuthenticated() && wixAuth.getCompId() && (
                <>
                  <button
                    onClick={handleBackToWidgetSelector}
                    className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Switch Widget
                  </button>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Widget: <span className="font-mono font-semibold">{wixAuth.getCompId()}</span>
                  </div>
                </>
              )}
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          {/* Action Bar */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Locations
            </h2>
            <button
              onClick={() => {
                setIsAddingLocation(true);
                setSelectedLocation(null);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Location
            </button>
          </div>

          {/* Form or List */}
          {isAddingLocation || selectedLocation ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {isAddingLocation ? 'Add New Location' : 'Edit Location'}
              </h3>
              <LocationForm
                location={selectedLocation}
                onSubmit={
                  isAddingLocation ? handleCreateLocation : handleUpdateLocation
                }
                onCancel={() => {
                  setIsAddingLocation(false);
                  setSelectedLocation(null);
                }}
              />
            </div>
          ) : (
            <LocationList
              locations={locations}
              loading={loading}
              onEdit={setSelectedLocation}
              onDelete={handleDeleteLocation}
            />
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, locationId: null })}
        onConfirm={confirmDelete}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
        confirmText="Delete Location"
        cancelText="Keep Location"
        type="danger"
      />
    </div>
  );
}

export default App;