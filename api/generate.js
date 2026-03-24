export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.body;
  
  const prompts = {
    gombal: `Buatkan 1 pickup line gombal cheesy ala anak Jaksel. Maksimal 2 kalimat. Langsung kasih line-nya aja.`,
    rizz: `Buatkan 1 kalimat rizz/charming yang confident tapi humble. Natural, maksimal 25 kata.`,
    pantun: `Buatkan 1 pantun 4 baris A-B-A-B yang isinya flirt/cinta tapi sopan.`
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompts[type] || prompts.rizz }] }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error generate';
    
    res.status(200).json({ result: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
