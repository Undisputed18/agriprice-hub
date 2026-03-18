import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Nairobi';

  try {
    const apiKey = process.env.GROQ_API_KEY;

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a market analyst for a Kenyan agricultural app. Provide a concise market summary. Return ONLY JSON.',
        },
        {
          role: 'user',
          content: `Get market summary for ${region} region, Kenya. Format: { "highestPrice": { "commodity": string, "price": string }, "lowestPrice": { "commodity": string, "price": string }, "trending": { "commodity": string, "change": string }, "marketActivity": string }`,
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
    console.error('Error fetching market summary from Groq:', error);
    return NextResponse.json({
      highestPrice: { commodity: "Beans", price: "KES 6,800/bag" },
      lowestPrice: { commodity: "Milk", price: "KES 55/L" },
      trending: { commodity: "Maize", change: "+2.5%" },
      marketActivity: "High demand across regions",
      is_fallback: true
    });
  }
}
