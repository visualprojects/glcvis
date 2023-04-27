/**
 * This js file implements the contribution-based Methods
 * From: Two axes re-ordering methods in parallel coordinates plots
 * by:Liang Fu Lu, Mao Lin Huang, Jinson Zhang
 */

import {getDataMat, deepCopy, getCol, sum, getMaxIndex, getMinIndex} from "../basics/auxiliary"
import { numeric } from "../basics/svd";

/**
 * contribution method by lu et al.
 * @param dataArray
 * @returns {any[]}
 */
export function luCon(dataArray) {
    var dataMat = getDataMat(dataArray);
    var conRate = deepCopy(getConRate(dataMat));
    var nc = new Array(conRate.length);
    var defaultMin = getMinIndex(conRate)[1] * 0.5;

    for (var i = 0; i < conRate.length; i++) {
        var indexOfMax = getMaxIndex(conRate)[0];
        //get the dimension with the highest contribution rate
        nc[i] = indexOfMax;
        // set the visited value as minimal
        conRate[indexOfMax] = defaultMin;
    }

    console.log('nc', nc)
    return nc;
}

/**
 * get the contribution rate of each dimension
 * @param dataMat
 * @returns {any[]}
 */
export function getConRate(dataMat) {
    var v = numeric.svd(dataMat);
    console.log('svd', dataMat)
    var firstColumn = getCol(v, 0);
    var conSum = sum(firstColumn);
    var conRates = new Array(firstColumn.length);
    for (var i = 0; i < firstColumn.length; i++) {
        conRates[i] = firstColumn[i] / conSum;
    }
    console.log(conRates);
    return conRates;
}