type NerResult = {
  entity_group: string;
  score: number;
  word: string;
  start: number;
  end: number;
};

export async function analyzeSentiment(
  text: string
): Promise<"POSITIVE" | "NEGATIVE" | "NEUTRAL" | "Err"> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error(
        "Hugging Face sentiment API returned an error:",
        result.error
      );
      return "Err";
    }

    if (Array.isArray(result) && Array.isArray(result[0]) && result[0][0]) {
      const sentiment = result[0][0];
      if (sentiment.score > 0.9) {
        return sentiment.label;
      }
    }

    return "NEUTRAL";
  } catch (error) {
    console.error("Exception caught in analyzeSentiment function:", error);
    return "Err";
  }
}

export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/dslim/bert-base-NER",
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          options: { group_entities: true },
        }),
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
      .map((entity) => entity.word.trim());

    return [...new Set(keywords)];
  } catch (error) {
    console.error("Error in extractKeywords:", error);
    return [];
  }
}
