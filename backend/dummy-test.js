const { z } = require("zod");
console.log(z.object({ salaryRange: z.string().optional() }).safeParse({ status: "Phone Screen" }).data);
