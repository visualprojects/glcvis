import Chart from './BaseClass'
import { keys } from 'd3-collection'
import { scaleLinear } from 'd3-scale'
import { range, extent, pairs } from 'd3-array'
import { brushX } from 'd3-brush'
import { line } from 'd3-shape'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'


export default class NonSequentialGeneric extends Chart {
    constructor(params) {
        super(params)
        this.orientations = range(this.dimensions.length).map(l => Math.random()* 360);
        this.pcp = false //hack para no pasar todo
    }

    draw(){
    
        const segment = this.width/this.dimensions.length,
            middle_segment = this.pcp?(this.height-30)/2:segment/2,
            brushHeight = 20
        
        var ysegments = {}
        keys(this.data[0]).filter((d,i) => {
            return d != this.target && (ysegments[d] = scaleLinear()
            .domain(extent(this.data, function(p) { return +p[d]; }))
            .range([-middle_segment, middle_segment]))
            
        })
    
        var ydomain = {}
        keys(this.data[0]).filter((d,i) => {
            return d != this.target && (ydomain[d] = scaleLinear()
            .domain(extent(this.data, function(p) { return +p[d]; }))
            .range([0, this.pcp?(this.height-30):segment]))
            
        })
    
        this.svg.selectAll(".labels")
            .data(this.dimensions).enter()
            .append("text")
            .text(d => d)
            .attr("x", (d,i) => i*segment + middle_segment)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .style("font-size", 12)
    
        super.initBrush(ysegments)

        const brush = brushX()
          .extent([
            [-middle_segment, -(brushHeight / 2)],
            [middle_segment, brushHeight / 2]
          ])
          .on("start brush end", this.brushed);
    
      
        const deg2rad = e => (e *Math.PI/180)    
        
        const path_gen = (d) => {
    
            let points = this.dimensions.map((p,i) => {
                    let angle = -this.orientations[i]
                    let cx = (i*segment)+middle_segment
                    let cy = this.height/2
    
                    let radius = ysegments[p](d[p])
    
                    let x = cx + Math.cos(deg2rad(angle)) * radius
                    let y = cy + Math.sin(deg2rad(angle)) * radius 
                    
                    return [x,y]            
                })
            return line()(points)
        }
    
        const dynamicpath_gen = (d) => {
    
            let angle = -this.orientations[0],
                radius = ysegments[this.dimensions[0]](ysegments[this.dimensions[0]].domain()[0]),
                cx = middle_segment + Math.cos(deg2rad(angle)) * radius,
                cy = this.height/2 + Math.sin(deg2rad(angle)) * radius,
                points = [[cx, cy]]
            
            this.dimensions.forEach((v, i) =>{
                
                let angle = (-this.orientations[i]),
                    radius = ydomain[v](d[v])
    
                let x = cx + Math.cos(deg2rad(angle)) * radius
                let y = cy + Math.sin(deg2rad(angle)) * radius
    
                cx = x
                cy = y
    
                points.push([x, y])
            })

            return line()(points)
        }
        
    
        this.items = this.svg.append("g")
            .selectAll(".items")
            .data(this.data).enter()
            .append("path")
            .attr("d", this.dynamic?dynamicpath_gen:path_gen)
            .attr("stroke", d => this.colorScale(d[this.target]))
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 1)
            
        
        this.axis = this.svg.append("g")
            .selectAll("g")
            .data(this.dimensions)
            .join("g")
            .attr("transform", (d, i) => `translate(${(i*segment)+middle_segment},${this.height/2}) rotate(${-this.orientations[i]})`)
            .each(function(d) {select(this).call(axisBottom(ysegments[d]).ticks([]).tickSize(0).offset(0))})
            .call(brush)
    
        this.svg.selectAll(".domain")
            .attr('stroke', 'black')
            .attr('marker-end', 'url(#arrow)')
            .attr('fill', 'none');

    }

    setOrientations(value){
        this.orientations = value
    }

    setPCP(value){
        this.pcp = value
    }
};
