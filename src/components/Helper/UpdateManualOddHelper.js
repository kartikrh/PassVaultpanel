// Custom approximation of the error function (erf)
const customErf = (x) => {
    // Coefficients for approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    // Save the sign of x
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    // Compute approximation
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
};

/**
 * Predicts the probability that Team B will win using a simple Normal distribution model.
 * @param {number} teamAFinalScore - The final score (target) set by Team A
 * @param {number} teamBExpectedFinalScore - Estimated final score for Team B (mean of Normal)
 * @param {number} favRatio - Standard deviation for Team B's final score (default: 10.0)
 * @param {number} totalOvers - Total overs in the match (optional)
 * @returns {number} Probability (0.0 to 1.0) that Team B will reach or exceed Team A's score
 */
export const predictWinProbability = (
    teamAFinalScore,
    teamBExpectedFinalScore,
    favRatio = 10.0,
    totalOvers = 20
) => {
    // If either score is missing, return default probability
    if (!teamAFinalScore || !teamBExpectedFinalScore) {
        return 0.5; // Default to 50/50
    }

    // Model Team B's final score ~ Normal(µ, σ²)
    const mu = teamBExpectedFinalScore;
    const sigma = favRatio;

    // Calculate z-value for normal distribution
    const zValue = (teamAFinalScore - mu) / sigma;

    // Calculate CDF using error function (erf)
    const cdfValue = (0.5 * (1 + customErf(zValue / Math.sqrt(2)))).toFixed(2);

    // Calculate win probability
    let probabilityBWins = 1.0 - parseFloat(cdfValue);

    // Clip to [0, 1] range
    return Math.max(0.0, Math.min(probabilityBWins, 1.0));
};
/**
 * Calculate decimal odds for two outcomes based on win probabilities and margin
 * 
 * @param {number} pBFair - Win probability for team B (0.0 to 1.0)
 * @param {number} margin - Margin to apply (0.05 = 5%)
 * @returns {Array} - Array containing [teamBOdds, teamAOdds]
 */
export const decimalOddsTwoOutcomes = (pBFair, margin = 0.05) => {
    // Probability of Team A winning
    const pAFair = 1.0 - pBFair;

    // Apply margin to probabilities
    const adjustedProbA = pAFair * (1 + margin);
    const adjustedProbB = pBFair * (1 + margin);

    // Calculate back odds with margin
    // Using 1.0 instead of 1.025 as in the original formula to match your example
    const oddsA = adjustedProbA > 0 ? 1 / adjustedProbA : 999;
    const oddsB = adjustedProbB > 0 ? 1 / adjustedProbB : 999;

    return [
        Number(oddsB.toFixed(2)),
        Number(oddsA.toFixed(2))
    ];
};

/**
 * Calculate lay odds from back odds using a lay margin
 * 
 * @param {number} backOdds - Back odds
 * @param {number} layMargin - Lay margin to apply (0.05 = 5%)
 * @returns {number} - Lay odds
 */
export const calculateLayFromBack = (backOdds, layMargin = 0.05) => {
    // If back odds are invalid, return 0
    if (!backOdds || backOdds <= 1) return 0;

    // Apply lay margin to back odds
    // Formula: layOdds = backOdds / (1 - layMargin)
    return Number((backOdds / (1 - layMargin)).toFixed(2));
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
