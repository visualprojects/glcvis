import { zoom } from 'd3-zoom'
import { select, selectAll } from 'd3-selection'
import { line } from 'd3-shape'
import { schemeTableau10 } from 'd3-scale-chromatic'
import { scaleOrdinal } from 'd3-scale';
import { drag } from 'd3-drag';
import { peng } from '../methods/peng_pc'
import { artero } from '../methods/artero'
import { luCon } from '../methods/luCon';
import { luSim } from '../methods/luSim';
import { makwana } from '../methods/makwana';
import { sim_global } from '../methods/sim_global';
import { dissim_global } from '../methods/dissimilarity_global';
import { maxVAr_global } from '../methods/maxVar_global';
import { minVAr_global } from '../methods/minVar_global';
import { artero_dis } from '../methods/artero_dis';
import { getNomArr, deepCopy, getSimMat } from '../basics/auxiliary'

export default class Chart {
    constructor({data, width, height, selector, type, dimensions, target, dynamic, ordering="0"}) {

        this.data = data;
        this.width = width;
        this.height = height;
        this.selector = selector;
        this.type = type;
        this.dimensions = dimensions;
        this.target = target;
        this.dynamic = dynamic;

        console.log(this.dimensions)

        /*el hack para reusar los algoritmos. consiste en pasar los datos al formato de ellos*/
        let newarr = this.data.map((obj, i) => {
            return [i].concat(this.dimensions.map(d => obj[d]));
        });
        newarr.unshift(["id"].concat(this.dimensions))

        var dataArray = [[]];
        var hasNullValue = [];

        //construct the data array
        for (var i = 0; i < newarr.length; i++) {
            var row = newarr[i];
            dataArray[i] = row;
            var cells = row.join(",").split(",");
            for (var j = 0; j < cells.length; j++) {
                dataArray[i][j] = cells[j];
            }
        }


        // delete rows with null value(s)
        for (var a = 1; a < dataArray.length; a++) {
            for (var b = 0; b < dataArray[0].length; b++) {
                if (dataArray[a][b] === "") {
                    hasNullValue.push(a);
                    break;
                }
            }
        }
        var deleted = 0;
        for (var index = 0; index < hasNullValue.length; index++) {
            dataArray.splice(hasNullValue[index] - deleted, 1);
            deleted++;
        }
        
        var nomArr = getNomArr(dataArray);

        switch (ordering) {
            //Default ordering
            case "0":
                break;
            //Clutter-based Methods
            case "1":
                this.dimensions = peng(nomArr).map(i => this.dimensions[i])
                break;
            //Contribution-based Methods
            case "2":
                this.dimensions = luCon(dataArray).map(i => this.dimensions[i])
                break;
            //Similarity-based Methods by Artero et al.
            case "3":
                var simMat = deepCopy(getSimMat(nomArr));
                this.dimensions = artero(simMat).map(i => this.dimensions[i])
                break;
            //Similarity-based Methods by Lu et al.
            case "4":
                this.dimensions = luSim(dataArray).map(i => this.dimensions[i])
                break;
            //Pattern Optimization Method
            case "5":
                this.dimensions = makwana(nomArr).map(i => this.dimensions[i])
                break;
            //Similarity-Global
            case "6":
                var simMat2 = deepCopy(getSimMat(dataArray));
                this.dimensions = sim_global(dataArray, simMat2).map(i => this.dimensions[i])
                break;
            //Dissimilarity-Global
            case "7":
                var simMat3 = deepCopy(getSimMat(dataArray));
                this.dimensions = dissim_global(dataArray, simMat3).map(i => this.dimensions[i])
                break;
            //Maximizing Variance of Neighboring Dimensions
            case "8":
                var simMat4 = deepCopy(getSimMat(dataArray));
                this.dimensions = maxVAr_global(dataArray, simMat4).map(i => this.dimensions[i])
                break;
            //Similarity-based Method(Min Variance)
            case "9":
                var simMat5 = deepCopy(getSimMat(dataArray));
                this.dimensions = minVAr_global(dataArray, simMat5).map(i => this.dimensions[i])  
                break;
            //Disimilarity-based Method based on Artero et al.
            case "10":
                var simMat6 = deepCopy(getSimMat(dataArray, "12"));
                this.dimensions =  artero_dis(simMat6).map(i => this.dimensions[i]) 
                break;
            default:
                alert("Sorry, something is wrong.");

        }

        console.log("dim after reordering", this.dimensions)
        
        //////////////////////////////////////////////////////////////
        
        if (this.dimensions.length%2!=0 && ["cpc","spc","apc","epc","prc","pwc"].includes(this.type)){
            let last_dim = this.dimensions.slice(-1)
            this.data.map(l => l[`${last_dim}_2`]=l[last_dim])
            this.dimensions = this.dimensions.concat(last_dim)            
        }

        //Store the interal structure of the chart
        this.axis = null;
        this.items = null;
        this.filtered_items = null
        this.dualview = null

        this.initElements()
        if (this.target!==null)
            this.createLegend()
    }

    draw(){
    }

    initElements(){

        const margin = {top: 30, right: 10, bottom: 10, left: 10};
        this.width = this.width - margin.left - margin.right;
        this.height = this.height - margin.top - margin.bottom;

        const markerBoxWidth = 10,
            markerBoxHeight = 10,
            refX = markerBoxWidth / 2,
            refY = markerBoxHeight / 2,
            arrowPoints = [[0, 0], [0, 10], [10, 5]];

        this.svg = select(this.selector).append("svg")
            .attr("width", this.width + margin.left + margin.right)
            .attr("height", this.height + margin.top + margin.bottom)
            .call(zoom().on("start zoom end", event => {
                this.svg.attr("transform", event.transform)
            }))
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        this.svg
            .append('defs')
            .append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
            .attr('refX', refX)
            .attr('refY', refY)
            .attr('markerWidth', markerBoxWidth)
            .attr('markerHeight', markerBoxHeight)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', line()(arrowPoints))
            .attr('stroke', 'black');
    
        this.values_target = [... new Set(this.data.map(d => d[this.target]))]

        if (this.target==null)
        this.colorScale = scaleOrdinal()
            .domain(this.values_target).range(["black"])
        else
            this.colorScale = scaleOrdinal(schemeTableau10)
            .domain(this.values_target)
    
    }

    createLegend(){
        
        const size = 10


        const fdrag = drag().on("drag", (event) => {
            container.attr("transform",`translate(${event.x}, ${event.y})`)
        })
        

        const container = this.svg.append("g")
            .attr("class", "legend")
            .style("position","absolute")
            .attr("transform",`translate(${10}, ${30})`)
            .style("left", 10)
            .style("top", 10)
            .call(fdrag)
            
        //Target label
        container.selectAll("label")
            .data([this.target])
            .enter()
            .append("text")
            .attr("x", 115)
            .attr("y", 85)
            .text(d => d)
            .attr("text-anchor", "middle")
            .attr("text-transform", "uppercase")
            .style("alignment-baseline", "left")

        container.selectAll("mydots")
            .data(this.values_target)
            .enter()
            .append("rect")
            .attr("x", 100)
            .attr("y", function(d,i){ return 100 + i*(size+5)})
            .attr("width", size)
            .attr("height", size)
            .style("fill", d => this.colorScale(d))
            .on("click", (j, e) => {
                this.items
                    .style("display", d =>  d[this.target]==e?null:"none")
            })

        // Add one dot in the legend for each name.
        container.selectAll("mylabels")
            .data(this.values_target)
            .enter()
            .append("text")
            .attr("x", 100 + size*1.2)
            .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)})
            .style("fill", d => this.colorScale(d))
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }

    initBrush(scale){

        const selections = new Map();
    
        this.brushed = (event, key) => {
        
            event.sourceEvent.stopPropagation()

            let selection = event.selection

            if (selection === null) selections.delete(key);
            else selections.set(key, selection.map(l => scale[key].invert(l)))

            var temp = []

            this.items.each(function(d) {
                const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
                if (active)
                    temp.push(d)
                select(this).style("display", active ? null : "none");
            })

            this.filtered_items = temp

            if (this.dualview){
                this.dualview.getItems()
                    .style("display", d => this.filtered_items.includes(d)?null:"none")
            }
        }
    }

    setOpacity(value){
        this.items.attr("opacity", value)
    }

    setDualView(view){
        this.dualview = view
    }

    getAxis(){
        return this.axis
    }

    getItems(){
        return this.items
    }

    getFiltered(){
        return this.filtered_items
    }

    colorize(value){
        if (value)
            this.items.style("stroke", d => this.colorScale(d[this.target]))
        else
            this.items.style("stroke", "black")

        selectAll(".legend").style("display", value?null:"none")
    }
};
