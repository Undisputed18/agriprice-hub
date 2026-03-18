const Groq = require('groq-sdk');
const fs = require('fs');

async function test() {
  const apiKey = fs.readFileSync('next-app/groq.api', 'utf8').trim();
  const groq = new Groq({ apiKey });

  try {
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
  }
}

test();
