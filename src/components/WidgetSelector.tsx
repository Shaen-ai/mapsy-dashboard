import { useState, useEffect } from 'react';
import { MapPin, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { api, Widget } from '../services/api';
import { wixAuth } from '../services/wixAuth';

interface WidgetSelectorProps {
  onSelect: (compId: string) => void;
}

function WidgetSelector({ onSelect }: WidgetSelectorProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWidgets();
      setWidgets(data);
    } catch (err) {
      console.error('Failed to fetch widgets:', err);
      setError('Failed to load widgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWidget = (compId: string) => {
    wixAuth.setCompId(compId);
    // Update URL with compId
    const url = new URL(window.location.href);
    url.searchParams.set('compId', compId);
    window.history.pushState({}, '', url.toString());
    onSelect(compId);
  };

  const openWixEditor = () => {
    // Wix Editor URL - users can customize this based on their site
    window.open('https://manage.wix.com/', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading widgets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchWidgets}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No widgets installed
  if (widgets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No Mapsy Widgets Found
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            You haven't added any Mapsy widgets to your site yet. Add a Mapsy widget in the Wix Editor to start managing your locations.
          </p>
          <button
            onClick={openWixEditor}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Open Wix Editor
          </button>
          <p className="text-sm text-gray-400 mt-4">
            After adding a widget, refresh this page to see it here.
          </p>
        </div>
      </div>
    );
  }

  // Widget selector
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Select a Widget
          </h2>
          <p className="text-gray-600">
            Choose which Mapsy widget you want to manage locations for.
          </p>
        </div>

        <div className="space-y-3">
          {widgets.map((widget) => (
            <button
              key={widget.compId}
              onClick={() => handleSelectWidget(widget.compId)}
              className="w-full p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mr-4 group-hover:bg-blue-100 transition">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {widget.widgetName || 'Unnamed Widget'}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      {widget.compId}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    widget.defaultView === 'map'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {widget.defaultView === 'map' ? 'Map View' : 'List View'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(widget.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't see your widget? Make sure you've saved your Wix site after adding the widget.
        </p>
      </div>
    </div>
  );
}

export default WidgetSelector;
