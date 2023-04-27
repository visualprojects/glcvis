/**
 * This js file implements the Minimum Variance of Neighboring Sequences Methods
 */

import { permutator, getMinIndex } from "../basics/auxiliary";
import { getVarScore } from "./maxVar_global";

/**
 * Computes the neighboring sequence with the minimum variance of similarity scores using exhaustive search
 * @param dataArr
 * @param simMat
 * @returns {*}
 */
export function minVAr_global(dataArr, simMat) {
    var allDim = [];
    var scores = [];
    for (var i = 0; i < dataArr[0].length - 1; i++) {
        allDim.push(i);
    }
    var allpermutation = permutator(allDim);
    for (var nc = 0; nc < allpermutation.length; nc++) {
        var score = getVarScore(allpermutation[nc], simMat);
        scores.push(score);
    }
    return allpermutation[getMinIndex(scores)[0]];
}