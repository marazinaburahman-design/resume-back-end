const { aiAnalysisSchema } = require("../utils/validation");

function buildMockAnalysis(resumeText, jobTitle) {
  const lower = resumeText.toLowerCase();

  const dictionary = [
    "javascript",
    "react",
    "node.js",
    "node",
    "express",
    "mongodb",
    "mongoose",
    "typescript",
    "html",
    "css",
    "tailwind css",
    "git",
    "github",
    "python",
    "java",
    "sql",
    "docker",
    "aws",
  ];

  const skillsFound = dictionary.filter((skill) =>
    lower.includes(skill.toLowerCase()),
  );

  const targetSkills = ["javascript", "react", "node.js", "express", "mongodb"];

  const missingSkills = targetSkills.filter(
    (skill) =>
      !skillsFound.some((found) => found.toLowerCase() === skill.toLowerCase()),
  );

  const score = Math.max(
    35,
    Math.min(95, 50 + skillsFound.length * 8 - missingSkills.length * 2),
  );

  return aiAnalysisSchema.parse({
    score,
    summary: `The resume was analyzed for a ${jobTitle} position. ${skillsFound.length} relevant technical skills were detected.`,
    skillsFound,
    missingSkills,
    suggestions: [
      `Tailor your resume keywords toward the ${jobTitle} role.`,
      missingSkills.length
        ? `Consider adding evidence of: ${missingSkills.join(", ")}.`
        : "Add measurable results to your strongest project or work bullets.",
      "Use concise achievement-focused bullet points with measurable outcomes.",
    ],
  });
}

async function analyzeWithGroq(resumeText, jobTitle) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env file.");
  }

  const model = process.env.AI_MODEL;

  if (!model) {
    throw new Error("AI_MODEL is missing. Add it to your .env file.");
  }

  const trimmedResume = resumeText.slice(0, 30000);

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },

      body: JSON.stringify({
        model,

        temperature: 0.2,

        response_format: {
          type: "json_object",
        },

        messages: [
          {
            role: "system",

            content: `
You are an expert ATS resume analyzer.

Analyze the resume against the target job title.

Return ONLY valid JSON.

The JSON must contain exactly these fields:

{
  "score": number,
  "summary": "string",
  "skillsFound": ["string"],
  "missingSkills": ["string"],
  "suggestions": ["string"]
}

Rules:

- score must be between 0 and 100
- Do not invent skills
- Only list skills supported by the resume in skillsFound
- missingSkills should contain useful skills relevant to the target role
- suggestions should be practical resume improvement suggestions
- Keep the summary concise
`,
          },

          {
            role: "user",

            content: `
Target job title:
${jobTitle}

Resume:
${trimmedResume}
`,
          },
        ],
      }),
    },
  );

  const body = await response.json();

  if (!response.ok) {
    const message =
      body?.error?.message ||
      `Groq API request failed with status ${response.status}`;

    throw new Error(message);
  }

  const content = body?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty AI response.");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    console.error("Invalid Groq JSON:", content);

    throw new Error("Groq returned invalid JSON for the resume analysis.");
  }

  return aiAnalysisSchema.parse(parsed);
}

async function analyzeResume({ resumeText, jobTitle }) {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();

  console.log(`AI provider: ${provider}`);

  if (provider === "mock") {
    return buildMockAnalysis(resumeText, jobTitle);
  }

  if (provider === "groq") {
    return analyzeWithGroq(resumeText, jobTitle);
  }

  throw new Error(
    `AI provider "${provider}" is not implemented. Use AI_PROVIDER=groq or AI_PROVIDER=mock.`,
  );
}

module.exports = {
  analyzeResume,
};
