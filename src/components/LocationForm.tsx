import { useForm, Controller } from 'react-hook-form';
import { Location } from '../types/location';
import { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';

interface LocationFormProps {
  location?: Location | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

interface DayHours {
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

type BusinessHoursState = Record<string, DayHours>;

// Parse "9:00 AM - 5:00 PM" or "Closed" into structured format
const parseBusinessHours = (hoursString: string): DayHours => {
  if (!hoursString || hoursString.toLowerCase() === 'closed') {
    return { isClosed: true, openTime: '09:00', closeTime: '17:00' };
  }

  // Try to parse "HH:MM AM/PM - HH:MM AM/PM" format
  const match = hoursString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let openHour = parseInt(match[1]);
    const openMin = match[2];
    const openPeriod = match[3]?.toUpperCase();
    let closeHour = parseInt(match[4]);
    const closeMin = match[5];
    const closePeriod = match[6]?.toUpperCase();

    // Convert to 24-hour format
    if (openPeriod === 'PM' && openHour !== 12) openHour += 12;
    if (openPeriod === 'AM' && openHour === 12) openHour = 0;
    if (closePeriod === 'PM' && closeHour !== 12) closeHour += 12;
    if (closePeriod === 'AM' && closeHour === 12) closeHour = 0;

    return {
      isClosed: false,
      openTime: `${openHour.toString().padStart(2, '0')}:${openMin}`,
      closeTime: `${closeHour.toString().padStart(2, '0')}:${closeMin}`,
    };
  }

  // Default if parsing fails
  return { isClosed: false, openTime: '09:00', closeTime: '17:00' };
};

// Convert 24-hour time to 12-hour format string
const formatTimeToString = (time24: string): string => {
  const [hourStr, min] = time24.split(':');
  let hour = parseInt(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${min} ${period}`;
};

// Convert DayHours to display string
const formatDayHours = (dayHours: DayHours): string => {
  if (dayHours.isClosed) return 'Closed';
  return `${formatTimeToString(dayHours.openTime)} - ${formatTimeToString(dayHours.closeTime)}`;
};

// Days of the week constants
const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const dayLabels: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const LocationForm: React.FC<LocationFormProps> = ({ location, onSubmit, onCancel }) => {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<Location>({
    defaultValues: location || {
      category: 'store',
      business_hours: {
        mon: '9:00 AM - 5:00 PM',
        tue: '9:00 AM - 5:00 PM',
        wed: '9:00 AM - 5:00 PM',
        thu: '9:00 AM - 5:00 PM',
        fri: '9:00 AM - 5:00 PM',
        sat: 'Closed',
        sun: 'Closed',
      },
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(location?.image_url || '');

  // Business hours state for timepickers
  const [businessHours, setBusinessHours] = useState<BusinessHoursState>(() => {
    const defaultHours = location?.business_hours || {
      mon: '9:00 AM - 5:00 PM',
      tue: '9:00 AM - 5:00 PM',
      wed: '9:00 AM - 5:00 PM',
      thu: '9:00 AM - 5:00 PM',
      fri: '9:00 AM - 5:00 PM',
      sat: 'Closed',
      sun: 'Closed',
    };
    const parsed: BusinessHoursState = {};
    days.forEach(day => {
      parsed[day] = parseBusinessHours(defaultHours[day as keyof typeof defaultHours] || 'Closed');
    });
    return parsed;
  });

  // Update form values when business hours change
  const updateBusinessHours = (day: string, field: keyof DayHours, value: string | boolean) => {
    setBusinessHours(prev => {
      const updated = {
        ...prev,
        [day]: { ...prev[day], [field]: value }
      };
      // Update form value with formatted string
      const formatted = formatDayHours(updated[day]);
      setValue(`business_hours.${day}` as any, formatted);
      return updated;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = (data: Location) => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('address', data.address);
    if (data.phone) formData.append('phone', data.phone);
    if (data.email) formData.append('email', data.email);
    if (data.website) formData.append('website', data.website);
    formData.append('category', data.category);

    if (data.business_hours) {
      Object.entries(data.business_hours).forEach(([day, hours]) => {
        if (hours) formData.append(`business_hours[${day}]`, hours);
      });
    }

    if (imageFile) {
      formData.append('image', imageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name *
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Business Name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            {...register('category')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="restaurant">Restaurant</option>
            <option value="store">Store</option>
            <option value="office">Office</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Address *
        </label>
        <Controller
          name="address"
          control={control}
          rules={{ required: 'Address is required' }}
          render={({ field }) => (
            <AddressAutocomplete
              value={field.value || ''}
              onChange={(value) => {
                field.onChange(value);
                setValue('address', value, { shouldValidate: true });
              }}
              placeholder="Start typing an address..."
              error={errors.address?.message}
              onPlaceSelect={(place) => {
                // Force update the form value when place is selected
                if (place.formatted_address) {
                  setValue('address', place.formatted_address, { shouldValidate: true });
                }
                // Also store coordinates if available
                if (place.geometry?.location) {
                  // Coordinates available: place.geometry.location.lat(), place.geometry.location.lng()
                }
              }}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            {...register('phone')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            {...register('email', {
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address',
              },
            })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="contact@business.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            {...register('website', {
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Must start with http:// or https://',
              },
            })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="https://example.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.website.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Business Hours
        </label>
        <div className="space-y-3">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <label className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                {dayLabels[day]}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessHours[day]?.isClosed || false}
                  onChange={(e) => updateBusinessHours(day, 'isClosed', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Closed</span>
              </label>
              {!businessHours[day]?.isClosed && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={businessHours[day]?.openTime || '09:00'}
                    onChange={(e) => updateBusinessHours(day, 'openTime', e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="time"
                    value={businessHours[day]?.closeTime || '17:00'}
                    onChange={(e) => updateBusinessHours(day, 'closeTime', e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
              {/* Hidden input for form submission */}
              <input
                type="hidden"
                {...register(`business_hours.${day}` as any)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-4 w-full max-w-xs h-40 object-cover rounded-lg"
          />
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {location ? 'Update' : 'Create'} Location
        </button>
      </div>
    </form>
  );
};

export default LocationForm;