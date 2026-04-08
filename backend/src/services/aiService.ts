import { z } from "zod";
import * as cheerio from "cheerio";
import { env } from "../config/env";

const parsedJobSchema = z.object({
  companyName: z.string().min(1),
  role: z.string().min(1),
  salaryRange: z.string().default(""),
  requiredSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  seniority: z.string().default(""),
  location: z.string().default("")
});

const resumeSuggestionsSchema = z.object({
  suggestions: z.array(z.string()).min(3).max(5)
});

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const isValidJobUrl = (value?: string): value is string => Boolean(value && /^https?:\/\//i.test(value));

const compensationPattern = /(?:\b(?:salary|stipend|compensation|paid|unpaid|ctc|package|pay|remuneration|payout|monthly|per\s+month|pm)\b|[$₹]\s?[0-9][0-9,]*(?:\.[0-9]+)?(?:\s*(?:k|K|m|M|lpa|LPA|per\s*month|\/month|pm|monthly))?)/gi;

const extractCompensationHints = (text: string): string[] => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }

  const snippets = new Set<string>();

  for (const match of normalized.matchAll(compensationPattern)) {
    const index = match.index ?? -1;
    if (index < 0) {
      continue;
    }

    const start = Math.max(0, index - 60);
    const end = Math.min(normalized.length, index + match[0].length + 100);
    snippets.add(normalized.slice(start, end).trim());
  }

  return [...snippets].slice(0, 8);
};

const normalizeCompensationText = (text: string): string => text.replace(/\s+/g, " ").trim();

const scrapePublicJobPage = async (jobLink: string): Promise<string> => {
  const response = await fetch(jobLink, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  if (!response.ok) {
    throw new Error(`Could not fetch job link (${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const title = ($("title").text() || $("meta[property='og:title']").attr("content") || "").trim();
  const description = (
    $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || ""
  ).trim();

  $("script, style, noscript, svg, iframe").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  return [
    `Job Link: ${jobLink}`,
    title ? `Title: ${title}` : "",
    description ? `Description: ${description}` : "",
    bodyText ? `Page Text: ${bodyText}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");
};

const extractJsonString = (text: string): string => {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error("AI did not return JSON content");
  }

  return text.slice(firstBrace, lastBrace + 1).trim();
};

const parseJsonFromModel = (text: string): unknown => {
  try {
    return JSON.parse(extractJsonString(text));
  } catch {
    throw new Error("AI returned invalid JSON output");
  }
};

const callOpenRouter = async (userPrompt: string): Promise<string> => {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.AI_API}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON assistant. Return only valid JSON and no extra prose or markdown."
        },
        { role: "user", content: userPrompt }
      ],
      reasoning: { enabled: true }
    })
  });

  const result = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    const message = result.error?.message ?? "OpenRouter request failed";
    throw new Error(message);
  }

  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned empty response content");
  }

  return content;
};

export const parseJobDescription = async (input: { jobDescription?: string; jobLink?: string }) => {
  let sourceText = "";

  if (isValidJobUrl(input.jobLink)) {
    try {
      sourceText = await scrapePublicJobPage(input.jobLink);
    } catch {
      sourceText = input.jobDescription?.trim() ?? "";
    }
  }

  if (!sourceText) {
    sourceText = input.jobDescription?.trim() ?? "";
  }

  if (!sourceText) {
    throw new Error("Provide a job description or a publicly accessible job link");
  }

  const compensationHints = extractCompensationHints(sourceText);
  const compensationGuidance = compensationHints.length
    ? `\nCompensation clues detected in the source text:\n${compensationHints.map((hint) => `- ${hint}`).join("\n")}`
    : "\nNo obvious compensation clues were detected automatically.";

  const prompt = `Extract structured information from the job posting below.

Important rules:
- Infer company, role, seniority, location, skills, and responsibilities from the text even if the user did not label them explicitly.
- Do not echo the source text as-is.
- If a field is not clearly present, make the best reasonable inference from context.
- If a field truly cannot be determined, use an empty string or empty array.
- Treat pay-related wording as compensation evidence, including salary, stipend, compensation, paid, unpaid, CTC, package, pay, remuneration, and amounts using $ or ₹.
- If the posting mentions stipend instead of salary, return it in salaryRange using the exact wording or a compact summary.
- Return strict JSON only with keys: companyName, role, salaryRange, requiredSkills, niceToHaveSkills, seniority, location.

Source text:
${sourceText}${compensationGuidance}`;

  const outputText = await callOpenRouter(prompt);
  const parsed = parseJsonFromModel(outputText);
  const result = parsedJobSchema.parse(parsed);

  if (!result.salaryRange.trim() && compensationHints.length > 0) {
    result.salaryRange = normalizeCompensationText(compensationHints[0] ?? "");
  }

  return result;
};

export const generateResumeSuggestions = async (params: {
  role: string;
  company: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
}) => {
  const prompt = `Generate 3 to 5 specific, impact-focused resume bullet points tailored to this role. Avoid generic advice. Return strict JSON only with key suggestions (array of strings).\n\nRole: ${params.role}\nCompany: ${params.company}\nSeniority: ${params.seniority}\nRequired skills: ${params.requiredSkills.join(", ")}\nNice to have skills: ${params.niceToHaveSkills.join(", ")}`;

  const outputText = await callOpenRouter(prompt);
  const parsed = parseJsonFromModel(outputText);
  return resumeSuggestionsSchema.parse(parsed).suggestions;
};
