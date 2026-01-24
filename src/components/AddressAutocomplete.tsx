import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

// Cache the loader promise to avoid reloading Google Maps
let loaderPromise: Promise<typeof google> | null = null;

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = '123 Main St, City, State ZIP',
  className = '',
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const isSelectingRef = useRef(false);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Google Maps API key is missing');
      return;
    }

    // Use cached loader promise if available
    if (!loaderPromise) {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places'],
      });
      loaderPromise = loader.load();
    }

    loaderPromise
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        setIsLoaded(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const input = inputRef.current;

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      types: ['geocode'],
    });

    // Add place changed listener
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (place && place.formatted_address) {
        isSelectingRef.current = true;
        const fullAddress = place.formatted_address;

        setInternalValue(fullAddress);

        if (inputRef.current) {
          inputRef.current.value = fullAddress;
        }

        onChange(fullAddress);

        if (onPlaceSelect) {
          onPlaceSelect(place);
        }

        setTimeout(() => {
          isSelectingRef.current = false;
        }, 100);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    // Delay updating parent to avoid conflicts with autocomplete
    if (!isSelectingRef.current) {
      setTimeout(() => {
        if (!isSelectingRef.current) {
          onChange(newValue);
        }
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Prevent form submission when selecting from autocomplete
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && (pacContainer as HTMLElement).style.display !== 'none') {
        e.preventDefault();
        const firstResult = pacContainer.querySelector('.pac-item') as HTMLElement;
        if (firstResult) {
          firstResult.click();
        }
      }
    }
  };

  const handleBlur = () => {
    // After blur, ensure the value is synced
    setTimeout(() => {
      const currentValue = inputRef.current?.value || '';
      if (currentValue !== internalValue) {
        setInternalValue(currentValue);
        onChange(currentValue);
      }
    }, 200);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
          error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default AddressAutocomplete;
