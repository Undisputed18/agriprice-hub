import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getWeatherData } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Nairobi';

  try {
    const apiKey = process.env.GROQ_API_KEY;

    // Fetch real-time weather data
    const weatherData = await getWeatherData(region);
    const weatherContext = weatherData ? 
      `The current weather in ${region} is ${weatherData.current.condition} with a temperature of ${weatherData.current.temp}°C and a ${weatherData.current.rainChance}% chance of rain today. The forecast for the next 3 days is: ${weatherData.forecast.map((f: any) => `${f.day}: ${f.condition}, ${f.temp}°C, ${f.rainChance}% rain`).join('; ')}.` :
      `Weather data for ${region} is currently unavailable. Provide general regional fertilizer advice.`;

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an agricultural soil and fertilizer expert for a Kenyan farming app. Provide a concise fertilizer recommendation based on regional soil and current weather (e.g., avoid application if heavy rain is expected). Return ONLY JSON.',
        },
        {
          role: 'user',
          content: `Current Weather Context: ${weatherContext}. 
          Based on this weather and the ${region} region of Kenya, provide a concise fertilizer recommendation, type, and application rate. 
          Format: { "recommendation": string, "type": string, "applicationRate": string }`,
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
    console.error('Error fetching fertilizer recommendation from Groq:', error);
    
    // Return fallback data instead of 500 error to keep the dashboard functional
    return NextResponse.json({
      recommendation: "Based on general soil conditions in this region, use a balanced NPK fertilizer for optimal crop growth.",
      type: "NPK 17:17:17",
      applicationRate: "50kg per acre",
      is_fallback: true
    });
  }
}
