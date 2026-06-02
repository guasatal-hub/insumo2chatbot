import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "[GCP_API_KEY]";

const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
