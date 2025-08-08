export default async function handler(req, res) {
  // Enable CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
  });

  const data = await response.json();

  if (data.success && data.score > 0.5) {
    return res.status(200).json({ success: true, score: data.score });
  }
  
  return res.status(400).json({ success: false });
}