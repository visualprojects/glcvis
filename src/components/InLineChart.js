import Chart from './BaseClass'
import { keys } from 'd3-collection'
import { scaleLinear } from 'd3-scale'
import { range, extent, pairs } from 'd3-array'
import { brushX } from 'd3-brush'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'

export default class InlineChart extends Chart {
    
    constructor(params) {
        super(params)
        this.TYPE_LINE = 'CURVE'
        this.classes = null,
        this.oneclass = null
    }

    draw(){

        //const TARGET = 'class'

        //const dimensions = keys(data[0]).filter(d => d != this.target )
    
        const segment = this.width / this.dimensions.length,
            middle_segment = segment/2,
            brushHeight = 30,
            orientations = range(this.dimensions.length).map(l => 0)

        var ydomain = {}
        keys(this.data[0]).filter((d,i) => {
            return d != this.target && (ydomain[d] = scaleLinear()
            .domain(extent(this.data, function(p) { return +p[d]; }))
            .range([0, segment]))
            
        })

        const height_scale = scaleLinear()
            .domain([0, 2*segment])
            .range([this.height/2, 0])

        const dheight_scale = scaleLinear()
            .domain([0, 2*segment])
            .range([this.height/2, this.height])

        this.svg.selectAll(".labels")
            .data(this.dimensions).enter()
            .append("text")
            .text(d => d)
            .attr("x", (d,i) => i*segment + middle_segment)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", 12)

        
        super.initBrush(ydomain)       
        const brush = brushX()
            .extent([
                [0, -(brushHeight / 2)],
                [segment, brushHeight / 2]
            ])
            .on("start brush end", this.brushed);

        
        const path_gen = (d, tline, byclass, compare) => {

            let literal = []
            let tpairs = pairs(this.dimensions)

            tpairs.forEach((dim, p) => {

                let [sd, ed] = tpairs[p]

                let start = (p*segment) + ydomain[sd](d[sd])
                let end = ((p+1)*segment) + ydomain[ed](d[ed])

                if (p == 0)
                    literal.push(`M${start},${this.height/2}`)

                let distance = Math.abs(end-start)
                let height_curve = height_scale(distance)
                let middle_point = start + ((end-start)/2)

                if (byclass !== null){
                    if (d[this.target] != byclass){      
                        height_curve = dheight_scale(distance)
                    }     
                }

                if (compare !== null){
                    let [class1, class2] = compare

                    if (d[this.target] == class1)
                        height_curve = height_curve
                    else if (d[this.target] == class2)
                        height_curve = dheight_scale(distance)
                    else
                        return

                }

                if (tline=='CURVE')
                    literal.push(`Q ${middle_point},${height_curve} ${end},${this.height/2}`)
                else
                    literal.push(`L${middle_point},${height_curve} L${end},${this.height/2}`)
            })
            return literal
        }

        
        this.items = this.svg.append("g")
            .selectAll(".items")
            .data(this.data).enter()
            .append("path")
            .attr("d", d => path_gen(d, this.TYPE_LINE, this.oneclass, this.classes))
            .attr("stroke", d => this.colorScale(d[this.target]))
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 1)    
            

        this.axis = this.svg.append("g")
            .selectAll("g")
            .data(this.dimensions)
            .join("g")
            .attr("transform", (d,i) => `translate(${(i*segment)},${this.height/2}) rotate(${-orientations[i]})`)
            .each(function(d) { select(this).call(axisBottom(ydomain[d]).ticks([]).tickSize(0))})
            .call(brush)

        this.svg.selectAll(".domain")
            .attr('stroke', 'black')
            .attr('marker-end', 'url(#arrow)')
            .attr('fill', 'none');

    }

    compareClasses(class1, class2){
        this.classes = [class1, class2]
    }

    focusClass(name){
        this.oneclass = name
    }

    setLine(value){
        //setear si es triangular o curva
        if (value == "TRIANGULAR")
            this.TYPE_LINE = 'TRIANGULAR'
        else
            this.TYPE_LINE = 'CURVE'
    }
    
};
