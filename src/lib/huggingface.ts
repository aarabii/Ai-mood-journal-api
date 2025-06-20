export async function analyzeSentiment(
  text: string
): Promise<"POSITIVE" | "NEGATIVE" | "NEUTRAL"> {
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
      return "NEUTRAL";
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
    return "NEUTRAL";
  }
}

export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/dslim/bert-base-NER",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          options: { group_entities: true },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error(
        "Hugging Face keyword API returned an error. Status:",
        response.status
      );
      console.error(
        "Error details:",
        result.error || "No specific error message provided."
      );
      return [];
    }

    if (!Array.isArray(result)) {
      console.error("Unexpected response format from keyword API:", result);
      return [];
    }

    const keywords = result
      .filter((entity) =>
        ["PER", "ORG", "LOC", "MISC"].includes(entity.entity_group)
      )
      .map((entity) => entity.word.trim());

    return [...new Set(keywords)];
  } catch (error) {
    console.error("Exception caught in extractKeywords function:", error);
    return [];
  }
}
