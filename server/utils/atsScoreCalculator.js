/**
 * ATS Resume Score Calculator
 * Evaluates resume quality based on multiple criteria
 * Total Score: 0-100
 */

export const calculateATSScore = (resumeText) => {
  if (!resumeText || typeof resumeText !== "string") {
    return {
      score: 0,
      strengths: [],
      missing: [
        "No resume text provided",
        "Unable to analyze resume content"
      ],
      suggestions: [
        "Upload a valid resume PDF",
        "Ensure resume contains meaningful content"
      ]
    };
  }

  const text = resumeText.toLowerCase();
  let score = 0;
  const strengths = [];
  const missing = [];
  const suggestions = [];

  // A. Keyword Density (20 points)
  const keywordDensityScore = evaluateKeywordDensity(text, strengths, missing);
  score += keywordDensityScore;

  // B. Technical Skills Match (25 points)
  const technicalSkillsScore = evaluateTechnicalSkills(text, strengths, missing);
  score += technicalSkillsScore;

  // C. Formatting Structure (15 points)
  const formattingScore = evaluateFormatting(text, strengths, missing);
  score += formattingScore;

  // D. Impact Metrics (20 points)
  const impactMetricsScore = evaluateImpactMetrics(text, strengths, missing);
  score += impactMetricsScore;

  // E. Professional Links (10 points)
  const professionalLinksScore = evaluateProfessionalLinks(text, strengths, missing);
  score += professionalLinksScore;

  // F. Resume Length Quality (10 points)
  const lengthScore = evaluateResumeLength(text, strengths, missing);
  score += lengthScore;

  // Generate suggestions based on missing items
  generateSuggestions(missing, suggestions, text);

  // Ensure score is between 0-100
  score = Math.min(100, Math.max(0, score));

  return {
    score: Math.round(score),
    strengths: [...new Set(strengths)], // Remove duplicates
    missing: [...new Set(missing)],
    suggestions: [...new Set(suggestions)]
  };
};

/**
 * A. Keyword Density Evaluation (20 points)
 * Checks for presence of key resume sections
 */
function evaluateKeywordDensity(text, strengths, missing) {
  let score = 0;
  const keywords = [
    { keyword: "project", weight: 4 },
    { keyword: "skill", weight: 4 },
    { keyword: "experience", weight: 4 },
    { keyword: "education", weight: 4 },
    { keyword: "internship", weight: 2 },
    { keyword: "certification", weight: 2 }
  ];

  for (const item of keywords) {
    if (text.includes(item.keyword)) {
      score += item.weight;
      strengths.push(`Includes ${item.keyword} section`);
    } else {
      missing.push(`Missing ${item.keyword} details`);
    }
  }

  return Math.min(20, score);
}

/**
 * B. Technical Skills Match Evaluation (25 points)
 * Detects presence of relevant technical keywords
 */
function evaluateTechnicalSkills(text, strengths, missing) {
  let score = 0;
  const technicalKeywords = [
    { skill: "javascript", weight: 2.5 },
    { skill: "react", weight: 2.5 },
    { skill: "node.js", weight: 2.5 },
    { skill: "nodejs", weight: 2.5 },
    { skill: "mongodb", weight: 2.5 },
    { skill: "python", weight: 2 },
    { skill: "sql", weight: 2 },
    { skill: "machine learning", weight: 2 },
    { skill: "data structure", weight: 2 },
    { skill: "system design", weight: 2 },
    { skill: "git", weight: 1.5 }
  ];

  const foundSkills = [];

  for (const item of technicalKeywords) {
    if (text.includes(item.skill)) {
      score += item.weight;
      if (!foundSkills.includes(item.skill)) {
        foundSkills.push(item.skill);
      }
    }
  }

  if (foundSkills.length > 0) {
    strengths.push(`Strong technical skills coverage (${foundSkills.join(", ")})`);
  } else {
    missing.push("Add relevant technical skills (JavaScript, React, Node.js, etc.)");
  }

  return Math.min(25, score);
}

/**
 * C. Formatting Structure Evaluation (15 points)
 * Checks for proper resume formatting
 */
function evaluateFormatting(text, strengths, missing) {
  let score = 0;

  // Check for bullet points
  if (text.includes("•") || text.includes("·") || text.includes("-")) {
    score += 5;
    strengths.push("Uses bullet points for clarity");
  } else {
    missing.push("Add bullet points for better readability");
  }

  // Check for section headers (all caps or common patterns)
  const sectionPatterns = [
    /experience/i,
    /education/i,
    /skill/i,
    /project/i,
    /certification/i
  ];

  let sectionCount = 0;
  for (const pattern of sectionPatterns) {
    if (pattern.test(text)) {
      sectionCount++;
    }
  }

  if (sectionCount >= 3) {
    score += 5;
    strengths.push("Well-structured sections");
  } else if (sectionCount >= 1) {
    score += 2;
  } else {
    missing.push("Add clear section headers");
  }

  // Check for consistent capitalization
  const capitalizedWords = (text.match(/\b[A-Z][a-z]+\b/g) || []).length;
  const totalWords = text.split(/\s+/).length;
  const capitalizationRatio = capitalizedWords / totalWords;

  if (capitalizationRatio > 0.15) {
    score += 5;
    strengths.push("Consistent capitalization");
  } else {
    missing.push("Improve capitalization consistency");
  }

  return Math.min(15, score);
}

/**
 * D. Impact Metrics Evaluation (20 points)
 * Detects quantifiable achievements
 */
function evaluateImpactMetrics(text, strengths, missing) {
  let score = 0;
  const percentPattern = /%/;
  const numberPattern = /\b\d+\b/g;
  const impactKeywords = [
    { word: "increased", weight: 2 },
    { word: "improved", weight: 2 },
    { word: "reduced", weight: 2 },
    { word: "optimized", weight: 2 },
    { word: "launched", weight: 1.5 },
    { word: "built", weight: 1.5 },
    { word: "developed", weight: 1 }
  ];

  // Check for percentages
  if (percentPattern.test(text)) {
    score += 5;
    strengths.push("Includes percentage metrics");
  }

  // Check for numbers
  const numbers = text.match(numberPattern) || [];
  if (numbers.length > 5) {
    score += 5;
    strengths.push("Includes quantified results");
  } else if (numbers.length > 0) {
    score += 2;
  } else {
    missing.push("Add quantified achievements with numbers");
  }

  // Check for impact keywords
  let impactKeywordCount = 0;
  for (const item of impactKeywords) {
    if (text.includes(item.word)) {
      score += item.weight;
      impactKeywordCount++;
    }
  }

  if (impactKeywordCount > 3) {
    strengths.push("Includes measurable achievements");
  } else if (impactKeywordCount === 0) {
    missing.push("Add action verbs and impact statements");
    suggestions.push("Use words like 'improved', 'increased', 'optimized'");
  }

  return Math.min(20, Math.max(0, score));
}

/**
 * E. Professional Links Evaluation (10 points)
 * Checks for online presence links
 */
function evaluateProfessionalLinks(text, strengths, missing) {
  let score = 0;
  const links = {
    github: { keyword: "github", weight: 4 },
    linkedin: { keyword: "linkedin", weight: 3 },
    portfolio: { keyword: "portfolio", weight: 3 }
  };

  const foundLinks = [];

  for (const [key, item] of Object.entries(links)) {
    if (text.includes(item.keyword)) {
      score += item.weight;
      foundLinks.push(key);
    }
  }

  if (foundLinks.length > 0) {
    strengths.push(`Includes professional links (${foundLinks.join(", ")})`);
  } else {
    missing.push("Add GitHub profile link");
    missing.push("Add LinkedIn profile");
  }

  return Math.min(10, score);
}

/**
 * F. Resume Length Quality Evaluation (10 points)
 * Checks if resume length is optimal (300-900 words)
 */
function evaluateResumeLength(text, strengths, missing) {
  let score = 10;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  if (wordCount >= 300 && wordCount <= 900) {
    strengths.push("Optimal resume length");
    return score;
  } else if (wordCount < 150) {
    score = 0;
    missing.push("Resume too short (minimum 300 words recommended)");
  } else if (wordCount < 300) {
    score = 5;
    missing.push("Resume should be at least 300 words");
  } else if (wordCount > 1200) {
    score = 5;
    missing.push("Resume too long (keep under 900 words)");
  } else {
    score = 7;
  }

  return score;
}

/**
 * Generate suggestions based on missing items
 */
function generateSuggestions(missing, suggestions, text) {
  if (missing.includes("Missing project details")) {
    suggestions.push("Add project descriptions with technology stack");
  }

  if (missing.includes("Missing skill details")) {
    suggestions.push("Create a dedicated skills section");
  }

  if (missing.includes("Missing experience details")) {
    suggestions.push("Include job titles, companies, and date ranges");
  }

  if (missing.includes("Missing education details")) {
    suggestions.push("Add degree, institution, and graduation date");
  }

  if (missing.includes("Add bullet points for better readability")) {
    suggestions.push("Use bullet points to break up large text blocks");
  }

  if (missing.includes("Missing GitHub profile link") || missing.includes("Add GitHub profile link")) {
    suggestions.push("Add GitHub profile to showcase your code");
  }

  if (missing.includes("Add LinkedIn profile")) {
    suggestions.push("Include LinkedIn URL for professional networking");
  }

  if (missing.includes("Add quantified achievements with numbers")) {
    suggestions.push("Include metrics: % improvement, users impacted, performance gains");
  }

  if (missing.includes("Add clear section headers")) {
    suggestions.push("Use clear headers: EXPERIENCE, EDUCATION, SKILLS");
  }

  // Remove duplicates
  return [...new Set(suggestions)];
}
