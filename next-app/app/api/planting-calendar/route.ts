import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getWeatherData } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Nairobi';
  const today = new Date().toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' });

  try {
    const apiKey = process.env.GROQ_API_KEY;

    // Fetch real-time weather data
    const weatherData = await getWeatherData(region);
    const weatherContext = weatherData ? 
      `The current weather in ${region} is ${weatherData.current.condition} with a temperature of ${weatherData.current.temp}°C and a ${weatherData.current.rainChance}% chance of rain today. The forecast for the next 3 days is: ${weatherData.forecast.map((f: any) => `${f.day}: ${f.condition}, ${f.temp}°C, ${f.rainChance}% rain`).join('; ')}.` :
      `Weather data for ${region} is currently unavailable. Provide general regional planting advice.`;

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an agronomy expert for a Kenyan farming app. Today is ${today}. 
          Provide a concise planting calendar update based on current weather and season. Return ONLY JSON.`,
        },
        {
          role: 'user',
          content: `Current Weather Context: ${weatherContext}. 
          Based on this weather and the ${region} region of Kenya for this time of year, provide a concise planting calendar update. 
          Format: { "summary": string, "crops": [ { "name": string, "status": string, "advice": string } ] }`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return new NextResponse(content, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching planting calendar from Groq:', error);
    return NextResponse.json({
      summary: "Current season is optimal for most cereals.",
      crops: [
        { name: "Maize", status: "Planting season", advice: "Ensure soil is moist before planting." },
        { name: "Beans", status: "Growing", advice: "Monitor for aphids." }
      ],
      is_fallback: true
    });
  }
}
