
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { PDFExtract } from 'pdf.js-extract';
import { analyzeApplication } from './gemini';

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export const uploadMiddleware = upload.single('document');

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const pdfExtract = new PDFExtract();
    const data = await new Promise<any>((resolve, reject) => {
      pdfExtract.extract(filePath, {}, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    let extractedText = '';
    data.pages.forEach((page: any) => {
      page.content.forEach((item: any) => {
        if (item.str) {
          extractedText += item.str + ' ';
        }
      });
      extractedText += '\n';
    });

    return extractedText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function analyzeDocument(extractedText: string, documentType: string): Promise<any> {
  if (!process.env.GROK_API_KEY) {
    return { error: "AI analysis unavailable - GROK_API_KEY not configured" };
  }

  try {
    const prompt = getAnalysisPrompt(documentType, extractedText);
    
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;
    
    return parseAnalysisResponse(analysis, documentType);
  } catch (error) {
    console.error("Error analyzing document:", error);
    return { error: "Failed to analyze document" };
  }
}

function getAnalysisPrompt(documentType: string, text: string): string {
  switch (documentType) {
    case 'application':
      return `Extract and structure information from this Youth Challenge Academy application form:

${text}

Return a JSON object with the following fields (use null for missing information):
{
  "firstName": "",
  "lastName": "",
  "dateOfBirth": "",
  "birthTime": "",
  "birthPlace": "",
  "gender": "",
  "ethnicity": "",
  "address": "",
  "city": "",
  "state": "",
  "zipCode": "",
  "phone": "",
  "email": "",
  "emergencyContact": "",
  "emergencyPhone": "",
  "currentSchool": "",
  "gradeLevel": "",
  "gpa": "",
  "reasonForApplying": "",
  "previousChallenges": "",
  "goals": "",
  "parentGuardianName": "",
  "parentGuardianPhone": "",
  "preferredCampus": ""
}`;

    case 'medical':
      return `Extract medical information from this medical statement form:

${text}

Return a JSON object with medical information:
{
  "allergies": [],
  "medications": [],
  "medicalConditions": [],
  "emergencyMedications": [],
  "doctorName": "",
  "doctorPhone": "",
  "insuranceProvider": "",
  "policyNumber": "",
  "additionalNotes": ""
}`;

    case 'mentor_report':
      return `Extract mentorship information from this mentor report:

${text}

Return a JSON object with:
{
  "cadetName": "",
  "mentorName": "",
  "reportDate": "",
  "meetingDate": "",
  "hoursSpent": "",
  "activitiesCompleted": [],
  "progress": "",
  "challenges": "",
  "goals": "",
  "nextSteps": "",
  "mentorSignature": ""
}`;

    default:
      return `Analyze this document and extract key information:

${text}

Return a JSON object with any relevant information found.`;
  }
}

function parseAnalysisResponse(analysis: string, documentType: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, return the raw analysis
    return { 
      analysisText: analysis,
      documentType,
      extractedData: {}
    };
  } catch (error) {
    console.error('Error parsing analysis response:', error);
    return { 
      analysisText: analysis,
      documentType,
      extractedData: {},
      error: 'Failed to parse structured data'
    };
  }
}

export async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
}
