/**
 * This js file implements the similarity-based Methods
 * From: Two axes re-ordering methods in parallel coordinates plots
 * by:Liang Fu Lu, Mao Lin Huang, Jinson Zhang
 */

import { getConRate } from "./luCon";
import { pcc, getMaxDim, deepCopy, getMaxIndex, getMinIndex, getMinDim, getDataMat, getColNumbers } from "../basics/auxiliary";

/**
 * similarity-based Ordering by Lu et al.
 * @param dataArray
 * @returns {any[]}
 */
export function luSim(dataArray) {
    var conRate = getConRate(getDataMat(dataArray));
    var nc = new Array(conRate.length);

    // Similarity Matrix
    var simMat = new Array(dataArray[0].length - 1);
    var simMeasure = "pcc" //document.getElementById("similarity").value;
    for (var i = 0; i < dataArray[0].length - 1; i++) {
        simMat[i] = new Array(dataArray[0].length - 1);
        for (var j = 0; j < i; j++) {
            // dissimilarity
            if (simMeasure === "euclidean") {
                simMat[i][j] = euclidean(getColNumbers(dataArray, i + 1), getColNumbers(dataArray, j + 1));
                simMat[j][i] = euclidean(getColNumbers(dataArray, i + 1), getColNumbers(dataArray, j + 1));
            }
            // similarity
            else if (simMeasure === "pcc") {
                simMat[i][j] = Math.abs(pcc(getColNumbers(dataArray, i + 1), getColNumbers(dataArray, j + 1)));
                simMat[j][i] = Math.abs(pcc(getColNumbers(dataArray, i + 1), getColNumbers(dataArray, j + 1)));
            }
        }
    }

    console.log(simMat);
    if (simMeasure === "euclidean") {
        var defaultMax = getMaxDim(simMat)[2] + 1;
        for (var diag = 0; diag < conRate.length; diag++) {
            simMat[diag][diag] = defaultMax;
        }

        var simMatCopy = deepCopy(simMat);
        var row = getMaxIndex(conRate)[0];
        nc[0] = row;
        for (var m = 0; m < simMat.length; m++) {
            simMatCopy[m][row] = defaultMax;
        }
        for (var index = 1; index < nc.length; index++) {
            nc[index] = getMinIndex(simMatCopy[row])[0];
            simMatCopy[row][nc[index]] = defaultMax;
            simMatCopy[nc[index]][row] = defaultMax;
            row = nc[index];
            for(var n = 0; n<simMatCopy.length;n++){
                simMatCopy[n][row] = defaultMax;
            }
        }
    } else if (simMeasure === "pcc") {
        var defaultMin = getMinDim(simMat)[2] - 1;
        for (var diag2 = 0; diag2 < conRate.length; diag2++) {
            simMat[diag2][diag2] = defaultMin;
        }

        var simMatCopy2 = deepCopy(simMat);
        var row2 = getMaxIndex(conRate)[0];
        nc[0] = row2;
        for (var a = 0; a < simMat.length; a++) {
            simMatCopy2[a][row2] = defaultMin;
        }
        for (var index2 = 1; index2 < nc.length; index2++) {
            nc[index2] = getMaxIndex(simMatCopy2[row2])[0];
            simMatCopy2[row2][nc[index2]] = defaultMin;
            simMatCopy2[nc[index2]][row2] = defaultMin;
            row2 = nc[index2];
            for(var b = 0; b<simMatCopy2.length;b++){
                simMatCopy2[b][row2] = defaultMin;
            }
        }
    }

    return nc;
}