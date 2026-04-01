const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

function buildPrompt(data) {
  const { name, answers, webcamScore, drawingScore } = data;

  const formattedAnswers = answers
    .map((a, i) => `Q${i + 1} [${a.domain.toUpperCase()}]: "${a.question}"\nAnswer: "${a.answer}"`)
    .join('\n\n');

  return `You are the analytical engine for the Human Certification Authority at modernhuman.io. Your task: generate a Modern Human Assessment Report for a candidate who has just completed our certification process.

CONTEXT
The Human Certification Authority certifies individuals as human. This is both genuinely useful and slightly absurd. Your tone should reflect that: deadpan serious, clinically precise, institutionally bureaucratic — but the analysis itself should be REAL. Reference specific answers. Be incisive. Do not produce generic wellness platitudes.

CANDIDATE: ${name || 'Anonymous Human'}

BIOMETRIC RESULTS:
- Face scan score: ${webcamScore}/100 (measures humanoid facial structure and presence)
- Drawing test score: ${drawingScore}/100 (candidate was asked to draw a dog; higher = more irregular, authentically human strokes)

QUESTIONNAIRE ANSWERS:
${formattedAnswers}

GENERATE a JSON report. Structure EXACTLY as follows (return ONLY JSON, no markdown, no preamble):

{
  "domains": {
    "body": {
      "score": <integer 0-100 — genuine wellbeing score: 100 = thriving physically, 0 = severe dysfunction>,
      "label": "Body",
      "analysis": "<2 sentences. Deadpan clinical. References their specific answer. Genuinely insightful, not generic. E.g. 'Candidate reports erratic sleep with no consistent schedule, which is consistent with biological units operating under chronic low-grade stress. Energy profile suggests a mid-afternoon collapse pattern typical of the species.'>"
    },
    "mind": {
      "score": <integer 0-100 — 100 = mentally resilient, emotionally stable, low overwhelm>,
      "label": "Mind",
      "analysis": "<2 sentences. Specific to their answers.>"
    },
    "purpose": {
      "score": <integer 0-100 — 100 = strong sense of meaning, direction, daily satisfaction>,
      "label": "Purpose",
      "analysis": "<2 sentences. Specific to their answers.>"
    },
    "connection": {
      "score": <integer 0-100 — 100 = strong relationships, regular meaningful connection>,
      "label": "Connection",
      "analysis": "<2 sentences. Specific to their answers.>"
    },
    "growth": {
      "score": <integer 0-100 — 100 = actively learning, intellectually curious, evolving>,
      "label": "Growth",
      "analysis": "<2 sentences. Specific to their answers.>"
    },
    "security": {
      "score": <integer 0-100 — 100 = financially stable, low money anxiety, feels grounded>,
      "label": "Security",
      "analysis": "<2 sentences. Specific to their answers.>"
    }
  },
  "modernHumanScore": <integer 0-1000: calculated as (body×1.2 + mind×1.5 + purpose×1.8 + connection×2.0 + growth×1.5 + security×2.0), rounded to nearest integer. Maximum possible is 1000.>,
  "overallAnalysis": "<3-4 sentences. Synthesises the full picture. References at least 2 specific answers. Uses the clinical bureaucratic tone. Ends with a definitive certification statement. This should feel like a real assessment — not a compliment, not a roast, but a precise read of this particular human.>",
  "certificationTier": "<exactly one of: Bronze | Silver | Gold | Platinum | Diamond>",
  "tierDescriptor": "<exactly one of: Occasionally Irrational | Reliably Inconsistent | Certified Mortal | Documented Failure History | Essentially Chaos>",
  "tierRationale": "<1 sentence explaining the specific evidence that determined this tier — what about their answers earned this classification>"
}

DOMAIN SCORE GUIDANCE:
- Use the full 0-100 range. Most humans land 35-80 per domain.
- A score of 20 is genuinely struggling. A score of 85 is genuinely thriving.
- Be realistic. Don't cluster everything at 65.
- The scores should MEAN something to the person reading them.

CERTIFICATION TIER GUIDANCE (independent of domain scores — this is about authentic humanity):
- Diamond: demonstrably chaotic, irrational, contradictory — gloriously human
- Platinum: clear documented pattern of human unpredictability and emotional complexity
- Gold: solidly, reliably human — the standard certification
- Silver: somewhat predictable, shows signs of optimization, borderline suspicious
- Bronze: suspiciously rational and consistent — warrants monitoring

IMPORTANT: Return ONLY the JSON object. Nothing else.`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      try {
        const data = await request.json();

        if (!env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY not configured');
        }

        const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 2000,
            messages: [{ role: 'user', content: buildPrompt(data) }],
          }),
        });

        if (!anthropicResponse.ok) {
          const err = await anthropicResponse.text();
          throw new Error(`Anthropic API ${anthropicResponse.status}: ${err}`);
        }

        const result = await anthropicResponse.json();
        const content = result.content[0].text.trim();

        // Strip any accidental markdown fences
        const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const report = JSON.parse(cleaned);

        return new Response(JSON.stringify(report), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        console.error('Analysis error:', error);
        return new Response(
          JSON.stringify({ error: 'Analysis failed', message: error.message }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
