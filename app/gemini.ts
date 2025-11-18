import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyB10b-FTo4dzyd_3Za7cougzi2FucREpBo";

const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
