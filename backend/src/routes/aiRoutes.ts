import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { generateResumeSuggestions, parseJobDescription } from "../services/aiService";

const router = Router();

const parseSchema = z.object({
  jobDescription: z.string().trim().optional(),
  jobLink: z.string().url().optional()
});

const suggestionSchema = z.object({
  role: z.string().min(1),
  company: z.string().min(1),
  requiredSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  seniority: z.string().default("")
});

router.use(authMiddleware);

router.post("/parse", async (req, res) => {
  const parsed = parseSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Please paste a valid job description" });
    return;
  }

  if (!parsed.data.jobDescription && !parsed.data.jobLink) {
    res.status(400).json({ message: "Paste a job description or provide a job link" });
    return;
  }

  try {
    const extracted = await parseJobDescription({
      jobDescription: parsed.data.jobDescription,
      jobLink: parsed.data.jobLink
    });
    res.json({ parsed: extracted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse job description";
    res.status(422).json({ message });
  }
});

router.post("/suggestions", async (req, res) => {
  const parsed = suggestionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid suggestion input" });
    return;
  }

  try {
    const suggestions = await generateResumeSuggestions(parsed.data);
    res.json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate suggestions";
    res.status(422).json({ message });
  }
});

export default router;
