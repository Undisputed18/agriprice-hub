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
      `Weather data for ${region} is currently unavailable. Provide general regional irrigation advice.`;

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an agricultural water management expert for a Kenyan farming app. Provide a concise irrigation alert based on current weather and forecast. Return ONLY JSON.',
        },
        {
          role: 'user',
          content: `Current Weather Context: ${weatherContext}. 
          Based on this weather data for the ${region} region of Kenya, provide a concise irrigation status, advice, and urgency level. 
          Format: { "status": string, "advice": string, "urgency": "low" | "medium" | "high" }`,
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
    console.error('Error fetching irrigation alert from Groq:', error);
    return NextResponse.json({
      status: "Adequate soil moisture",
      advice: "No immediate irrigation needed due to recent rainfall patterns.",
      urgency: "low",
      is_fallback: true
    });
  }
}
