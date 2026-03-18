// lib/weather.ts

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const regionToCityMap: Record<string, string> = {
  'all regions': 'Nairobi',
  'nairobi': 'Nairobi',
  'central': 'Nyeri',
  'coast': 'Mombasa',
  'eastern': 'Embu',
  'north eastern': 'Garissa',
  'nyanza': 'Kisumu',
  'rift valley': 'Eldoret',
  'western': 'Kakamega'
};

export async function getWeatherData(regionName: string) {
  const city = regionToCityMap[regionName.toLowerCase()] || 'Nairobi';

  try {
    // Current Weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},KE&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!currentRes.ok) throw new Error(`Current weather API error: ${currentRes.status}`);
    const currentData = await currentRes.json();

    // 5-Day Forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},KE&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!forecastRes.ok) throw new Error(`Forecast weather API error: ${forecastRes.status}`);
    const forecastData = await forecastRes.json();

    const rainChance = forecastData.list[0] ? Math.round((forecastData.list[0].pop || 0) * 100) : 0;

    const weatherInfo = {
      current: {
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        rainChance: rainChance,
        summary: `Currently ${currentData.weather[0].description} in ${city}. Humidity: ${currentData.main.humidity}%`
      },
      forecast: forecastData.list.filter((item: any) => item.dt_txt.includes('12:00:00')).slice(0, 3).map((item: any) => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-KE', { weekday: 'long' });
        return {
          day: dayName,
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          rainChance: Math.round((item.pop || 0) * 100)
        };
      })
    };

    return weatherInfo;
  } catch (error) {
    console.error('Error fetching weather data in helper:', error);
    return null;
  }
}
