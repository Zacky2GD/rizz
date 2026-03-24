export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, type } = req.body;

  const prompt = `Kamu adalah expert dating coach. Analisis ${type} berikut dan kasih rating 1-100.

Konten: "${text}"

Format response:
SCORE: [angka]
VERDICT: [satu kalimat]
ANALISIS: [2-3 kalimat]
SARAN: [2-3 poin]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com{process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error analyze';
    
    const scoreMatch = result.match(/SCORE:\s*(\d+)/);
    const verdictMatch = result.match(/VERDICT:\s*(.+)/);
    const analysisMatch = result.match(/ANALISIS:\s*([\s\S]+?)(?=SARAN:|$)/);
    const saranMatch = result.match(/SARAN:\s*([\s\S]+)/);

    res.status(200).json({
      score: parseInt(scoreMatch?.[1]) || 75,
      verdict: verdictMatch?.[1]?.trim() || 'Mantap!',
      analysis: analysisMatch?.[1]?.trim() || result,
      suggestions: saranMatch?.[1]?.trim() || 'Tingkatkan lagi!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
