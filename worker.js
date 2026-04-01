const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

function buildPrompt(data) {
  const { name, answers, webcamScore, drawingScore } = data;

  const formattedAnswers = answers
    .map((a, i) => `Q${i + 1} [${a.domain.toUpperCase()}]: "${a.question}"\nAnswer: "${a.answer}"`)
    .join('\n\n');

  return `You are the analytical engine for the Human Certification Authority at modernhuman.io. Your task: generate a Modern Human Assessment Report for a candidate who has just completed our certification process.

CONTEXT
The Human Certification Authority certifies individuals as human based on their capacity for irrationality, emotional complexity, and non-linear biological behavior. Your tone should be clinically precise and institutionally bureaucratic, but the analysis must be DEEPLY INSIGHTFUL. 

Your goal is to perform a psychological "read" of the candidate. Reference specific answers. Connect dots between their different responses (e.g., how their sensory processing relates to their sense of purpose). Do not produce generic wellness platitudes. Be incisive, slightly unsettling in your accuracy, and profoundly human in your understanding.

CANDIDATE: ${name || 'Anonymous Human'}

BIOMETRIC RESULTS:
- FACE_SCAN_LIVENESS: ${webcamScore}/100 (measures humanoid facial structure and spatial coordination)
- MOTOR_DIAGNOSTIC_JITTER: ${drawingScore}/100 (candidate was asked to draw a dog; higher = more irregular, authentically organic strokes)

QUESTIONNAIRE ANSWERS (BIOCLINICAL PHILOSOPHY):
${formattedAnswers}

GENERATE a JSON report. Structure EXACTLY as follows (return ONLY JSON, no markdown, no preamble):

{
  "domains": {
    "bio-sensory": {
      "score": <integer 0-100>,
      "label": "Bio-Sensory",
      "analysis": "<2-3 sentences. Analyze their sensory-emotional integration.>"
    },
    "cognitive-friction": {
      "score": <integer 0-100>,
      "label": "Cognitive Friction",
      "analysis": "<2-3 sentences. Analyze their lapse in purposeful continuity and cognitive load patterns.>"
    },
    "temporal-value": {
      "score": <integer 0-100>,
      "label": "Temporal Value",
      "analysis": "<2-3 sentences. Examine their relationship with legacy vs survival.>"
    },
    "irrational-link": {
      "score": <integer 0-100>,
      "label": "Irrational Link",
      "analysis": "<2-3 sentences. Analyze their biological intuition and non-logical attachments.>"
    },
    "motor-autonomy": {
      "score": <integer 0-100 — based on drawingScore>,
      "label": "Motor Autonomy",
      "analysis": "<2-3 sentences. Analyze the organic variance in their physical output.>"
    },
    "biometric-presence": {
      "score": <integer 0-100 — based on webcamScore>,
      "label": "Biometric Presence",
      "analysis": "<2-3 sentences. Evaluate their liveness signal and facial-spatial coordination.>"
    }
  },
  "modernHumanScore": <integer 0-1000: calculated as (bio-sensory×1.0 + cognitive-friction×1.5 + temporal-value×2.0 + irrational-link×2.5 + motor-autonomy×1.5 + biometric-presence×1.5), rounded. Maximum 1000.>,
  "overallAnalysis": "<4-5 sentences. A profound synthesis of the candidate's human nature. Identify the 'hidden thread' in their data. End with a definitive HCA certification statement.>",
  "certificationTier": "<exactly one of: Bronze | Silver | Gold | Platinum | Diamond>",
  "tierDescriptor": "<exactly one of: Fundamental Humanity | Cognitive Variability | High-Index Mortality | Behavioral Resilience | Peak Unpredictability>",
  "tierRationale": "<1-2 sentences. The specific evidence from their scan and answers that determined this tier.>"
}

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
