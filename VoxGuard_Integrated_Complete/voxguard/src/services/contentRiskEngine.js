/**
 * VoxGuard.AI Social-Engineering & Content Risk Engine
 * Deterministic NLP pattern analyzer for Speech-to-Text transcripts.
 * Evaluates sensitive requests, urgency, threats, financial demands, and authority claims.
 * 
 * Excludes normal sentimental language ("I love you", "I miss you") from security flags.
 */

export const CONTENT_RISK_THRESHOLDS = {
  CRITICAL: 75,
  HIGH: 50,
  MEDIUM: 25
};

export const contentRiskEngine = {
  /**
   * Analyze transcript for social engineering threats and calculate content risk score
   * @param {string} transcript 
   * @param {string} [language="en"] 
   */
  analyzeTranscript(transcript, language = "en") {
    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return {
        hasTranscript: false,
        contentRiskLevel: "LOW",
        contentRiskScore: 0,
        detectedSignals: [],
        highlightedTranscript: "",
        explanation: "No transcript available for content risk analysis."
      };
    }

    const text = transcript.trim();
    const detectedSignals = [];

    // 1. SENSITIVE INFORMATION REQUEST (Weight: 50)
    const sensitivePatterns = [
      /\b(otp|one-time password|one time password|verification code|upi pin|atm pin|pin code|security code|cvv|passcode|password|login credentials|recovery code|authentication code)\b/i,
      /\b(share|tell|give|send|read|forward)\b.{1,30}\b(otp|code|pin|password|cvv|number)\b/i,
      /\b(six digit number|number (that )?you (just )?received|code sent to your phone|read the code)\b/i
    ];
    let hasSensitive = false;
    for (const pat of sensitivePatterns) {
      const match = text.match(pat);
      if (match && !hasSensitive) {
        hasSensitive = true;
        detectedSignals.push({
          category: "Sensitive Information Request",
          riskContribution: 50,
          detectedPhrase: match[0],
          description: "Attempting to extract sensitive OTP, PIN, password, or security credentials."
        });
      }
    }

    // 2. URGENCY / PRESSURE (Weight: 20)
    const urgencyPatterns = [
      /\b(immediately|act now|only \d+ minutes|don't delay|right now|urgent|without delay|hurry|asap|time is running out)\b/i,
      /\b(must (verify|do this|act) (immediately|right now|now))\b/i
    ];
    let hasUrgency = false;
    for (const pat of urgencyPatterns) {
      const match = text.match(pat);
      if (match && !hasUrgency) {
        hasUrgency = true;
        detectedSignals.push({
          category: "Urgency / Pressure",
          riskContribution: 20,
          detectedPhrase: match[0],
          description: "Pressuring victim to act quickly without time to verify."
        });
      }
    }

    // 3. THREAT / FEAR MANIPULATION (Weight: 20)
    const threatPatterns = [
      /\b(account (will be|has been) (blocked|suspended|closed|frozen|cancelled)|legal action|police action|lose (your )?money|kyc (will be )?cancelled|account (has been )?compromised)\b/i
    ];
    let hasThreat = false;
    for (const pat of threatPatterns) {
      const match = text.match(pat);
      if (match && !hasThreat) {
        hasThreat = true;
        detectedSignals.push({
          category: "Threat / Fear Manipulation",
          riskContribution: 20,
          detectedPhrase: match[0],
          description: "Using account closure or legal threats to induce panic."
        });
      }
    }

    // 4. EMOTIONAL / SECRECY MANIPULATION (Weight: 15)
    // EXCLUDE benign phrases: "I love you", "I miss you", "feeling sad", "take care"
    const isBenignEmotional = /\b(i love you|i miss you|feeling sad|take care|hope you are well|good morning|good night)\b/i.test(text);
    const secrecyPatterns = [
      /\b(please trust me|don't tell anyone|keep (this )?secret|begging you|you're the only one|don't share with anyone|trust me)\b/i
    ];
    if (!isBenignEmotional) {
      let hasSecrecy = false;
      for (const pat of secrecyPatterns) {
        const match = text.match(pat);
        if (match && !hasSecrecy) {
          hasSecrecy = true;
          detectedSignals.push({
            category: "Trust / Secrecy Manipulation",
            riskContribution: 15,
            detectedPhrase: match[0],
            description: "Attempting to isolate the caller or demand secrecy."
          });
        }
      }
    }

    // 5. FINANCIAL REQUEST (Weight: 30)
    const financialPatterns = [
      /\b(transfer (the )?money|send (money|cash|payment|funds)|upi payment|gift card|crypto|bank transfer|pay now|loan|investment)\b/i,
      /\b(send|transfer|pay|deposit)\b.{1,20}\b(rs|₹|\$|dollars|amount)\b/i
    ];
    let hasFinancial = false;
    for (const pat of financialPatterns) {
      const match = text.match(pat);
      if (match && !hasFinancial) {
        hasFinancial = true;
        detectedSignals.push({
          category: "Financial Transfer Request",
          riskContribution: 30,
          detectedPhrase: match[0],
          description: "Requesting unauthorized money transfer, UPI payment, or gift cards."
        });
      }
    }

    // 6. AUTHORITY / IMPERSONATION CLAIM (Weight: 15)
    const authorityPatterns = [
      /\b(calling from (your |the )?(bank|police|government|company|support|security)|customer support|security department|manager|official)\b/i
    ];
    let hasAuthority = false;
    for (const pat of authorityPatterns) {
      const match = text.match(pat);
      if (match && !hasAuthority) {
        hasAuthority = true;
        detectedSignals.push({
          category: "Authority / Identity Claim",
          riskContribution: 15,
          detectedPhrase: match[0],
          description: "Claiming authority status (Bank, Support, Police) to build false credibility."
        });
      }
    }

    // Calculate total score & clamp to [0, 100]
    const rawScore = detectedSignals.reduce((sum, sig) => sum + sig.riskContribution, 0);
    const contentRiskScore = Math.min(100, Math.max(0, rawScore));

    let contentRiskLevel = "LOW";
    if (contentRiskScore >= CONTENT_RISK_THRESHOLDS.CRITICAL) {
      contentRiskLevel = "CRITICAL";
    } else if (contentRiskScore >= CONTENT_RISK_THRESHOLDS.HIGH) {
      contentRiskLevel = "HIGH";
    } else if (contentRiskScore >= CONTENT_RISK_THRESHOLDS.MEDIUM) {
      contentRiskLevel = "MEDIUM";
    }

    // Highlight detected phrases in transcript
    let highlightedTranscript = text;
    for (const sig of detectedSignals) {
      const regex = new RegExp(`(${sig.detectedPhrase})`, "gi");
      highlightedTranscript = highlightedTranscript.replace(regex, `<mark class="bg-rose-100 text-rose-900 font-bold px-1 rounded">$1</mark>`);
    }

    return {
      hasTranscript: true,
      transcript: text,
      contentRiskLevel,
      contentRiskScore,
      detectedSignals,
      highlightedTranscript,
      explanation: detectedSignals.length > 0
        ? `Detected ${detectedSignals.length} social-engineering risk indicator(s): ${detectedSignals.map((s) => s.category).join(", ")}.`
        : "No suspicious social-engineering patterns detected in conversation transcript."
    };
  },

  /**
   * Combine Voice Authenticity + Conversation Content Risk into Final Overall Security Risk
   * @param {Object} voiceResult - Output from riskEngine (classification, riskLevel, syntheticProbability)
   * @param {Object} contentResult - Output from contentRiskEngine
   */
  combineOverallRisk(voiceResult, contentResult) {
    const isSynthetic = voiceResult?.classification === "AI-GENERATED";
    const voiceRisk = voiceResult?.riskLevel || "LOW";
    const contentRisk = contentResult?.contentRiskLevel || "LOW";
    const contentScore = contentResult?.contentRiskScore || 0;
    const synthProb = voiceResult?.syntheticProbability || 0;

    let overallRiskLevel = "LOW";
    let overallVerdict = "SAFE_CONVERSATION";
    let summaryMessage = "Voice is authentic human speech and conversation patterns appear safe.";

    if (isSynthetic) {
      overallRiskLevel = "CRITICAL";
      overallVerdict = "AI_DEEPFAKE_CLONE_ATTACK";
      summaryMessage = `CRITICAL THREAT: Voice identified as AI-Generated Synthetic Clone (${synthProb}% probability).`;
    } else if (contentRisk === "CRITICAL" || contentScore >= 75) {
      overallRiskLevel = "CRITICAL";
      overallVerdict = "CRITICAL_SOCIAL_ENGINEERING_SCAM";
      summaryMessage = "CRITICAL THREAT: High-risk social engineering scam patterns detected (OTP/PIN/Bank credentials request).";
    } else if (contentRisk === "HIGH" || contentScore >= 50) {
      overallRiskLevel = "HIGH";
      overallVerdict = "SUSPECTED_SOCIAL_ENGINEERING_SCAM";
      summaryMessage = "HIGH THREAT: Suspicious conversation content detected (Urgency/Financial request).";
    } else if (voiceRisk === "HIGH" || contentRisk === "MEDIUM") {
      overallRiskLevel = "MEDIUM";
      overallVerdict = "MEDIUM_RISK_ATTENTION_REQUIRED";
      summaryMessage = "ATTENTION REQUIRED: Medium risk indicators present in conversation or acoustics.";
    }

    return {
      overallRiskLevel,
      overallVerdict,
      summaryMessage,
      voiceAuthenticity: voiceResult?.classification || "HUMAN",
      voiceProbability: voiceResult?.authenticProbability || 95,
      contentRiskLevel: contentRisk,
      contentRiskScore: contentScore,
      detectedSignalsCount: contentResult?.detectedSignals?.length || 0
    };
  }
};
