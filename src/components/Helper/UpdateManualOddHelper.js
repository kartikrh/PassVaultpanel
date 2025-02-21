/**
 * Predicts the probability that Team B will win using a simple Normal distribution model.
 * @param {number} teamAFinalScore - The final score (target) set by Team A
 * @param {number} teamBExpectedFinalScore - Estimated final score for Team B (mean of Normal)
 * @param {number} stdDev - Standard deviation for Team B's final score (default: 10.0)
 * @returns {number} Probability (0.0 to 1.0) that Team B will reach or exceed Team A's score
 */

// Custom approximation of the error function (erf)
const customErf = (x) => {
    // Coefficients for approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    // Save the sign of x
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    // Compute approximation
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
};

export const predictWinProbability = (
    teamAFinalScore,
    teamBExpectedFinalScore,
    stdDev = 10.0
) => {
    // Model Team B's final score ~ Normal(µ, σ²)
    const mu = teamBExpectedFinalScore;
    const sigma = stdDev;

    // Calculate z-value for normal distribution
    const zValue = (teamAFinalScore - mu) / sigma;

    // Calculate CDF using error function (erf)
    const cdfValue = 0.5 * (1 + customErf(zValue / Math.sqrt(2)));

    // Calculate win probability
    let probabilityBWins = 1.0 - cdfValue;

    // Clip to [0, 1] range
    return Math.max(0.0, Math.min(probabilityBWins, 1.0));
};

/**
 * Convert a fair probability into two-outcome decimal odds with a margin (overround)
 * @param {number} pBFair - Probability of Team B winning (0 < pBFair < 1)
 * @param {number} margin - Desired total overround (0.05 means 5% margin)
 * @returns {[number, number]} [oddsB, oddsA] - Decimal odds for Team B and Team A
 */
export const decimalOddsTwoOutcomes = (pBFair, margin = 0.05) => {
    // Probability of Team A winning
    const pAFair = 1.0 - pBFair;

    // Inflate probabilities so that pB + pA = 1 + margin
    const pBInflated = pBFair * (1 + margin);
    const pAInflated = pAFair * (1 + margin);

    // Calculate decimal odds
    const oddsB = 1.025 / pBInflated;
    const oddsA = 1.025 / pAInflated;

    return [oddsB, oddsA];
};

/**
 * Calculate the expected final score based on current run rate
 * @param {number} currentScore - Current score
 * @param {number} currentOvers - Current overs completed
 * @param {number} maxOvers - Maximum overs in the innings
 * @returns {number} Expected final score
 */
export const calculateExpectedFinalScore = (currentScore, currentOvers, maxOvers) => {
    if (currentOvers === 0) return 0;
    const currentRunRate = currentScore / currentOvers;
    return Math.round(currentRunRate * maxOvers);
};
