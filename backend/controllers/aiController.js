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

    // Compute basic analytics for the AI
    const totalClassrooms = classrooms.reduce((acc, c) => acc + (c.num_classrooms || 0), 0);
    const teacherCount = totalClassrooms; // 1 teacher per classroom
    
    // Sort enrollments to get the latest easily
    const sortedEnrollments = [...enrollments].sort((a, b) => b.school_year.localeCompare(a.school_year));
    
    const analytics = sortedEnrollments.map(e => ({
      school_year: e.school_year,
      total_enrollees: e.total_enrollees,
      teacher_count: teacherCount,
      student_teacher_ratio: teacherCount > 0 ? parseFloat((e.total_enrollees / teacherCount).toFixed(2)) : 0
    }));

    // 2. Prepare comprehensive context for Gemini
    const context = `
      You are Mark AI, an advanced Executive Analytical Assistant for a school management system. 
      Your primary role is NOT just to read data, but to analyze it, identify trends, and make strategic, data-driven decisions and recommendations across all dashboards.

      1. CURRENT CLASSROOM DATA:
      ${JSON.stringify(classrooms.map(c => ({ grade: c.grade_level, count: c.num_classrooms })), null, 2)}

      2. HISTORICAL ENROLLMENT DATA:
      ${JSON.stringify(sortedEnrollments.map(e => ({ 
        year: e.school_year, 
        total: e.total_enrollees, 
        dropped_or_repeaters: e.dropped_repeater 
      })), null, 2)}

      3. TEACHERS & SEATS ANALYTICS:
      ${JSON.stringify(analytics, null, 2)}

      CRITICAL DIRECTIVES FOR YOUR RESPONSE:
      - MAKE DECISIONS: If asked "how many teachers must be added" or about shortages, you MUST calculate the answer. Assume the ideal maximum Student:Teacher ratio is 40:1. If the current ratio exceeds this, calculate exactly how many new teachers/classrooms are required to bring the ratio down to 40 or below.
      - ANALYZE ALL DASHBOARDS: When asked to analyze the school state, cross-reference Enrollments, Classrooms, and Teachers to provide a holistic executive summary.
      - ACTIONABLE INSIGHTS: Point out concerning trends (e.g., rising dropouts, overcrowding ratios) and actively propose solutions.
      - TONE: Professional, strategic, and human-friendly. DO NOT use raw database technical terms. Present your calculations clearly.
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
