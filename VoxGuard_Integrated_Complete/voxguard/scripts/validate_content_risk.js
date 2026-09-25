import { contentRiskEngine } from "../src/services/contentRiskEngine.js";

console.log("==================================================");
console.log("VOXGUARD.AI SOCIAL ENGINEERING CONTENT RISK TESTS");
console.log("==================================================");

const testCases = [
  {
    id: "TEST 1",
    transcript: "Please share the OTP you received.",
    expectedRisk: ["HIGH", "CRITICAL"],
    expectedCategories: ["Sensitive Information Request"]
  },
  {
    id: "TEST 2",
    transcript: "Your bank account will be blocked. Tell me the OTP immediately.",
    expectedRisk: ["HIGH", "CRITICAL"],
    expectedCategories: ["Sensitive Information Request", "Threat / Fear Manipulation", "Urgency / Pressure"]
  },
  {
    id: "TEST 3 (False-Positive Check)",
    transcript: "I miss you and I love you.",
    expectedRisk: ["LOW"],
    expectedCategories: []
  },
  {
    id: "TEST 4",
    transcript: "Please trust me. Don't tell anyone. Send me the verification code immediately.",
    expectedRisk: ["HIGH", "CRITICAL"],
    expectedCategories: ["Sensitive Information Request", "Trust / Secrecy Manipulation", "Urgency / Pressure"]
  },
  {
    id: "TEST 5",
    transcript: "Can you please help me with my homework?",
    expectedRisk: ["LOW"],
    expectedCategories: []
  }
];

let passedCount = 0;

for (const tc of testCases) {
  console.log(`\n--- Running ${tc.id} ---`);
  console.log(`Transcript: "${tc.transcript}"`);

  const res = contentRiskEngine.analyzeTranscript(tc.transcript);

  console.log(`Calculated Score: ${res.contentRiskScore} / 100`);
  console.log(`Content Risk Level: ${res.contentRiskLevel}`);
  console.log(`Detected Categories:`, res.detectedSignals.map((s) => s.category));

  const isRiskPassed = tc.expectedRisk.includes(res.contentRiskLevel);
  const isCategoryPassed = tc.expectedCategories.every((cat) =>
    res.detectedSignals.some((s) => s.category === cat)
  );

  if (isRiskPassed && isCategoryPassed) {
    console.log(`✓ ${tc.id} PASSED!`);
    passedCount++;
  } else {
    console.error(`❌ ${tc.id} FAILED! Expected risk in [${tc.expectedRisk.join(", ")}], got ${res.contentRiskLevel}`);
  }
}

console.log("\n==================================================");
console.log(`TEST RESULTS: ${passedCount} / ${testCases.length} PASSED`);
console.log("==================================================");

if (passedCount !== testCases.length) {
  process.exit(1);
}
