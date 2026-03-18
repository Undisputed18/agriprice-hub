import Groq from 'groq-sdk';
import fs from 'fs';

async function test() {
  const region = 'All Regions';
  try {
    const apiKey = fs.readFileSync('groq.api', 'utf8').trim();
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a market analyst for a Kenyan agricultural app. Provide a concise market summary based on current trends in the specified region. Return ONLY JSON.',
        },
        {
          role: 'user',
          content: `Get market summary for ${region} region, Kenya. Format: { "highestPrice": { "commodity": string, "price": string }, "lowestPrice": { "commodity": string, "price": string }, "trending": { "commodity": string, "change": string }, "marketActivity": string }`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });

    console.log('SUCCESS:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

test();
