/**
 * Contains basic functions to handle data matrix, similarity matrix, validation and etc.
 */


/**
 * calculate the euclidean distance of two dimensions
 * @param dimensionA: array A
 * @param dimensionB: array B
 * @returns {number}: euclidean distance
 */
export function euclidean(dimensionA, dimensionB) {
    var distance = 0;
    if (dimensionA.length === dimensionB.length) {
        for (var i = 0; i < dimensionA.length; i++) {
            var temp = Math.pow(dimensionA[i] - dimensionB[i], 2);
            distance = distance + temp;
        }
        distance = Math.sqrt(distance);
    } else {
        throw ("Error: tow arrays do not have the same length");
    }
    return distance;
}

/**
 * calculate the pearson's correlation coefficient
 * @param dimensionA: array A
 * @param dimensionB: array B
 * @returns {number} pcc
 */
export function pcc(dimensionA, dimensionB) {
    if (dimensionA.length === dimensionB.length) {
        var meanA = avg(dimensionA);
        var meanB = avg(dimensionB);
        var numerator = generateNumerator(dimensionA, dimensionB, meanA, meanB);
        var denumerator = generateDenumerator(dimensionA, dimensionB, meanA, meanB);
        return numerator / denumerator;
    } else {
        throw ("Errors in similarity calculation");
    }
}

/**
 * calculate the mean of an array
 * @param dimension
 * @returns {number}
 */
function avg(dimension) {
    return sum(dimension) / dimension.length;
}

/**
 * get the sum of one dimension
 * @param dimension
 * @returns {number}
 */
export function sum(dimension) {
    var sum = 0;
    for (var i = 0; i < dimension.length; i++) {
        sum = sum + dimension[i];
    }
    return sum;
}


/**
 * auxiliary function for pcc calculation
 * @param dimensionA
 * @param dimensionB
 * @param meanA
 * @param meanB
 * @returns {number}
 */
function generateNumerator(dimensionA, dimensionB, meanA, meanB) {
    var numerator = 0;
    for (var i = 0; i < dimensionA.length; i++) {
        numerator += (dimensionA[i] - meanA) * (dimensionB[i] - meanB);
    }
    return numerator;

}

/**
 * auxiliary function for pcc calculation
 * @param dimensionA
 * @param dimensionB
 * @param meanA
 * @param meanB
 * @returns {number}
 */
function generateDenumerator(dimensionA, dimensionB, meanA, meanB) {
    var sumA = 0;
    var sumB = 0;
    for (var i = 0; i < dimensionA.length; i++) {
        sumA += (dimensionA[i] - meanA) * (dimensionA[i] - meanA);
    }
    for (var j = 0; j < dimensionB.length; j++) {
        sumB += (dimensionB[j] - meanB) * (dimensionB[j] - meanB);
    }
    return Math.sqrt(sumA * sumB);
}


/**
 * get the i-th column in the data array
 * @param matrix
 * @param col
 * @returns {Array}
 */
export function getCol(matrix, col) {
    var column = [];
    if (col >= matrix[0].length || col < 0) {
        alert("wrong column number:" + col);
    } else {
        for (var i = 0; i < matrix.length; i++) {
            column.push(matrix[i][col]);
        }
    }
    return column;
}

/**
 * get the data in a dimension and parse them into numbers
 * @param matrix
 * @param col
 * @returns {Array}
 */
export function getColNumbers(matrix, col) {
    var column = [];
    if (col >= matrix[0].length || col < 0) {
        alert("wrong column number:" + col);
    } else {
        for (var i = 1; i < matrix.length; i++) {
            column.push(Number(matrix[i][col]));
        }
    }
    return column;
}

/**
 * get similarity matrix
 * @param dataArray
 * @returns {any[]}
 */
export function getSimMat(dataArray, selectedMethod="0") {
    var simMat = new Array(dataArray[0].length - 1);
    var simMeasure = "pcc"//document.getElementById("similarity").value;
    for (var i = 0; i < dataArray[0].length - 1; i++) {
        simMat[i] = new Array(dataArray[0].length - 1);
        for (var j = 0; j < i; j++) {
            if (simMeasure === "euclidean") {
                simMat[i][j] = euclidean(getColNumbers(dataArray, i + 1), getColNumbers(dataArray, j + 1));
            } else if (simMeasure === "pcc") {
                simMat[i][j] = Math.abs(pcc(getColNumbers(dataArray, i + 1), getColNumbers(dataArray, j + 1)));
                simMat[j][i] = Math.abs(pcc(getColNumbers(dataArray, i + 1), getColNumbers(dataArray, j + 1)));
            }
        }
    }
    var defaultMax = getMaxDim(simMat)[2] + 1;

    for (i = 0; i < dataArray[0].length - 1; i++) {
        for (j = i; j < simMat.length; j++) {
            if (simMeasure === "euclidean" && selectedMethod !== "12") {
                simMat[i][j] = defaultMax;
            } else if (simMeasure === "euclidean" && selectedMethod === "12") {
                simMat[i][j] = -1;
            } else if (simMeasure === "pcc" && selectedMethod !== "12") {
                simMat[i][j] = -1;
            } else {
                simMat[i][j] = 2
            }
        }
    }
    console.log(simMat);
    return simMat;
}

/**
 * get the index of the maximal in 2-d array, and the maximal value
 * @param arr
 * @returns {*[]}
 */
export function getMaxDim(arr) {
    var largest = arr[1][0];
    var a = 1;
    var b = 0;
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < i; j++) {
            if (arr[i][j] > largest) {
                largest = arr[i][j];
                a = i;
                b = j;
            }
        }
    }
    return [a, b, largest];
}

/**
 * get the index of the minimal in 2-d array, and the minimal value
 * @param arr
 * @returns {*[]}
 */
export function getMinDim(arr) {
    var min = arr[1][0];
    var a = 1;
    var b = 0;
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < i; j++) {
            if (arr[i][j] < min) {
                min = arr[i][j];
                a = i;
                b = j;
            }
        }
    }
    return [a, b, min];
}

/**
 * get the index of maximal in an 1-d array, and the maximal value
 * @param arr
 * @returns {*[]}
 */
export function getMaxIndex(arr) {
    var max = arr[0];
    var a = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] > max) {
            a = i;
            max = arr[i];
        }
    }
    return [a, max];
}

/**
 * get the index of minimal in an 1-d array, and the minimal value
 * @param arr
 * @returns {*[]}
 */
export function getMinIndex(arr) {
    var min = arr[0];
    var a = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < min) {
            a = i;
            min = arr[i];
        }
    }
    return [a, min];
}


/**
 * part of function 'reconstruct'
 * @param dataArray
 * @param nc
 * @param row
 * @returns {*[]}
 */
function getRow(dataArray, nc, row) {
    var newRow = [dataArray[row][0]];
    for (var i = 0; i < nc.length; i++) {
        newRow.push(dataArray[row][nc[i] + 1]);
    }
    return newRow;
}

/**
 * form the data array according to the neighboring sequence
 * @param dataArray
 * @param nc
 * @returns {Array}
 */
export function reconstruct(dataArray, nc) {
    var newArr = [];
    for (var row = 0; row < dataArray.length; row++) {
        newArr.push(getRow(dataArray, nc, row));
    }
    console.log(nc);
    return newArr;
}


/**
 * deep copy an object
 * @param obj
 * @returns {Array}
 */
export function deepCopy(obj) {
    var out = [],
        i = 0,
        len = obj.length;
    for (; i < len; i++) {
        if (obj[i] instanceof Array) {
            out[i] = deepCopy(obj[i]);
        } else out[i] = obj[i];
    }
    return out;
}

/**
 * transform the data array into matrix with only numbers
 * @param dataArr
 * @returns {Array}
 */
export function getDataMat(dataArr) {
    var numMat = deepCopy(dataArr);
    for (var i = 0; i < dataArr.length; i++) {
        numMat[i].splice(0, 1);
    }
    numMat.splice(0, 1);
    for (var row = 0; row < numMat.length; row++) {
        for (var col = 0; col < numMat[0].length; col++) {
            numMat[row][col] = Number(numMat[row][col]);
        }
    }

    return numMat;
}


/**
 * all possible permutations of all the dimensions without the arrays that are in backwards order of a former array
 * @param inputArr
 */
export function permutator(inputArr) {
    var results = [];

    function permute(arr, memo) {
        var cur, memo = memo || [];

        for (var i = 0; i < arr.length; i++) {
            cur = arr.splice(i, 1);
            if (arr.length === 0) {
                results.push(memo.concat(cur));
            }
            permute(arr.slice(), memo.concat(cur));
            arr.splice(i, 0, cur[0]);
        }

        return results;
    }

    return permute(inputArr);
}

/**
 * get the normalized data array
 * @param dataArray
 * @returns {Array}
 */
export function getNomArr(dataArray) {
    var dataMat = getDataMat(dataArray);
    var nomArr = deepCopy(dataArray);
    for (var dim = 0; dim < dataMat[0].length; dim++) {
        var col = getCol(dataMat, dim);
        var max = getMaxIndex(col)[1];
        var min = getMinIndex(col)[1];
        var diff = max - min;
        for (var i = 0; i < col.length; i++) {
            nomArr[i + 1][dim + 1] = (col[i] - min) / diff;
        }
    }
    return nomArr;
}

/**
 * Convert an array to array of objects
 * @param data
 * @returns {Array}
 */
function convertToArrayOfObjects(data) {
    var keys = data.shift(),
        i = 0,
        k = 0,
        obj = null,
        output = [];
    for (i = 0; i < data.length; i++) {
        obj = {};
        for (k = 0; k < keys.length; k++) {
            obj[keys[k]] = data[i][k];
        }
        output.push(obj);
    }
    return output;
}

/**
 * Round a number
 * @param number
 * @param precision
 * @returns {number}
 */
function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

/**
 * retruns the median of an array
 * @param values
 * @returns {*}
 */
function median(values) {

    values.sort(function (a, b) {
        return a - b;
    });

    var half = Math.floor(values.length / 2);

    if (values.length % 2)
        return values[half];
    else
        return (values[half - 1] + values[half]) / 2.0;
}


/**
 * This function changes the base of the logarithm function
 * @param x
 * @param y
 * @returns {number}
 */
function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

/**
 * This function calculates the entropy of an array
 * @param arr
 * @returns {number}
 */
function pixel_entropy(arr) {

    var entropy = 0;
    var values = getValues(arr);

    for (var a = 0; a < values.length; a++) {
        var h = values[a].length / arr.length;
        entropy = entropy - h * getBaseLog(2, 1 / h);
    }
    return entropy;
}

/**
 * This function forms a 2-d array for calculating the mutual information
 * @param dataMat
 * @param dimA
 * @param dimB
 * @returns {Array}
 */
function getAppearanceTable(dataMat, dimA, dimB) {
    var arrA = getCol(dataMat, dimA);
    var arrB = getCol(dataMat, dimB);
    var valuesA = getValues(arrA);
    var valuesB = getValues(arrB);
    var appearanceTable = [];
    for (var i = 0; i < valuesA.length; i++) {
        appearanceTable.push([]);
        for (var j = 0; j < valuesB.length; j++) {
            var count = 0;
            var numA = valuesA[i][0];
            var numB = valuesB[j][0];
            for (var a = 0; a < arrA.length; a++) {
                if (arrA[a] === numA && arrB[a] === numB) {
                    count++;
                }
            }
            appearanceTable[i].push(count);
        }
    }
    return appearanceTable;
}

/**
 * This function put same existing values together for further calculation of entropy
 * @param arr
 * @returns {Array}
 */
function getValues(arr) {
    var values = [];
    values.push([arr[0]]);
    for (var i = 1; i < arr.length; i++) {
        var inArr = false;
        var index = 0;
        for (var j = 0; j < values.length; j++) {
            if (values[j].indexOf(arr[i]) !== -1) {
                inArr = true;
                index = j;
            }
        }
        if (inArr) {
            values[index].push(arr[i]);
        } else {
            values.push([arr[i]]);
        }
    }
    return values;
}

function forDigit(dight, how) {

    return Math.round(dight * Math.pow(10, how)) / Math.pow(10, how);
}

function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = Object.keys(objArray[0]).join() + '\r\n';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line !== '') line += ',';

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function getSimValues(simMat) {
    var results = [["Interval", "A", "B", "C", "D", "E", "F", "G"]];
    var simValues = [];

    results.push(["simValue"]);
    results.push(["linear_norm"]);
    results.push(["ZScore_norm"]);
    for (var i = 0; i < simMat.length - 1; i++) {
        results[1].push(simMat[i + 1][i]);
        simValues.push(simMat[i + 1][i])
    }

    var min = getMinIndex(simValues)[1];
    var max = getMaxIndex(simValues)[1];
    var sd = standardDeviation(simValues);
    var sum = simValues.reduce(function (a, b) {
        return a + b;
    });
    var avg = sum / simValues.length;

    for (var j = 0; j < simValues.length; j++) {
        results[2].push((simValues[j] - min) / (max - min));
        results[3].push((simValues[j] - avg) / sd);
    }

    return results;
}

function standardDeviation(numbersArr) {
    //--CALCULATE AVAREGE--
    var total = 0;
    for (var key in numbersArr)
        total += numbersArr[key];
    var meanVal = total / numbersArr.length;
    //--CALCULATE AVAREGE--

    //--CALCULATE STANDARD DEVIATION--
    var SDprep = 0;
    for (var key in numbersArr)
        SDprep += Math.pow((parseFloat(numbersArr[key]) - meanVal), 2);
    var SDresult = Math.sqrt(SDprep / numbersArr.length);
    //--CALCULATE STANDARD DEVIATION--
    return SDresult;

}