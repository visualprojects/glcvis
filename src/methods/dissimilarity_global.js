/**
 * Implements the Dissimilarity-based Methods
 * from: Evaluating Reordering Strategies for Cluster Identification in Parallel Coordinates
 * by: Michael Blumenschein, Xuan Zhang, David Pomerenke, Daniel A. Keim, Johannes Fuchs
 */

import { permutator, getMaxIndex, getMinIndex } from "../basics/auxiliary";
import { getScore } from "./sim_global";

/**
 * Computes the neighboring sequence with the highest overall dissimilarity score using exhaustive search
 * @param dataArr
 * @param simMat
 * @returns {*}
 */
export function dissim_global(dataArr, simMat) {
    var allDim = [];
    var scores = [];
    var simMeasure = "pcc";
    for (var i = 0; i < dataArr[0].length - 1; i++) {
        allDim.push(i);
    }
    var allpermutation = permutator(allDim);
    for (var nc = 0; nc < allpermutation.length; nc++) {
        var score = getScore(allpermutation[nc], simMat);
        scores.push(score);
    }
    if (simMeasure === "euclidean") {
        return allpermutation[getMaxIndex(scores)[0]];
    } else if (simMeasure === "pcc") {
        return allpermutation[getMinIndex(scores)[0]];
    }

}
