import { Router } from "express";
import { z } from "zod";
import { APPLICATION_STATUSES, ApplicationModel } from "../models/Application";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const statusSchema = z.enum(APPLICATION_STATUSES);

const applicationSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  jdLink: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  dateApplied: z.string().datetime().optional(),
  status: statusSchema.optional(),
  salaryRange: z.string().optional().default(""),
  isPinned: z.boolean().optional().default(false),
  requiredSkills: z.array(z.string()).optional().default([]),
  niceToHaveSkills: z.array(z.string()).optional().default([]),
  seniority: z.string().optional().default(""),
  location: z.string().optional().default(""),
  resumeSuggestions: z.array(z.string()).optional().default([]),
  nextFollowUpDate: z.string().datetime().nullable().optional().default(null),
  followUpNote: z.string().optional().default(""),
  followUpCompletedAt: z.string().datetime().nullable().optional().default(null)
});

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const apps = await ApplicationModel.find({ userId: req.user?.id }).sort({ createdAt: -1 });
  res.json({ applications: apps });
});

router.post("/", async (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const created = await ApplicationModel.create({
    ...data,
    userId: req.user?.id,
    dateApplied: data.dateApplied ? new Date(data.dateApplied) : new Date(),
    status: data.status ?? "Applied",
    isPinned: data.isPinned ?? false,
    nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
    followUpCompletedAt: data.followUpCompletedAt ? new Date(data.followUpCompletedAt) : null
  });

  res.status(201).json({ application: created });
});

const updateSchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  jdLink: z.string().optional(),
  notes: z.string().optional(),
  dateApplied: z.string().datetime().optional(),
  status: statusSchema.optional(),
  salaryRange: z.string().optional(),
  isPinned: z.boolean().optional(),
  requiredSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  seniority: z.string().optional(),
  location: z.string().optional(),
  resumeSuggestions: z.array(z.string()).optional(),
  nextFollowUpDate: z.string().datetime().nullable().optional(),
  followUpNote: z.string().optional(),
  followUpCompletedAt: z.string().datetime().nullable().optional()
});

router.put("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const raw: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.dateApplied) {
    raw.dateApplied = new Date(parsed.data.dateApplied);
  }
  if (parsed.data.nextFollowUpDate !== undefined) {
    raw.nextFollowUpDate = parsed.data.nextFollowUpDate ? new Date(parsed.data.nextFollowUpDate) : null;
  }
  if (parsed.data.followUpCompletedAt !== undefined) {
    raw.followUpCompletedAt = parsed.data.followUpCompletedAt ? new Date(parsed.data.followUpCompletedAt) : null;
  }
  // Only set fields that were actually provided — drop undefined so salaryRange etc. are never overwritten
  const updatePayload: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    if (raw[key] !== undefined) {
      updatePayload[key] = raw[key];
    }
  }

  const updated = await ApplicationModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.id },
    { $set: updatePayload },
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ message: "Application not found" });
    return;
  }

  res.json({ application: updated });
});

router.delete("/:id", async (req, res) => {
  const deleted = await ApplicationModel.findOneAndDelete({
    _id: req.params.id,
    userId: req.user?.id
  });

  if (!deleted) {
    res.status(404).json({ message: "Application not found" });
    return;
  }

  res.status(204).send();
});

export default router;
