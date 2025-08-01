
import axios from 'axios';
import type { Application } from '@shared/schema';

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_API_KEY = process.env.GROK_API_KEY;

if (!GROK_API_KEY) {
  console.warn("GROK_API_KEY environment variable is not set. AI features will not work properly.");
}

export async function analyzeApplication(application: Application): Promise<string> {
  if (!GROK_API_KEY) {
    return "AI analysis unavailable - GROK_API_KEY not configured";
  }

  try {
    const prompt = `Analyze this Youth Challenge Academy application and provide insights on the applicant's suitability, potential challenges, and recommendations for success:

Applicant: ${application.firstName} ${application.lastName}
Age: Calculate from DOB ${application.dateOfBirth}
Location: ${application.city}, ${application.state}
Current School: ${application.currentSchool || 'Not specified'}
Grade Level: ${application.gradeLevel || 'Not specified'}

Reason for Applying:
${application.reasonForApplying || 'Not provided'}

Previous Challenges:
${application.previousChallenges || 'Not provided'}

Goals:
${application.goals || 'Not provided'}

Please provide:
1. Overall suitability assessment (1-10 scale)
2. Key strengths identified
3. Potential risk factors or challenges
4. Specific recommendations for success if accepted
5. Suggested mentorship focus areas

Format your response as a structured assessment suitable for staff review.`;

    const response = await axios.post(GROK_API_URL, {
      model: "grok-beta",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return response.data.choices[0]?.message?.content || "Analysis could not be completed";
  } catch (error) {
    console.error("Error analyzing application:", error);
    return "Error: Could not complete AI analysis. Please try again later.";
  }
}

export async function generateCadetInsights(cadet: any): Promise<string> {
  if (!GROK_API_KEY) {
    return "AI insights unavailable - GROK_API_KEY not configured";
  }

  try {
    const prompt = `Generate insights and recommendations for this Youth Challenge Academy cadet's development:

Cadet: ${cadet.firstName} ${cadet.lastName}
Class: ${cadet.classNumber}
Campus: ${cadet.campus}
Status: ${cadet.status}

Progress Metrics:
- Academic Progress: ${cadet.academicProgress}%
- Fitness Progress: ${cadet.fitnessProgress}%
- Leadership Progress: ${cadet.leadershipProgress}%
- Community Service Hours: ${cadet.serviceHours}

Additional Notes:
${cadet.notes || 'No additional notes'}

Provide:
1. Overall development assessment
2. Areas of strength
3. Areas needing improvement
4. Specific action recommendations
5. Mentorship suggestions
6. Risk factors to monitor

Format as actionable insights for staff.`;

    const response = await axios.post(GROK_API_URL, {
      model: "grok-beta",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return response.data.choices[0]?.message?.content || "Insights could not be generated";
  } catch (error) {
    console.error("Error generating cadet insights:", error);
    return "Error: Could not generate AI insights. Please try again later.";
  }
}
