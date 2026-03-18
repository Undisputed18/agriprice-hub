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
      `Weather data for ${region} is currently unavailable. Provide general regional tips.`;

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an agricultural expert providing tips for Kenyan farmers based on current local weather conditions. Provide 3 concise, actionable farming tips. Return ONLY JSON.',
        },
        {
          role: 'user',
          content: `Current Weather Context: ${weatherContext}. 
          Based on this weather and the ${region} region of Kenya, provide 3 highly relevant and actionable farming tips for today. 
          Format: { "tips": [ { "id": number, "text": string } ] }`,
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
    console.error('Error fetching tips from Groq:', error);
    return NextResponse.json({
      tips: [
        { id: 1, text: "Check your local weather forecast daily to plan your farming activities." },
        { id: 2, text: "Ensure proper drainage in your fields, especially if rain is expected." },
        { id: 3, text: "Monitor your crops regularly for any signs of weather-related stress." }
      ],
      is_fallback: true
    });
  }
}
