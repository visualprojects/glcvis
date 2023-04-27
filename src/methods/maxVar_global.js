/**
 * This js file implements the Maximum Variance of Neighboring Sequences Methods
 * from: Evaluating Reordering Strategies for Cluster Identification in Parallel Coordinates
 * by: Michael Blumenschein, Xuan Zhang, David Pomerenke, Daniel A. Keim, Johannes Fuchs
 */

import { permutator, getMaxIndex } from "../basics/auxiliary";
import { simOfTwo } from "./sim_global";

/**
 * Computes the neighboring sequence with the maximum variance of similarity scores using exhaustive search
 * @param dataArr
 * @param simMat
 * @returns {*}
 */
export function maxVAr_global(dataArr, simMat) {
    var allDim = [];
    var scores = [];
    for (var i = 0; i < dataArr[0].length - 1; i++) {
        allDim.push(i);
    }
    // get all possible neighboring sequences
    var allpermutation = permutator(allDim);
    // compute the variance score for each neighboring sequence
    for (var nc = 0; nc < allpermutation.length; nc++) {
        var score = getVarScore(allpermutation[nc], simMat);
        scores.push(score);
    }
    // get the maximum variance
    return allpermutation[getMaxIndex(scores)[0]];
}

/**
 * Computes the variance of similarity scores for a given neighboring sequence
 * @param nc
 * @param simMat
 * @returns {number}
 */
export function getVarScore(nc, simMat) {
    var score = [];
    // extract the similarity values for neighboring axes pairs and store and store them in an array
    for (var dim = 0; dim < nc.length - 1; dim++) {
        score.push(simOfTwo(nc[dim], nc[dim + 1], simMat));
    }
    return variance(score);
}

/**
 * Computes the variance of an array
 * @param arr
 * @returns {number}
 */
function variance(arr) {
    var len = 0;
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === "") {
        } else {
            len = len + 1;
            sum = sum + parseFloat(arr[i]);
        }
    }
    var v = 0;
    if (len > 1) {
        var mean = sum / len;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === "") {
            } else {
                v = v + (arr[i] - mean) * (arr[i] - mean);
            }
        }
        return v / len;
    }
    else {
        return 0;
    }
}