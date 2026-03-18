import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const regionName = searchParams.get('region') || 'Nairobi';
  const isAllRegions = regionName.toLowerCase() === 'all regions' || regionName.toLowerCase() === 'all';
  
  if (isAllRegions) {
    try {
      const regionData = await Promise.all(
        Object.entries(regionToCityMap)
          .filter(([key]) => key !== 'all regions')
          .map(async ([region, city]) => {
            try {
              // Fetch forecast instead of current weather to get 'pop' (Probability of Precipitation)
              const res = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city},KE&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=1`
              );
              if (!res.ok) return null;
              const data = await res.json();
              const current = data.list[0];
              
              return {
                region: region.charAt(0).toUpperCase() + region.slice(1),
                city: city,
                temp: Math.round(current.main.temp),
                condition: current.weather[0].main,
                humidity: current.main.humidity,
                description: current.weather[0].description,
                rainChance: Math.round((current.pop || 0) * 100)
              };
            } catch (e) {
              return null;
            }
          })
      );

      const validRegions = regionData.filter(r => r !== null) as any[];
      
      const avgTemp = validRegions.length > 0 
        ? Math.round(validRegions.reduce((sum, r) => sum + r.temp, 0) / validRegions.length)
        : 25;
      
      const avgRainChance = validRegions.length > 0
        ? Math.round(validRegions.reduce((sum, r) => sum + r.rainChance, 0) / validRegions.length)
        : 0;
      
      const conditions = validRegions.map(r => r.condition);
      const mostCommonCondition = conditions.length > 0
        ? conditions.sort((a,b) =>
            conditions.filter(v => v===a).length - conditions.filter(v => v===b).length
          ).pop()
        : 'Cloudy';

      // If we have data for regions, return it plus a summary for the first one as 'current' for compatibility
      return NextResponse.json({
        all_regions: validRegions,
        current: {
          temp: avgTemp,
          condition: mostCommonCondition,
          rainChance: avgRainChance,
          summary: `Weather across ${validRegions.length} regions in Kenya. Average rain chance: ${avgRainChance}%`
        },
        forecast: [] // No forecast for all regions view
      });
    } catch (error) {
      console.error('Error fetching all regions weather:', error);
      return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
    }
  }

  // Normalize region name for mapping
  const city = regionToCityMap[regionName.toLowerCase()] || 'Nairobi';

  try {
    // Current Weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},KE&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!currentRes.ok) throw new Error(`Current weather API error: ${currentRes.status}`);
    const currentData = await currentRes.json();

    // 5-Day Forecast (contains 3-hour intervals)
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},KE&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!forecastRes.ok) throw new Error(`Forecast weather API error: ${forecastRes.status}`);
    const forecastData = await forecastRes.json();

    // Map current weather
    // Use the first forecast item's POP for the current rain chance as it's more accurate than current weather volume
    const rainChance = forecastData.list[0] ? Math.round((forecastData.list[0].pop || 0) * 100) : 0;

    const weatherInfo = {
      current: {
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        rainChance: rainChance,
        summary: `Currently ${currentData.weather[0].description} in ${city}. Humidity: ${currentData.main.humidity}%`
      },
      forecast: [] as any[]
    };

    // Extract one forecast per day (around noon) for the next 3 days
    const dailyForecasts = forecastData.list.filter((item: any) => item.dt_txt.includes('12:00:00'));
    
    weatherInfo.forecast = dailyForecasts.slice(0, 3).map((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayName = date.toLocaleDateString('en-KE', { weekday: 'long' });
      
      return {
        day: dayName,
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        rainChance: Math.round((item.pop || 0) * 100) // pop is 0-1
      };
    });

    // Special handling for rain chance if current doesn't have it explicitly
    // Use pop from the first available forecast as a proxy for today's rain chance if needed
    if (weatherInfo.current.rainChance === 0 && forecastData.list[0]) {
        weatherInfo.current.rainChance = Math.round((forecastData.list[0].pop || 0) * 100);
    }

    return NextResponse.json(weatherInfo);
  } catch (error: any) {
    console.error('Error fetching real-time weather:', error);
    
    // Fallback to static data if API fails
    return NextResponse.json({
      current: { 
        temp: 24, 
        condition: "Cloudy", 
        rainChance: 30, 
        summary: `Cloudy skies in ${city}. Data unavailable from service.` 
      },
      forecast: [
        { day: "Tomorrow", temp: 23, condition: "Partly Cloudy", rainChance: 20 },
        { day: "Day After", temp: 25, condition: "Sunny", rainChance: 10 },
        { day: "Next Day", temp: 22, condition: "Rain", rainChance: 60 }
      ],
      is_fallback: true
    });
  }
}
