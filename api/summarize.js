export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadData, timelineEvents } = req.body;

  if (!leadData) {
    return res.status(400).json({ error: 'Lead data required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are a mortgage CRM assistant for Nick Flores at Sunnyhill Financial in Las Vegas NV.

Summarize this lead in 3-4 sentences. Include their loan type, property goals, financial profile, last contact, and one specific recommended next step. Be direct and actionable. Write as if briefing Nick before a call.

Lead data: ${JSON.stringify(leadData)}
Timeline: ${JSON.stringify(timelineEvents || [])}`,
        }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    const summary = data.content[0].text;
    return res.status(200).json({ summary });

  } catch (error) {
    console.error('Summary error:', error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
