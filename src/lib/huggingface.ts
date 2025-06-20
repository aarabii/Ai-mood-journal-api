interface Sentiment {
  label: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  score: number;
}
type SentimentResponse = Sentiment[][];

interface KeywordEntity {
  entity_group: string;
  score: number;
  word: string;
  start: number;
  end: number;
}
type KeywordResponse = KeywordEntity[];

async function queryHuggingFace(
  apiUrl: string,
  payload: { inputs: string },
  retries = 3
): Promise<SentimentResponse | KeywordResponse> {
  const HF_TOKEN = process.env.HF_TOKEN;

  if (!HF_TOKEN) {
    console.error("HF_TOKEN environment variable is not set.");
    throw new Error(
      "Application is not configured correctly. Missing HF_TOKEN."
    );
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (
          (response.status === 429 || response.status >= 500) &&
          attempt < retries
        ) {
          const delay = 1000 * attempt;
          console.warn(
            `HF API Error (${apiUrl}) - Attempt ${attempt}. Retrying in ${delay}ms. Status: ${response.status}`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(
          `Hugging Face API request failed: ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      if (!result || (Array.isArray(result) && result.length === 0)) {
        console.warn(
          `Empty response from Hugging Face API for model: ${apiUrl}`
        );
        return [];
      }
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error(
          `Final attempt to query Hugging Face API failed: ${apiUrl}`,
          error
        );
        throw error;
      }
    }
  }

  throw new Error("Unexpected error: all retry attempts failed");
}

export async function analyzeContent(content: string) {
  const SENTIMENT_MODEL_URL =
    "https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english";
  const KEYWORDS_MODEL_URL =
    "https://router.huggingface.co/hf-inference/models/dslim/bert-base-NER";

  try {
    const [sentimentResult, keywordsResult] = await Promise.all([
      queryHuggingFace(SENTIMENT_MODEL_URL, {
        inputs: content,
      }) as Promise<SentimentResponse>,
      queryHuggingFace(KEYWORDS_MODEL_URL, {
        inputs: content,
      }) as Promise<KeywordResponse>,
    ]);

    if (
      !sentimentResult ||
      !sentimentResult[0] ||
      sentimentResult[0].length === 0
    ) {
      throw new Error("Invalid sentiment analysis response from API.");
    }
    const topSentiment = sentimentResult[0].reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    if (!keywordsResult) {
      throw new Error("Invalid keywords extraction response from API.");
    }
    const keywords = [
      ...new Set(
        keywordsResult
          .filter(
            (entity) =>
              entity.score > 0.85 &&
              entity.word &&
              !entity.word.startsWith("##") &&
              entity.word.length > 2
          )
          .map((entity) => entity.word)
      ),
    ];

    return {
      sentiment: topSentiment.label,
      sentimentScore: topSentiment.score,
      keywords: keywords,
    };
  } catch (error) {
    console.error("Error during content analysis:", error);
    throw new Error(`Content analysis failed. Please check API services.`);
  }
}
