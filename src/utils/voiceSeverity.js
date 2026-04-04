export const detectSeverityFromText = (text) => {
  if (!text) return "LOW";
  const lowerText = text.toLowerCase();

  const highKeywords = ["unconscious", "bleeding", "not breathing", "critical", "severe"];
  const mediumKeywords = ["injury", "fracture", "pain", "burn"];
  const lowKeywords = ["minor", "small injury"];

  for (const keyword of highKeywords) {
    if (lowerText.includes(keyword)) return "HIGH";
  }

  for (const keyword of mediumKeywords) {
    if (lowerText.includes(keyword)) return "MEDIUM";
  }

  for (const keyword of lowKeywords) {
    if (lowerText.includes(keyword)) return "LOW";
  }

  return "LOW";
};
