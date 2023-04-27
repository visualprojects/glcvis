/**
 * This js file implements the pattern-based Methods
 * from: Axes Re-ordering in Parallel Coordinate for Pattern Optimization
 * by: Hemant Makwana, Sanjay Tanwani, Suresh Jain
 */

import { k_combinations } from "../basics/combinations";
import { getCol, permutator, getMinIndex } from "../basics/auxiliary";

/**
 * pattern-optimization ordering by makwana et al.
 * @param dataArray
 * @returns {*}
 */
export function makwana(dataArray) {
    var dim = [];
    for (var i = 0; i < dataArray[0].length - 1; i++) {
        dim.push(i);
    }

    // construct the Difference table
    var headRow = k_combinations(dim, 2);
    var diffTable = [];
    diffTable.push(headRow);
    for (var row = 1; row < dataArray.length; row++) {
        diffTable.push([]);
        for (var col = 0; col < headRow.length; col++) {
            diffTable[row].push(getSolpClass(dataArray[row][headRow[col][0] + 1], dataArray[row][headRow[col][1] + 1]));
        }
    }

    // construct the frequency table
    // 1st row: sum of a
    // 2nd row: sum of b
    // 3rd row: sum of c
    var freqTable = [];
    freqTable.push(headRow);
    var classes = ["a", "b", "c"];
    for (var iteration = 1; iteration < 4; iteration++) {
        freqTable.push([]);
        for (var j = 0; j < headRow.length; j++) {
            freqTable[iteration].push(countClass(getCol(diffTable, j), classes[iteration - 1]));
        }
    }

    console.log(freqTable);
    var allPermutation = permutator(dim);
    return getMinNC_Pattern(freqTable, allPermutation);
}

/**
 * given two numbers, return the slope classification
 * @param num1
 * @param num2
 * @returns {string}
 */
function getSolpClass(num1, num2) {
    var slopeClass = "undefined";
    if (num1 < num2) {
        slopeClass = "a";
    } else if (num1 > num2) {
        slopeClass = "c";
    } else {
        slopeClass = "b";
    }

    if (slopeClass === "undefined") {
        throw("Errors in slope classification");
    }


    return slopeClass;
}

/**
 * count the appearance of one slope class
 * @param col
 * @param slopeClass
 * @returns {number}
 */
function countClass(col, slopeClass) {
    var sum = 0;
    for (var row = 1; row < col.length; row++) {
        if (col[row] === slopeClass) {
            sum++;
        }
    }
    return sum;
}


/**
 * calculate a score for one possible neighboring sequence
 * @param freqTable
 * @param nc
 * @returns {number}
 */
function score_Pattern(freqTable, nc) {
    var score = 0;
    for (var i = 0; i < nc.length - 1; i++) {
        score = score + getFrequncy(freqTable, nc[i], nc[i + 1]);
    }
    if (score === 0) {
        throw ("Error in score calculation");
    }
    return score;
}

/**
 * get the frequency of the most appeared pattern(slope) between two dimensions: dim1 and dim2
 * @param freqTable
 * @param dim1
 * @param dim2
 * @returns {number}
 */
function getFrequncy(freqTable, dim1, dim2) {
    var headRow = freqTable[0];
    var frequency = 0;
    for (var i = 0; i < headRow.length; i++) {
        if ((headRow[i][0] === dim1 && headRow[i][1] === dim2) || (headRow[i][0] === dim2 && headRow[i][1] === dim1)) {
            var col = getCol(freqTable, i);
            for (var j = 1; j < col.length; j++) {
                if (col[j] > frequency) {
                    frequency = col[j];
                }
            }
        }
    }
    if (frequency === 0) {
        throw ("Error in frequency calculation.");
    }
    return frequency;
}

/**
 * get the neighboring sequence with the max score
 * @param freqTable
 * @param ncArr
 * @returns {*}
 */
function getMinNC_Pattern(freqTable, ncArr) {
    var scores = new Array(ncArr.length);
    for (var i = 0; i < scores.length; i++) {
        scores[i] = score_Pattern(freqTable, ncArr[i]);
    }
    console.log(getMinIndex(scores)[1]);
    return ncArr[getMinIndex(scores)[0]];
}