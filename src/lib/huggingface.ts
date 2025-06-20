type SentimentResult = {
  label: "POSITIVE" | "NEGATIVE";
  score: number;
};

type NerResult = {
  entity_group: string;
  score: number;
  word: string;
};

export async function analyzeSentiment(
  text: string
): Promise<"POSITIVE" | "NEGATIVE" | "NEUTRAL"> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face sentiment API error:", errorText);
      throw new Error(`Sentiment analysis API failed: ${response.statusText}`);
    }

    const result: SentimentResult[][] = await response.json();
    const sentiment = result[0][0];

    if (sentiment.score < 0.6) return "NEUTRAL";
    return sentiment.label;
  } catch (error) {
    console.error("Error in analyzeSentiment:", error);
    return "NEUTRAL";
  }
}

export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/dslim/bert-base-NER",
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face NER API error:", errorText);
      throw new Error(`Keyword extraction API failed: ${response.statusText}`);
    }

    const results: NerResult[] = await response.json();

    const keywords = results
      .filter((entity) =>
        ["PER", "ORG", "LOC", "MISC"].includes(entity.entity_group)
      )
      .map((entity) => entity.word.replace(/##/g, ""))
      .filter((word) => word.length > 2);

    return [...new Set(keywords)];
  } catch (error) {
    console.error("Error in extractKeywords:", error);
    return [];
  }
}
