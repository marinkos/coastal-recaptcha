export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.coastaldebt.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  // Use environment variable
  const API_KEY = process.env.RECAPTCHA_API_KEY;
  
  const requestBody = {
    event: {
      token: token,
      expectedAction: 'submit',
      siteKey: "6LeqYp0rAAAAAOiJBe8DaA55iCdx5AlmnYgt7ZDz"
    }
  };

  try {
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/taboola-468311/assessments?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();
    
    // Log for debugging
    console.log('reCAPTCHA response:', data);
    
    // Check if verification was successful
    if (data.tokenProperties?.valid && data.riskAnalysis?.score >= 0.5) {
      return res.status(200).json({ 
        success: true, 
        score: data.riskAnalysis.score 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        score: data.riskAnalysis?.score || 0,
        reason: data.tokenProperties?.invalidReason || 'Unknown'
      });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
