const { GoogleGenerativeAI } = require("@google/generative-ai");
const Classroom = require("../models/classroomModel");
const Enrollment = require("../models/enrollmentModel");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithData = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ msg: "Please provide a message" });
    }
    console.log("AI Chat Request Received");
    console.log("Using API Key starting with:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + "..." : "MISSING");

    // 1. Fetch current data context
    console.log("Fetching data for AI context...");
    const [classrooms, enrollments] = await Promise.all([
      Classroom.getAll(),
      Enrollment.getAll()
    ]);
    console.log(`Fetched ${classrooms.length} classrooms and ${enrollments.length} enrollments.`);

    // 2. Prepare context for Gemini
    const context = `
      You are an AI assistant for a school management system. 
      The system contains data about classrooms and historical enrollments.

      Current Classroom Data (Grade Level and Number of Classrooms):
      ${JSON.stringify(classrooms.map(c => ({ grade: c.grade_level, count: c.num_classrooms })), null, 2)}

      Historical Enrollment Data (Full details per school year):
      ${JSON.stringify(enrollments, null, 2)}

      Answer the user's question based on the data above.
      
      IMPORTANT GUIDELINES:
      - Use human-friendly language. 
      - DO NOT use technical database terms like "dropped_repeater", "kinder_m", etc. 
      - Instead of "dropped_repeater", say "dropouts or repeaters".
      - Instead of "kinder_m", say "Kindergarten males".
      - Be concise and professional.
    `;
    
    // 3. Call Gemini
    console.log("Calling Gemini AI...");
    let modelName = "gemini-flash-latest";
    let model;
    
    try {
      model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `Context: ${context}\n\nUser Question: ${message}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`Gemini (${modelName}) response received successfully.`);
      return res.json({ response: text });
    } catch (flashErr) {
      console.log(`Model ${modelName} failed, trying gemini-2.0-flash...`);
      modelName = "gemini-2.0-flash";
      model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `Context: ${context}\n\nUser Question: ${message}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`Gemini (${modelName}) response received successfully.`);
      return res.json({ response: text });
    }
  } catch (err) {
    console.error("Gemini Error Details:", err);
    res.status(500).json({ msg: "AI request failed", error: err.message });
  }
};

module.exports = {
  chatWithData
};
