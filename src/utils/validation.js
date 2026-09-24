const {z}=require("zod");

const registerSchema=z.object({
  name:z.string().trim().min(2).max(100),
  email:z.string().trim().email(),
  password:z.string().min(6).max(100)
});

const loginSchema=z.object({
  email:z.string().trim().email(),
  password:z.string().min(6).max(100)
});

const analyzeSchema=z.object({
  jobTitle:z.string().trim().min(2).max(150)
});

const aiAnalysisSchema=z.object({
  score:z.number().min(0).max(100),
  summary:z.string().min(1),
  skillsFound:z.array(z.string()),
  missingSkills:z.array(z.string()),
  suggestions:z.array(z.string()).min(1).max(10)
});

module.exports={registerSchema,loginSchema,analyzeSchema,aiAnalysisSchema};