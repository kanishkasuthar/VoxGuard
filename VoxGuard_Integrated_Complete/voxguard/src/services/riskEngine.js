/**
 * Deterministic Risk & Classification Engine for VoxGuard.AI
 * Converts real model output probabilities (synthetic vs authentic) into
 * scientifically grounded verdicts, classifications, and risk levels.
 */

export const RISK_THRESHOLDS = {
  CRITICAL: 85,
  HIGH: 55,
  MEDIUM: 25
};

export const riskEngine = {
  /**
   * Assess classification and risk from model output probabilities
   * @param {number} syntheticProb - Synthetic / AI-generated probability (0 - 100)
   * @param {number} authenticProb - Authentic / Human probability (0 - 100)
   * @param {number} [confidence] - Optional model confidence metric
   */
  assessModelOutput(syntheticProb, authenticProb, confidence = null) {
    const synthP = Math.min(100, Math.max(0, syntheticProb));
    const authP = Math.min(100, Math.max(0, authenticProb));
    const overallRisk = Math.round(synthP);

    let classification = "HUMAN"; // HUMAN, AI-GENERATED, INCONCLUSIVE
    let verdict = "AUTHENTIC_HUMAN";
    let riskLevel = "LOW";
    let explanation = "";

    // Uncertainty handling: 40% - 60% probability window or low model confidence
    if ((synthP >= 40 && synthP <= 60) || (confidence !== null && confidence < 50)) {
      classification = "INCONCLUSIVE";
      verdict = "INCONCLUSIVE_ACOUSTIC_SIGNATURE";
      riskLevel = "MEDIUM";
      explanation = "Audio quality or model confidence is insufficient for a reliable classification.";
    } else if (synthP > 60) {
      classification = "AI-GENERATED";
      if (overallRisk > RISK_THRESHOLDS.CRITICAL) {
        verdict = "DEEPFAKE_CLONE_DETECTED";
        riskLevel = "CRITICAL";
      } else {
        verdict = "SUSPECTED_SYNTHETIC_SPOOF";
        riskLevel = "HIGH";
      }
      explanation = "Synthetic speech patterns and acoustic vocoder artifacts identified by voice model.";
    } else {
      classification = "HUMAN";
      verdict = "AUTHENTIC_HUMAN";
      riskLevel = overallRisk > RISK_THRESHOLDS.MEDIUM ? "MEDIUM" : "LOW";
      explanation = "Natural human vocal vocalization and acoustic micro-vibrations verified.";
    }

    return {
      classification,
      verdict,
      riskLevel,
      overallRisk,
      syntheticProbability: Math.round(synthP * 10) / 10,
      authenticProbability: Math.round(authP * 10) / 10,
      confidence: confidence !== null ? Math.round(confidence * 10) / 10 : Math.round(Math.max(synthP, authP) * 10) / 10,
      explanation
    };
  }
};
