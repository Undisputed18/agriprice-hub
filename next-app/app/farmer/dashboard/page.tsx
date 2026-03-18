// app/farmer/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';

interface MarketPrice {
  id: number;
commodity: string;
  price: string;
  unit: string;
  market: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  lastUpdate: string;
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [farmingTips, setFarmingTips] = useState<any[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [marketSummary, setMarketSummary] = useState<any>(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [plantingCalendar, setPlantingCalendar] = useState<any>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [irrigationAlert, setIrrigationAlert] = useState<any>(null);
  const [isLoadingIrrigation, setIsLoadingIrrigation] = useState(false);
  const [fertilizerRec, setFertilizerRec] = useState<any>(null);
  const [isLoadingFertilizer, setIsLoadingFertilizer] = useState(false);

  const regions = [
    { id: 'all', name: 'All Regions' },
    { id: 'nairobi', name: 'Nairobi' },
    { id: 'central', name: 'Central' },
    { id: 'coast', name: 'Coast' },
    { id: 'eastern', name: 'Eastern' },
    { id: 'north-eastern', name: 'North Eastern' },
    { id: 'nyanza', name: 'Nyanza' },
    { id: 'rift', name: 'Rift Valley' },
    { id: 'western', name: 'Western' }
  ];

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      try {
        const regionName = regions.find(r => r.id === selectedRegion)?.name || 'Nairobi';
        const response = await fetch(`/api/weather?region=${encodeURIComponent(regionName)}`);
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [selectedRegion]);

  useEffect(() => {
    const fetchTips = async () => {
      setIsLoadingTips(true);
      try {
        const regionName = regions.find(r => r.id === selectedRegion)?.name || 'Nairobi';
        const response = await fetch(`/api/farming-tips?region=${encodeURIComponent(regionName)}`);
        const data = await response.json();
        setFarmingTips(data.tips || []);
      } catch (error) {
        console.error('Error fetching tips:', error);
      } finally {
        setIsLoadingTips(false);
      }
    };

    fetchTips();
  }, [selectedRegion]);

  useEffect(() => {
    const fetchMarketSummary = async () => {
      setIsLoadingMarket(true);
      try {
        const regionName = regions.find(r => r.id === selectedRegion)?.name || 'Nairobi';
        const response = await fetch(`/api/market-summary?region=${encodeURIComponent(regionName)}`);
        const data = await response.json();
        setMarketSummary(data);
      } catch (error) {
        console.error('Error fetching market summary:', error);
      } finally {
        setIsLoadingMarket(false);
      }
    };

    fetchMarketSummary();
  }, [selectedRegion]);

  useEffect(() => {
    const fetchCalendar = async () => {
      setIsLoadingCalendar(true);
      try {
        const regionName = regions.find(r => r.id === selectedRegion)?.name || 'Nairobi';
        const response = await fetch(`/api/planting-calendar?region=${encodeURIComponent(regionName)}`);
        const data = await response.json();
        setPlantingCalendar(data);
      } catch (error) {
        console.error('Error fetching planting calendar:', error);
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    fetchCalendar();
  }, [selectedRegion]);

  useEffect(() => {
    const fetchIrrigationAlert = async () => {
      setIsLoadingIrrigation(true);
      try {
        const regionName = regions.find(r => r.id === selectedRegion)?.name || 'Nairobi';
        const response = await fetch(`/api/irrigation-alert?region=${encodeURIComponent(regionName)}`);
        const data = await response.json();
        setIrrigationAlert(data);
      } catch (error) {
        console.error('Error fetching irrigation alert:', error);
      } finally {
        setIsLoadingIrrigation(false);
      }
    };

    fetchIrrigationAlert();
  }, [selectedRegion]);

  useEffect(() => {
    const fetchFertilizerRec = async () => {
      setIsLoadingFertilizer(true);
      try {
        const regionName = regions.find(r => r.id === selectedRegion)?.name || 'Nairobi';
        const response = await fetch(`/api/fertilizer-recommendation?region=${encodeURIComponent(regionName)}`);
        const data = await response.json();
        setFertilizerRec(data);
      } catch (error) {
        console.error('Error fetching fertilizer recommendation:', error);
      } finally {
        setIsLoadingFertilizer(false);
      }
    };

    fetchFertilizerRec();
  }, [selectedRegion]);

  const marketPrices: MarketPrice[] = [
    {
      id: 1,
      commodity: 'Maize',
      price: 'KES 4,200',
      unit: 'Per 90kg bag',
      market: 'Nairobi Market',
      trend: 'stable',
      change: 0,
      lastUpdate: '2 min ago'
    },
    {
      id: 2,
      commodity: 'Beans',
      price: 'KES 6,800',
      unit: 'Per 90kg bag',
      market: 'Nairobi Market',
      trend: 'up',
      change: 2.5,
      lastUpdate: '2 min ago'
    },
    {
      id: 3,
      commodity: 'Milk',
      price: 'KES 55',
      unit: 'Per liter',
      market: 'Nairobi Market',
      trend: 'up',
      change: 1.2,
      lastUpdate: '2 min ago'
    },
    {
      id: 4,
      commodity: 'Stable',
      price: 'KES 3,900',
      unit: 'Per 90kg bag',
      market: 'Nairobi Market',
      trend: 'stable',
      change: 0,
      lastUpdate: '2 min ago'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '📊';
    }
  };

  const getTrendColor = (trend: string) => {
    switch(trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition?.toLowerCase() || '';
    if (c.includes('cloud')) return '☁️';
    if (c.includes('rain')) return '🌧️';
    if (c.includes('clear') || c.includes('sun')) return '☀️';
    if (c.includes('thunder')) return '⛈️';
    if (c.includes('drizzle')) return '🌦️';
    if (c.includes('snow')) return '❄️';
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return '🌫️';
    return '☀️';
  };

  const formattedDate = currentTime.toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Header with farm theme */}
        <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-xl md:text-2xl">🌾</span>
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    AgriPrice
                  </h1>
                  <span className="text-xs md:text-sm text-green-600 font-medium hidden xs:block">Farmer&apos;s Intelligence</span>
                  <span className="text-xs md:text-sm text-green-600 font-medium xs:hidden">Farmer</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 md:space-x-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">Welcome back,</p>
                  <p className="text-sm md:text-base font-semibold text-gray-800">{user?.full_name || 'Farmer'}</p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex items-center justify-center text-white font-bold text-base md:text-lg">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'F'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Welcome Banner */}
          <div className="relative mb-8 overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 md:h-40 w-32 md:w-40 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 md:h-40 w-32 md:w-40 rounded-full bg-black/10 blur-2xl"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <span className="text-3xl md:text-4xl">🌱</span>
                <h2 className="text-xl md:text-3xl font-bold truncate">Welcome Back, {user?.full_name?.split(' ')[0] || 'Farmer'}!</h2>
              </div>
              <p className="text-base md:text-xl text-green-100 max-w-2xl opacity-90">
                Your personalized agricultural intelligence dashboard
              </p>
              
              {/* Weather Widget */}
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm text-green-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl">{isLoadingWeather ? '⏳' : getWeatherIcon(weatherData?.current?.condition)}</span>
                  <div>
                    <p className="font-medium text-xs md:text-sm">{regions.find(r => r.id === selectedRegion)?.name || 'Nairobi'} Region</p>
                    <p className="text-green-200 text-xs md:text-sm">
                      {isLoadingWeather ? 'Loading...' : `${weatherData?.current?.temp || '28'}°C | ${weatherData?.current?.condition || 'Clear'}`}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block h-8 w-px bg-green-300/30"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl">🌧️</span>
                  <div>
                    <p className="font-medium text-xs md:text-sm">Rain Chance</p>
                    <p className="text-green-200 text-xs md:text-sm">
                      {isLoadingWeather ? '...' : `${weatherData?.current?.rainChance || '0'}% chance today`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Region Selector */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Filter by region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Updated hourly</span>
              <span className="mx-2">•</span>
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Main Content - Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>{isLoadingWeather ? '⏳' : getWeatherIcon(weatherData?.current?.condition)}</span>
                {selectedRegion === 'all' ? 'Regional Weather Summary' : 'Weather Forecast'}
              </h3>
              <div className="space-y-4">
                {isLoadingWeather ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                  </div>
                ) : weatherData?.all_regions ? (
                  <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {weatherData.all_regions.map((reg: any, idx: number) => (
                      <div key={idx} className="bg-white/10 rounded-lg p-2 border border-white/10 hover:bg-white/20 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">{reg.region}</span>
                          <span className="text-sm">{getWeatherIcon(reg.condition)}</span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-lg font-bold">{reg.temp}°C</span>
                          <span className="text-[10px] text-blue-200">🌧️ {reg.rainChance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : weatherData ? (
                  <>
                    {/* Today */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-medium">Today</span>
                      <div className="flex items-center gap-3">
                        <span>{getWeatherIcon(weatherData.current?.condition)} {weatherData.current?.temp}°C</span>
                        <span className="text-blue-200">{weatherData.current?.rainChance || 0}% rain</span>
                      </div>
                    </div>
                    {/* Next 3 days */}
                    {weatherData.forecast?.slice(0, 3).map((day: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{day.day}</span>
                        <div className="flex items-center gap-3">
                          <span>{getWeatherIcon(day.condition)} {day.temp}°C</span>
                          <span className="text-blue-200">{day.rainChance}% rain</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Today</span>
                      <div className="flex items-center gap-3">
                        <span>☀️ 28°C</span>
                        <span className="text-blue-200">0% rain</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tomorrow</span>
                      <div className="flex items-center gap-3">
                        <span>⛅ 26°C</span>
                        <span className="text-blue-200">20% rain</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sunday</span>
                      <div className="flex items-center gap-3">
                        <span>☀️ 27°C</span>
                        <span className="text-blue-200">0% rain</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Farming Tips Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🌱</span>
                Farming Tips
              </h3>
              <div className="space-y-3">
                {isLoadingTips ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                  </div>
                ) : farmingTips.length > 0 ? (
                  farmingTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-green-200">•</span>
                      <p className="text-sm">{tip.text}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <span className="text-green-200">•</span>
                      <p className="text-sm">Best time to plant maize: Coming week</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-200">•</span>
                      <p className="text-sm">Fertilizer prices expected to drop by 5%</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-200">•</span>
                      <p className="text-sm">Dairy farmers: Milk demand up this season</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Market Summary Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span>
                Market Summary
              </h3>
              <div className="space-y-3">
                {isLoadingMarket ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ) : marketSummary ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Highest price</span>
                      <span className="font-semibold text-gray-800">
                        {marketSummary.highestPrice?.commodity} ({marketSummary.highestPrice?.price})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lowest price</span>
                      <span className="font-semibold text-gray-800">
                        {marketSummary.lowestPrice?.commodity} ({marketSummary.lowestPrice?.price})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trending ↑</span>
                      <span className="font-semibold text-green-600">
                        {marketSummary.trending?.commodity} ({marketSummary.trending?.change})
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-green-100">
                      <span className="text-sm text-gray-600">Market activity</span>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {marketSummary.marketActivity}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Highest price</span>
                      <span className="font-semibold text-gray-800">Beans (KES 6,800)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lowest price</span>
                      <span className="font-semibold text-gray-800">Milk (KES 55/L)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trending ↑</span>
                      <span className="font-semibold text-green-600">Beans (+2.5%)</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-green-100">
                      <span className="text-sm text-gray-600">Market activity</span>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">High demand</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-green-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                  📅
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Planting Calendar</h4>
                  <p className="text-sm text-gray-600">Optimal times for {regions.find(r => r.id === selectedRegion)?.name || 'your region'}</p>
                </div>
              </div>
              {isLoadingCalendar ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : plantingCalendar ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium">{plantingCalendar.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {plantingCalendar.crops?.slice(0, 2).map((crop: any, idx: number) => (
                      <span key={idx} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                        {crop.name}: {crop.status}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Maize: Next 2 weeks • Beans: Ready for harvest</p>
              )}
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-green-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                  💧
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">Irrigation Alert</h4>
                    {irrigationAlert && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                        irrigationAlert.urgency === 'high' ? 'bg-red-100 text-red-700' :
                        irrigationAlert.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {irrigationAlert.urgency}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Water requirements</p>
                </div>
              </div>
              {isLoadingIrrigation ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : irrigationAlert ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800">{irrigationAlert.status}</p>
                  <p className="text-xs text-gray-600">{irrigationAlert.advice}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Low rainfall expected • Increase irrigation by 20%</p>
              )}
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-green-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                  🧪
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Fertilizer Guide</h4>
                  <p className="text-sm text-gray-600">{regions.find(r => r.id === selectedRegion)?.name || 'Local'} Soil Advice</p>
                </div>
              </div>
              {isLoadingFertilizer ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              ) : fertilizerRec ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800">{fertilizerRec.type} ({fertilizerRec.applicationRate})</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{fertilizerRec.recommendation}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Monthly meeting: Friday 3pm • New subsidy program</p>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t border-green-200 bg-white/50 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 flex items-center gap-4">
                <span>© 2026 AgriPrice</span>
                <span className="w-1 h-1 bg-green-300 rounded-full"></span>
                <span>{formattedDate}</span>
              </div>
              <div className="text-sm text-green-600 font-medium italic">
                Empowering Kenyan Farmers with AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </ProtectedRoute>
  );
} 