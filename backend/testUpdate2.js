const { z } = require("zod");
const updateSchema = z.object({
  status: z.string().optional(),
  salaryRange: z.string().optional(),
});
const raw = { ...updateSchema.safeParse({ status: "Phone Screen" }).data };
const updatePayload = {};
for (const key of Object.keys(raw)) {
  if (raw[key] !== undefined) {
    updatePayload[key] = raw[key];
  }
}
console.log(updatePayload);
