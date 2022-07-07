import Chart from './BaseClass'
import { keys } from 'd3-collection'
import { scaleLinear } from 'd3-scale'
import { range, extent } from 'd3-array'
import { brushX } from 'd3-brush'
import { line, curveCardinalClosed, curveLinearClosed } from 'd3-shape'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'


export default class RadialChart extends Chart {
    
    constructor(params) {
        super(params);
        this.curve = curveLinearClosed
        this.radius = 200
    }

    draw(){

        const segment = this.width / this.dimensions.length,
            middle_segment = segment/2,
            off_angle = 360/this.dimensions.length,
            orientations = range(this.dimensions.length).map((l, i) => i * off_angle),
            brushHeight = 20
        
        var ydomain = {}
        keys(this.data[0]).filter( (d,i) => 
             d != this.target && (ydomain[d] = scaleLinear()
            .domain(extent(this.data, function(p) { return +p[d]; }))
            .range([0, this.radius]))    
        )


        super.initBrush(ydomain)        
        const brush = brushX()
            .extent([
                [0, -(brushHeight / 2)],
                [this.radius, brushHeight / 2]
            ])
            .on("start brush end", this.brushed);
    
    
        const deg2rad = e => (e *Math.PI/180)
        
        
        const path_gen = d => {
    
            let cx = this.width/2
            let cy = this.height/2
            
            let points = this.dimensions.map((p,i) => {
                    let angle = orientations[i]
    
                    let radius = ydomain[p](d[p])
    
                    let x = cx + Math.cos(deg2rad(angle)) * radius
                    let y = cy + Math.sin(deg2rad(angle)) * radius 
    
                    if (this.dynamic){
                        cx = x
                        cy = y
                    }                    
                    return [x,y]            
                })
    
            return line().curve(this.curve)(points)
            
        }
    
        this.items = this.svg.append("g")
            .selectAll(".items")
            .data(this.data).enter()
            .append("path")
            .attr("d", path_gen)
            .attr("stroke", d => this.colorScale(d[this.target]))
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 1)    
            
    
        //const selections = new Map();

        this.axis = this.svg.append("g")
            .selectAll(".axis")
            .data(this.dimensions)
            .join("g")
            .attr("transform", (d,i) => `translate(${this.width/2},${this.height/2}) rotate(${orientations[i]})`)
            .each(function(d) { select(this).call(axisBottom(ydomain[d]).ticks([]).tickSize(0).offset(0))})
            .call(brush)
            .call(g => g.append("text")
            .attr("x", this.radius+10)
            .attr("y", 0)
            .attr("text-anchor", "start")
            .attr("fill", "currentColor")
            .text(d => d))
    
        this.svg.selectAll(".domain")
            .attr('stroke', 'black')
            .attr('marker-end', 'url(#arrow)')
            .attr('fill', 'none');
    }

    setCurve(option){
        if (option=="CURVE")
            this.curve = curveCardinalClosed
        else
            this.curve = curveLinearClosed
    }

    setRadius(value){
        this.radius = value
    }
};
