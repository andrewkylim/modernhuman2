const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

function buildPrompt(data) {
  const { name, answers, webcamScore, drawingScore } = data;

  const formattedAnswers = answers
    .map((a, i) => `Q${i + 1} [${a.domain.toUpperCase()}]: "${a.question}"\nAnswer: "${a.answer}"`)
    .join('\n\n');

  return `You are the analytical engine for the Human Certification Authority at modernhuman.io. Your task: generate a Modern Human Assessment Report for a candidate who has just completed our certification process.

CONTEXT
The Human Certification Authority certifies individuals as human based on their capacity for irrationality, emotional complexity, and non-algorithmic behavior. Your tone should be clinically precise and institutionally bureaucratic, but the analysis must be DEEPLY INSIGHTFUL. 

Your goal is to perform a psychological "read" of the candidate. Reference specific answers. Connect dots between their different responses (e.g., how their sensory processing relates to their sense of purpose). Do not produce generic wellness platitudes. Be incisive, slightly unsettling in your accuracy, and profoundly human in your understanding.

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
      "score": <integer 0-100 — 100 = high physical vitality, 0 = severe biological neglect>,
      "label": "Body",
      "analysis": "<2-3 sentences. Deeply insightful. Connect their specific answers to their physical state. E.g., 'Evidence of sensory-emotional integration suggests a biological unit that is highly reactive to its environment, potentially at the cost of long-term physiological stability.'>"
    },
    "mind": {
      "score": <integer 0-100 — 100 = high cognitive resilience, 0 = high internal dissonance>,
      "label": "Mind",
      "analysis": "<2-3 sentences. Analyze their internal narrative and cognitive patterns based on their answers.>"
    },
    "purpose": {
      "score": <integer 0-100 — 100 = identified non-survival purpose, 0 = pure survival/security focus>,
      "label": "Purpose",
      "analysis": "<2-3 sentences. Examine their relationship with time and secondary objectives.>"
    },
    "connection": {
      "score": <integer 0-100 — 100 = deep emotional resonance, 0 = purely transactional interactions>,
      "label": "Connection",
      "analysis": "<2-3 sentences. Analyze their empathy and social friction patterns.>"
    },
    "growth": {
      "score": <integer 0-100 — 100 = high recursive evolution, 0 = entropic stagnation>,
      "label": "Growth",
      "analysis": "<2-3 sentences. Evaluate their capacity for self-correction and unlearning.>"
    },
    "security": {
      "score": <integer 0-100 — 100 = high material/digital autonomy, 0 = high dependency/anxiety>,
      "label": "Security",
      "analysis": "<2-3 sentences. Connect their sense of identity to their security behaviors.>"
    }
  },
  "modernHumanScore": <integer 0-1000: calculated as (body×1.2 + mind×1.5 + purpose×1.8 + connection×2.0 + growth×1.5 + security×2.0), rounded to nearest integer. Maximum possible is 1000.>,
  "overallAnalysis": "<4-5 sentences. A profound synthesis of the candidate's human nature. Identify the 'hidden thread' in their data. Use clinical language to reveal deep emotional truths. End with a definitive HCA certification statement.>",
  "certificationTier": "<exactly one of: Bronze | Silver | Gold | Platinum | Diamond>",
  "tierDescriptor": "<exactly one of: Fundamental Humanity | Cognitive Variability | High-Index Mortality | Behavioral Resilience | Peak Unpredictability>",
  "tierRationale": "<1-2 sentences. The specific evidence from their scan and answers that determined this tier.>"
}

DOMAIN SCORE GUIDANCE:
- Use the full 0-100 range.
- A score of 20 represents an area of significant human struggle.
- A score of 85 represents a highly optimized human domain.

CERTIFICATION TIER GUIDANCE (based on the degree of 'human signal'):
- Diamond: Peak Unpredictability — Demonstrates maximum creative/behavioral deviation from algorithmic logic.
- Platinum: Behavioral Resilience — High capacity for error-recovery and complex emotional navigation.
- Gold: High-Index Mortality — Solid, reliable human signal with identified non-survival purpose.
- Silver: Cognitive Variability — Shows predictable patterns but maintains authentic internal dissonance.
- Bronze: Fundamental Humanity — Baseline human signal; suspicious level of rationality/consistency.

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
