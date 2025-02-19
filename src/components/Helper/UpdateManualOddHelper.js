import { erf } from 'mathjs';

/**
 * Predicts the probability that Team B will win using a simple Normal distribution model.
 * @param {number} teamAFinalScore - The final score (target) set by Team A
 * @param {number} teamBCurrentOvers - Overs that Team B has already batted (e.g., 5.3 overs = 5.5)
 * @param {number} teamBCurrentScore - Team B's current runs at the time of prediction
 * @param {number} teamBExpectedFinalScore - Estimated final score for Team B (mean of Normal)
 * @param {number} stdDev - Standard deviation for Team B's final score (default: 10.0)
 * @param {number} maxOvers - Maximum overs in the innings (default: 10.0)
 * @returns {number} Probability (0.0 to 1.0) that Team B will reach or exceed Team A's score
 */
export const predictWinProbability = (
    teamAFinalScore,
    teamBCurrentOvers,
    teamBCurrentScore,
    teamBExpectedFinalScore,
    stdDev = 10.0,
    maxOvers = 10.0
) => {
    // 1. If Team B has already exceeded the target, probability = 100%
    if (teamBCurrentScore >= teamAFinalScore) {
        return 1.0;
    }

    // 2. If innings are finished and Team B hasn't passed, probability = 0%
    if (teamBCurrentOvers >= maxOvers) {
        return 0.0;
    }

    // 3. Model Team B's final score ~ Normal(µ, σ²)
    const mu = teamBExpectedFinalScore;
    const sigma = stdDev;

    // Calculate z-value for normal distribution
    const zValue = (teamAFinalScore - mu) / sigma;

    // Calculate CDF using error function (erf)
    // Note: JavaScript's normal distribution CDF calculation using error function
    // CDF = 0.5 * (1 + erf(z / √2))
    const cdfValue = 0.5 * (1 + erf(zValue / Math.sqrt(2)));

    // Calculate win probability
    let probabilityBWins = 1.0 - cdfValue;

    // Clip to [0, 1] range
    probabilityBWins = Math.max(0.0, Math.min(probabilityBWins, 1.0));

    return probabilityBWins;
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

    // Calculate decimal odds (1.025 factor matches Python implementation)
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