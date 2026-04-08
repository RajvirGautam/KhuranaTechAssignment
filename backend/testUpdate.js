const { z } = require("zod");
const updateSchema = z.object({
  company: z.string().min(1).optional(),
  status: z.string().optional(),
  salaryRange: z.string().optional(),
});
const reqBody = { status: "Phone Screen" };
const parsed = updateSchema.safeParse(reqBody);
const raw = { ...parsed.data };
const updatePayload = {};
for (const key of Object.keys(raw)) {
  if (raw[key] !== undefined) {
    updatePayload[key] = raw[key];
  }
}
console.log(updatePayload);
