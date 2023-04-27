/**
 * This js file implements the clutter-based reordering method
 * from: Clutter Reduction in Multi-Dimensional Data Visualization Using Dimension Reordering
 * by: Wei Peng, Matthew O. Ward, Elke A. Rundensteiner
 */

import {getDataMat, permutator, euclidean, getMinIndex} from "../basics/auxiliary"
import {k_combinations} from "../basics/combinations"

/**
 * Clutter-based reordering for Parallel Coordinates by Peng et al.
 * @param dataArray
 * @returns {*}
 */
 export function peng(dataArray) {
    
    var dataMat = getDataMat(dataArray);

    var threshold = 0.1;
    //var threshold = Number(document.getElementById("threshold").value); //tener cuidado con esto
    var outlierTable = getOutlierTable(dataMat, threshold);
    var dim = [];
    for (var i = 0; i < dataArray[0].length - 1; i++) {
        dim.push(i);
    }

    var allPermutation = permutator(dim);
    var scores = [];
    for (var index = 0; index < allPermutation.length; index++) {
        scores.push(score_Clutter(outlierTable, allPermutation[index]));
    }
    //console.log(allPermutation[getMinIndex(scores)[0]]);
    return allPermutation[getMinIndex(scores)[0]];
    
}

/**
 * construct a table that stores the number of outliers between each pairs of dimensions
 * @param dataMat
 * @param threshold
 * @returns {Array}
 */
function getOutlierTable(dataMat, threshold) {
    var outlierTable = [];
    var dim = [];
    for (var i = 0; i < dataMat[0].length; i++) {
        dim.push(i);
    }

    var headRow = k_combinations(dim, 2);
  
    outlierTable.push(headRow);
    outlierTable.push([]);
    for (var cell = 0; cell < headRow.length; cell++) {
        var outlier = 0;
        for (var index = 0; index < dataMat.length; index++) {
            if (isOutlier(dataMat, index, threshold, headRow[cell][0], headRow[cell][1])) {
                outlier++;
            }
        }
        outlierTable[1].push(outlier);
    }
    //console.log(outlierTable);
    return outlierTable;
}

/**
 * test if the distance from a certain data to any other data points is greater than threshold
 * @param dataMat
 * @param index
 * @param threshold
 * @param dim1
 * @param dim2
 * @returns {boolean}
 */
function isOutlier(dataMat, index, threshold, dim1, dim2) {
    if (index >= dataMat.length) {
        throw("Error: Wrong index");
    } else {
        var isOutlier = true;
        var x = [dataMat[index][dim1], dataMat[index][dim2]];
        for (var i = 0; i < dataMat.length; i++) {
            var y = [dataMat[i][dim1], dataMat[i][dim2]];
            if (i !== index && euclidean(x, y) < threshold) {
                isOutlier = false;
            }
        }
        return isOutlier;
    }
}

/**
 * given a neighboring sequence,  calculate how many clutter there is.
 * @param outlierTable
 * @param nc
 * @returns {number}
 */
function score_Clutter(outlierTable, nc) {
    var score = 0;
    for (var i = 0; i < nc.length - 1; i++) {
        score = score + getOutlier(outlierTable, nc[i], nc[i + 1]);
    }
    return score;
}

/**
 * given two dimensions, calculate the clutter between them
 * @param outlierTable
 * @param dim1
 * @param dim2
 * @returns {number}
 */
function getOutlier(outlierTable, dim1, dim2) {
    var headRow = outlierTable[0];
    var outlier = 0;
    for (var i = 0; i < headRow.length; i++) {
        if ((headRow[i][0] === dim1 && headRow[i][1] === dim2) || (headRow[i][0] === dim2 && headRow[i][1] === dim1)) {
            outlier = outlierTable[1][i];
        }
    }
    return outlier;
}