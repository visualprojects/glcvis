/**
 * This js file implements the similarity-based ordering methods
 * From: Enhanced High Dimensional Data Visualization through Dimension Reduction and Attribute Arrangement
 * by: Almir Olivette Artero, Maria Cristina F. de Oliveira, Haim Levkowitz
 */

import { getMinDim, getMaxDim, getMaxIndex, getMinIndex, getCol} from "../basics/auxiliary";

/**
 * get the neighboring sequence when applying the ordering method by artero et al.
 * @param simMat
 */
export function artero(simMat) {
    // initial neighboring sequence
    var nc = getMiddleDim(simMat);
    while (nc.length !== simMat.length) {
        nc = getNextDim(simMat, nc);
    }
    return nc;
}

/**
 * get the two dimensions with the highest similarity
 * @param simMat
 * @returns {Array}
 */
function getMiddleDim(simMat) {
    var nc = [];
    var el;
    var er;
    var defaultMax = getMaxDim(simMat)[2] + 1;
    var defaultMin = getMinDim(simMat)[2] - 1;
    var simMeasure = "pcc";
    if (simMeasure === "euclidean") {
        el = getMinDim(simMat)[0];
        er = getMinDim(simMat)[1];
        // max out the former minimal
        simMat[el][er] = defaultMax;
    } else if (simMeasure === "pcc") {
        el = getMaxDim(simMat)[0];
        er = getMaxDim(simMat)[1];
        simMat[el][er] = defaultMin;
    }
    nc.push(el);
    nc.push(er);
    return nc;
}

/**
 * get the next dimension in neighboring sequence
 * @param simMat
 * @param nc
 * @returns {*}
 */
function getNextDim(simMat, nc) {
    var defaultMax = getMaxDim(simMat)[2];
    var defaultMin = -1;
    var el = nc[0];
    var er = nc[nc.length - 1];

    var simMeasure = "pcc";
    if (simMeasure === "euclidean") {
        var k1;
        var min1;
        var k2;
        var min2;
        // find out the dimension that are most similar to el
        if (getMinIndex(simMat[el])[1] < getMinIndex(getCol(simMat, el))[1]) {
            k1 = getMinIndex(simMat[el])[0];
            min1 = simMat[el][k1];
        } else {
            k1 = getMinIndex(getCol(simMat, el))[0];
            min1 = simMat[k1][el];
        }

        // find out the dimension that are most similar to er
        if (getMinIndex(simMat[er])[1] < getMinIndex(getCol(simMat, er))[1]) {
            k2 = getMinIndex(simMat[er])[0];
            min2 = simMat[er][k2];
        } else {
            k2 = getMinIndex(getCol(simMat, er))[0];
            min2 = simMat[k2][er];
        }


        if (min1 < min2) {
            nc.unshift(k1);
            for (var a = 0; a < simMat.length; a++) {
                simMat[el][a] = defaultMax;
            }
            for (var b = 0; b < simMat.length; b++) {
                simMat[b][el] = defaultMax;
            }

            simMat[k1][er] = defaultMax;
            simMat[er][k1] = defaultMax;

        } else {
            nc.push(k2);
            for (var a = 0; a < simMat.length; a++) {
                simMat[er][a] = defaultMax;
            }
            for (var b = 0; b < simMat.length; b++) {
                simMat[b][er] = defaultMax;
            }
            simMat[el][k2] = defaultMax;
            simMat[k2][el] = defaultMax;
        }

    } else if (simMeasure === "pcc") {
        var k1;
        var max1;
        var k2;
        var max2;
        // find out the dimension that are most similar to el
        if (getMaxIndex(simMat[el])[1] > getMaxIndex(getCol(simMat, el))[1]) {
            k1 = getMaxIndex(simMat[el])[0];
            max1 = simMat[el][k1];
        } else {
            k1 = getMaxIndex(getCol(simMat, el))[0];
            max1 = simMat[k1][el];
        }

        // find out the dimension that are most similar to er
        if (getMaxIndex(simMat[er])[1] > getMaxIndex(getCol(simMat, er))[1]) {
            k2 = getMaxIndex(simMat[er])[0];
            max2 = simMat[er][k2];
        } else {
            k2 = getMaxIndex(getCol(simMat, er))[0];
            max2 = simMat[k2][er];
        }


        if (max1 > max2) {
            nc.unshift(k1);
            for (var a = 0; a < simMat.length; a++) {
                simMat[el][a] = defaultMin;
            }
            for (var b = 0; b < simMat.length; b++) {
                simMat[b][el] = defaultMin;
            }

            simMat[k1][er] = defaultMin;
            simMat[er][k1] = defaultMin;

        } else {
            nc.push(k2);
            for (var a = 0; a < simMat.length; a++) {
                simMat[er][a] = defaultMin;
            }
            for (var b = 0; b < simMat.length; b++) {
                simMat[b][er] = defaultMin;
            }
            simMat[el][k2] = defaultMin;
            simMat[k2][el] = defaultMin;
        }
    }

    return nc;
}

