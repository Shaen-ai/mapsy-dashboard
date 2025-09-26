import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import LocationList from './components/LocationList';
import LocationForm from './components/LocationForm';
import ConfirmationModal from './components/ConfirmationModal';
import { api } from './services/api';
import { Location } from './types/location';

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; locationId: string | null }>({
    isOpen: false,
    locationId: null
  });

  useEffect(() => {
    fetchLocations();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src="/mapsy.png"
                alt="Mapsy Logo"
                className="h-8 w-8 object-contain"
              />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Mapsy Dashboard
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          {/* Action Bar */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
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