import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

async function test() {
  try {
    const apiKey = fs.readFileSync('groq.api', 'utf8').trim();
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: 'Say hello in JSON format' },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    console.log('SUCCESS:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.response) {
      console.log('STATUS:', error.response.status);
      console.log('DATA:', await error.response.json());
    }
  }
}

test();
