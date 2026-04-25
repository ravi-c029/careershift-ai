require('dotenv').config({path: '.env.local'});
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.7,
  }
});
const prompt = `You are an expert career counselor and AI labor market analyst. Analyze the following person's career situation and provide a comprehensive assessment.

Current Job Title: Software Developer
Current Skills: Python

Provide a JSON response with EXACTLY this structure:
{
  "displacementRisk": <number 0-100, how likely AI will displace this role>,
  "riskExplanation": "<2-3 sentence explanation of the risk score>"
}

Requirements:
- Make all recommendations highly specific to their current role and skills
- Focus on careers where human skills (creativity, empathy, leadership) matter`;

model.generateContent(prompt).then(res => {
  const text = res.response.text();
  console.log("Raw response length:", text.length);
  console.log("Raw response start:", text.substring(0, 100));
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("NO JSON MATCH!");
  } else {
    console.log("JSON Match found");
  }
}).catch(err => console.error(err));
