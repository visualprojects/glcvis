/**
 * This js file implements the Pargnostics method
 * from: Pargnostics: Screen-Space Metrics for Parallel Coordinates
 * by: Aritra Dasgupta, Robert Kosara
 */


function pargnostics(dataArr, t1, t2, t3, t4, t5, t6) {
    var dim = [];
    var dataMat = getDataMat(dataArr);
    for (var i = 0; i < dataArr[0].length - 1; i++) {
        dim.push(i);
    }
    var allPermutation = permutator(dim);
    var scores = [];
    for (var index = 0; index < allPermutation.length; index++) {
        scores.push(score_Pargnostics(dataMat, allPermutation[index], t1, t2, t3, t4, t5, t6));
    }
    return allPermutation[getMinIndex(scores)[0]];
}


function score_Pargnostics(dataMat, nc, t1, t2, t3, t4, t5, t6) {
    var score = 0;
    for (var i = 0; i < dataMat[0].length - 1; i++) {
        score = score + score_twoDim(dataMat, i, t1, t2, t3, t4, t5, t6);
    }
    return score;
}

/**
 * This function calculates the score between two dimensions.
 * @param dataMat
 * @param dim
 * @param t1 threshold
 * @param t2 threshold
 * @param t3 threshold
 * @param t4 threshold
 * @param t5 threshold
 * @param t6 threshold
 * @returns {number}
 */
function score_twoDim(dataMat, dim, t1, t2, t3, t4, t5, t6) {
    var crossingData = getCrossingData(dataMat, dim);
    var appearanceTable = getAppearanceTable(dataMat, dim, dim + 1);

    if (crossingData.length > 0) {

        return -t1 * crossingData.length
            + t2 * getCrossingAngels(dataMat, crossingData, dim)
            + t3 * getParallelism(dataMat, dim)
            + t4 * getMI(dataMat, appearanceTable, dim)
            + t5 * getConDi(dataMat, dim)
            - t6 * overPlotting(dataMat, dim)
            ;
    } else {
        return -t1 * crossingData.length
            + t3 * getParallelism(dataMat, dim)
            + t4 * getMI(dataMat, appearanceTable, dim)
            + t5 * getConDi(dataMat, dim)
            - t6 * overPlotting(dataMat, dim)
            ;
    }


}

/**
 * This Function returns the number of  crossing lines between two neighboring dimensions
 * @param dataMat
 * @param dim
 * @returns {Array}
 */
function getCrossingData(dataMat, dim) {
    var crossings = 0;
    var crossingData = [];
    var dataPoints = [];
    for (var i = 0; i < dataMat.length; i++) {
        dataPoints.push(i);
    }
    var combinations = k_combinations(dataPoints, 2);
    for (var index = 0; index < combinations.length; index++) {
        var dataA = dataMat[combinations[index][0]];
        var dataB = dataMat[combinations[index][1]];
        if ((dataA[dim] < dataB[dim] && dataA[dim + 1] > dataB[dim + 1]) || (dataA[dim] > dataB[dim] && dataA[dim + 1] < dataB[dim + 1])) {
            crossings++;
            crossingData.push(combinations[index]);
        }
    }
    return crossingData;
}

/**
 * Calculate the average crossing angles between two dimensions
 * @param dataMat
 * @param dim
 * @param crossingData
 * @returns {*}
 */
function getCrossingAngels(dataMat, crossingData, dim) {
    var crossingAngles = [];
    if (crossingData.length !== 0) {
        for (var i = 0; i < crossingData.length; i++) {
            var dataA = dataMat[crossingData[i][0]];
            var dataB = dataMat[crossingData[i][1]];
            var slopeA = 0;
            var slopeB = 0;
            if (dataA[dim] !== dataA[dim + 1]) {
                slopeA = dataA[dim + 1] - dataA[dim];
            }
            if (dataB[dim] !== dataB[dim + 1]) {
                slopeB = dataB[dim + 1] - dataB[dim];
            }

            var tan = Math.atan((slopeA - slopeB) / (1 + slopeA * slopeB)) / Math.PI * 180;
            crossingAngles.push(Math.min(tan, 90 - tan));
        }
        return median(crossingAngles);
    } else {
        throw("no crossing lines");
    }
}

function getParallelism(dataMat, dim) {
    var para = [];
    for (var i = 0; i < dataMat.length; i++) {
        para.push(dataMat[i][dim + 1] - dataMat[i][dim]);
    }
    para.sort(function (a, b) {
        return a - b;
    });

    var arr1 = [];
    var arr2 = [];
    for (var a = 0; a < para.length / 2; a++) {
        arr1.push(para[a]);
    }
    for (var b = para.length / 2; b < para.length; b++) {
        arr2.push(para[b]);
    }
    var p25 = median(arr1);

    var p75 = median(arr2);

    return 1 - Math.abs(p25 - p75);
}

/**
 * This function returns the mutual information between two neighboring dimensions
 * @param dataMat
 * @param dim
 * @param appearanceTable
 * @returns {number}
 */
function getMI(dataMat, appearanceTable, dim) {
    var arrA = getCol(dataMat, dim);
    var mi = 0;
    for (var i = 0; i < appearanceTable.length; i++) {
        for (var j = 0; j < appearanceTable[0].length; j++) {
            var p_x = sum(getCol(appearanceTable, j)) / arrA.length;
            var p_y = sum(appearanceTable[i]) / arrA.length;
            var p_xy = appearanceTable[i][j] / arrA.length;
            if (p_xy !== 0) {
                mi = mi + p_xy * getBaseLog(2, (p_xy / (p_x * p_y)));
            }
        }
    }
    return mi;
}

/**
 * This function returns the convergence/divergence between two neighboring dimensions
 * @param dataMat
 * @param dim
 * @returns {number}
 */
function getConDi(dataMat, dim) {
    var con = 0;
    var di = 0;
    var max = 0;
    var appearanceTableA = getAppearanceTable(dataMat, dim, dim + 1);
    var appearanceTableB = getAppearanceTable(dataMat, dim + 1, dim);
    for (var i = 0; i < appearanceTableA.length; i++) {
        for (var j = 0; j < appearanceTableA[0].length; j++) {
            if (appearanceTableA[i][j] > 0) {
                con++;
            }
            if (appearanceTableA[i][j] > max) {
                max = appearanceTableA[i][j];
            }
        }
    }

    for (var a = 0; a < appearanceTableB.length; a++) {
        for (var b = 0; b < appearanceTableB[0].length; b++) {
            if (appearanceTableB[a][b] > 0) {
                di++;
            }
        }
    }


    return Math.max(con / max, di / max);
}

/**
 * This function returns how over-plotted an space between two dimension is.
 * @param dataMat
 * @param dim
 * @returns {number}
 */
function overPlotting(dataMat, dim) {
    var op = 0;
    var appearanceTable = getAppearanceTable(dataMat, dim, dim + 1);
    for (var i = 0; i < appearanceTable.length; i++) {
        for (var j = 0; j < appearanceTable[0].length; j++) {
            if (appearanceTable[i][j] > 0) {
                op++;
            }
        }
    }
    var n = dataMat.length;
    return 2 * op / (n * (n + 1));
}
