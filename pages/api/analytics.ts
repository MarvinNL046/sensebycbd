import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to receive web vitals data
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the web vitals data from the request body
  const webVitals = req.body;

  // Log the web vitals data to the console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', webVitals);
  }

  // In a real application, you would store this data in a database
  // or send it to an analytics service like Google Analytics

  // Example: Store in a database
  // const { name, value, id, delta, navigationType } = webVitals;
  // await db.webVitals.create({
  //   data: {
  //     name,
  //     value,
  //     id,
  //     delta,
  //     navigationType,
  //     userAgent: req.headers['user-agent'],
  //     timestamp: new Date(),
  //   },
  // });

  // Return a success response
  return res.status(200).json({ success: true });
}
