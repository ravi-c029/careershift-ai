import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

async function run() {
  const prompt = 'Extract the job title and a list of up to 5 core skills from this public linkedin profile: https://www.linkedin.com/in/williamhgates/. Return as JSON with keys jobTitle and skills.';
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}
run();
