
import { db } from "./db";
import axios from 'axios';

export async function checkSystemHealth() {
  const health = {
    database: false,
    ai: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Check database connection
    await db.execute('SELECT 1');
    health.database = true;
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  try {
    // Check AI service
    const GROK_API_KEY = process.env.GROK_API_KEY;
    if (GROK_API_KEY) {
      const response = await axios.post("https://api.x.ai/v1/chat/completions", {
        model: "grok-beta",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10
      }, {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      if (response.status === 200) {
        health.ai = true;
      }
    }
  } catch (error) {
    console.error("AI health check failed:", error);
  }

  return health;
}
