// List of cities for prayer times
// Organized by country with city name

export interface CityOption {
  city: string;
  country: string;
  label: string; // Display name
}

export const CITIES: CityOption[] = [
  // United Kingdom
  { city: 'London', country: 'United Kingdom', label: 'London, UK' },
  { city: 'Birmingham', country: 'United Kingdom', label: 'Birmingham, UK' },
  { city: 'Manchester', country: 'United Kingdom', label: 'Manchester, UK' },
  { city: 'Leeds', country: 'United Kingdom', label: 'Leeds, UK' },
  { city: 'Bradford', country: 'United Kingdom', label: 'Bradford, UK' },
  { city: 'Glasgow', country: 'United Kingdom', label: 'Glasgow, UK' },
  { city: 'Edinburgh', country: 'United Kingdom', label: 'Edinburgh, UK' },
  { city: 'Leicester', country: 'United Kingdom', label: 'Leicester, UK' },
  { city: 'Luton', country: 'United Kingdom', label: 'Luton, UK' },
  { city: 'Cardiff', country: 'United Kingdom', label: 'Cardiff, UK' },

  // United States
  { city: 'New York', country: 'United States', label: 'New York, USA' },
  { city: 'Los Angeles', country: 'United States', label: 'Los Angeles, USA' },
  { city: 'Chicago', country: 'United States', label: 'Chicago, USA' },
  { city: 'Houston', country: 'United States', label: 'Houston, USA' },
  { city: 'Detroit', country: 'United States', label: 'Detroit, USA' },
  { city: 'Dallas', country: 'United States', label: 'Dallas, USA' },
  { city: 'Philadelphia', country: 'United States', label: 'Philadelphia, USA' },
  { city: 'Atlanta', country: 'United States', label: 'Atlanta, USA' },
  { city: 'Miami', country: 'United States', label: 'Miami, USA' },
  { city: 'San Francisco', country: 'United States', label: 'San Francisco, USA' },

  // Canada
  { city: 'Toronto', country: 'Canada', label: 'Toronto, Canada' },
  { city: 'Montreal', country: 'Canada', label: 'Montreal, Canada' },
  { city: 'Vancouver', country: 'Canada', label: 'Vancouver, Canada' },
  { city: 'Calgary', country: 'Canada', label: 'Calgary, Canada' },
  { city: 'Ottawa', country: 'Canada', label: 'Ottawa, Canada' },
  { city: 'Edmonton', country: 'Canada', label: 'Edmonton, Canada' },

  // UAE
  { city: 'Dubai', country: 'United Arab Emirates', label: 'Dubai, UAE' },
  { city: 'Abu Dhabi', country: 'United Arab Emirates', label: 'Abu Dhabi, UAE' },
  { city: 'Sharjah', country: 'United Arab Emirates', label: 'Sharjah, UAE' },

  // Saudi Arabia
  { city: 'Makkah', country: 'Saudi Arabia', label: 'Makkah, Saudi Arabia' },
  { city: 'Madinah', country: 'Saudi Arabia', label: 'Madinah, Saudi Arabia' },
  { city: 'Riyadh', country: 'Saudi Arabia', label: 'Riyadh, Saudi Arabia' },
  { city: 'Jeddah', country: 'Saudi Arabia', label: 'Jeddah, Saudi Arabia' },
  { city: 'Dammam', country: 'Saudi Arabia', label: 'Dammam, Saudi Arabia' },

  // Pakistan
  { city: 'Karachi', country: 'Pakistan', label: 'Karachi, Pakistan' },
  { city: 'Lahore', country: 'Pakistan', label: 'Lahore, Pakistan' },
  { city: 'Islamabad', country: 'Pakistan', label: 'Islamabad, Pakistan' },
  { city: 'Rawalpindi', country: 'Pakistan', label: 'Rawalpindi, Pakistan' },
  { city: 'Faisalabad', country: 'Pakistan', label: 'Faisalabad, Pakistan' },
  { city: 'Peshawar', country: 'Pakistan', label: 'Peshawar, Pakistan' },

  // India
  { city: 'Mumbai', country: 'India', label: 'Mumbai, India' },
  { city: 'Delhi', country: 'India', label: 'Delhi, India' },
  { city: 'Hyderabad', country: 'India', label: 'Hyderabad, India' },
  { city: 'Bangalore', country: 'India', label: 'Bangalore, India' },
  { city: 'Chennai', country: 'India', label: 'Chennai, India' },
  { city: 'Kolkata', country: 'India', label: 'Kolkata, India' },
  { city: 'Lucknow', country: 'India', label: 'Lucknow, India' },

  // Bangladesh
  { city: 'Dhaka', country: 'Bangladesh', label: 'Dhaka, Bangladesh' },
  { city: 'Chittagong', country: 'Bangladesh', label: 'Chittagong, Bangladesh' },
  { city: 'Sylhet', country: 'Bangladesh', label: 'Sylhet, Bangladesh' },

  // Malaysia
  { city: 'Kuala Lumpur', country: 'Malaysia', label: 'Kuala Lumpur, Malaysia' },
  { city: 'Penang', country: 'Malaysia', label: 'Penang, Malaysia' },
  { city: 'Johor Bahru', country: 'Malaysia', label: 'Johor Bahru, Malaysia' },

  // Indonesia
  { city: 'Jakarta', country: 'Indonesia', label: 'Jakarta, Indonesia' },
  { city: 'Surabaya', country: 'Indonesia', label: 'Surabaya, Indonesia' },
  { city: 'Bandung', country: 'Indonesia', label: 'Bandung, Indonesia' },

  // Turkey
  { city: 'Istanbul', country: 'Turkey', label: 'Istanbul, Turkey' },
  { city: 'Ankara', country: 'Turkey', label: 'Ankara, Turkey' },
  { city: 'Izmir', country: 'Turkey', label: 'Izmir, Turkey' },

  // Egypt
  { city: 'Cairo', country: 'Egypt', label: 'Cairo, Egypt' },
  { city: 'Alexandria', country: 'Egypt', label: 'Alexandria, Egypt' },

  // Jordan
  { city: 'Amman', country: 'Jordan', label: 'Amman, Jordan' },

  // Kuwait
  { city: 'Kuwait City', country: 'Kuwait', label: 'Kuwait City, Kuwait' },

  // Qatar
  { city: 'Doha', country: 'Qatar', label: 'Doha, Qatar' },

  // Bahrain
  { city: 'Manama', country: 'Bahrain', label: 'Manama, Bahrain' },

  // Oman
  { city: 'Muscat', country: 'Oman', label: 'Muscat, Oman' },

  // Morocco
  { city: 'Casablanca', country: 'Morocco', label: 'Casablanca, Morocco' },
  { city: 'Marrakech', country: 'Morocco', label: 'Marrakech, Morocco' },
  { city: 'Rabat', country: 'Morocco', label: 'Rabat, Morocco' },

  // France
  { city: 'Paris', country: 'France', label: 'Paris, France' },
  { city: 'Marseille', country: 'France', label: 'Marseille, France' },
  { city: 'Lyon', country: 'France', label: 'Lyon, France' },

  // Germany
  { city: 'Berlin', country: 'Germany', label: 'Berlin, Germany' },
  { city: 'Munich', country: 'Germany', label: 'Munich, Germany' },
  { city: 'Frankfurt', country: 'Germany', label: 'Frankfurt, Germany' },
  { city: 'Cologne', country: 'Germany', label: 'Cologne, Germany' },

  // Netherlands
  { city: 'Amsterdam', country: 'Netherlands', label: 'Amsterdam, Netherlands' },
  { city: 'Rotterdam', country: 'Netherlands', label: 'Rotterdam, Netherlands' },

  // Belgium
  { city: 'Brussels', country: 'Belgium', label: 'Brussels, Belgium' },

  // Australia
  { city: 'Sydney', country: 'Australia', label: 'Sydney, Australia' },
  { city: 'Melbourne', country: 'Australia', label: 'Melbourne, Australia' },
  { city: 'Brisbane', country: 'Australia', label: 'Brisbane, Australia' },
  { city: 'Perth', country: 'Australia', label: 'Perth, Australia' },

  // South Africa
  { city: 'Johannesburg', country: 'South Africa', label: 'Johannesburg, South Africa' },
  { city: 'Cape Town', country: 'South Africa', label: 'Cape Town, South Africa' },
  { city: 'Durban', country: 'South Africa', label: 'Durban, South Africa' },

  // Singapore
  { city: 'Singapore', country: 'Singapore', label: 'Singapore' },

  // Nigeria
  { city: 'Lagos', country: 'Nigeria', label: 'Lagos, Nigeria' },
  { city: 'Abuja', country: 'Nigeria', label: 'Abuja, Nigeria' },
  { city: 'Kano', country: 'Nigeria', label: 'Kano, Nigeria' },

  // Kenya
  { city: 'Nairobi', country: 'Kenya', label: 'Nairobi, Kenya' },
  { city: 'Mombasa', country: 'Kenya', label: 'Mombasa, Kenya' },

  // Sweden
  { city: 'Stockholm', country: 'Sweden', label: 'Stockholm, Sweden' },
  { city: 'Malmo', country: 'Sweden', label: 'Malmo, Sweden' },

  // Norway
  { city: 'Oslo', country: 'Norway', label: 'Oslo, Norway' },

  // Denmark
  { city: 'Copenhagen', country: 'Denmark', label: 'Copenhagen, Denmark' },

  // Spain
  { city: 'Madrid', country: 'Spain', label: 'Madrid, Spain' },
  { city: 'Barcelona', country: 'Spain', label: 'Barcelona, Spain' },

  // Italy
  { city: 'Rome', country: 'Italy', label: 'Rome, Italy' },
  { city: 'Milan', country: 'Italy', label: 'Milan, Italy' },

  // Ireland
  { city: 'Dublin', country: 'Ireland', label: 'Dublin, Ireland' },

  // New Zealand
  { city: 'Auckland', country: 'New Zealand', label: 'Auckland, New Zealand' },
  { city: 'Wellington', country: 'New Zealand', label: 'Wellington, New Zealand' },
];

// Group cities by country for easier browsing
export const CITIES_BY_COUNTRY = CITIES.reduce((acc, city) => {
  if (!acc[city.country]) {
    acc[city.country] = [];
  }
  acc[city.country].push(city);
  return acc;
}, {} as Record<string, CityOption[]>);

// Get sorted list of countries
export const COUNTRIES = Object.keys(CITIES_BY_COUNTRY).sort();
