import Chart from './BaseClass';
import { keys } from 'd3-collection'
import { scaleLinear, scalePoint } from 'd3-scale'
import { range, extent, pairs } from 'd3-array'
import { brushX } from 'd3-brush'
import { line } from 'd3-shape'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'



export default class BushChart extends Chart {
    constructor(params) {
        super(params)
    }


    draw(){
        
        const segment = this.height-50,
            brushHeight = 30,
            selections = new Map()
    
        const anglescale = scalePoint()
            .domain(range(this.dimensions.length))
            .range([120, 60])
            .padding(1)
    
        const orientations = range(this.dimensions.length).map(l =>anglescale(l))
    
        var ydomain = {}
        keys(this.data[0]).filter((d) => {
            return d != this.target && (ydomain[d] = scaleLinear()
            .domain(extent(this.data, function(p) { return +p[d]; }))
            .range([0, segment]))
        })
    
        const xscale = scalePoint()
            .range([0+100, this.width-100])
            .padding(1)
            .domain(this.dimensions)
    
        this.svg.selectAll(".labels")
            .data(this.dimensions).enter()
            .append("text")
            .text(d => d)
            .attr("x", d => xscale(d))
            .attr("y", this.height+5)
            .attr("text-anchor", "middle")
            .style("font-size", 12)

        super.initBrush(ydomain)
    
        const brush = brushX()
        .extent([
            [0, -(brushHeight / 2)],
            [segment, brushHeight / 2]
        ])
        .on("start brush end", this.brushed);
    
    
        const deg2rad = e => (e *Math.PI/180)    
        
        const path_gen = (d) => {
    
            let points = this.dimensions.map((p,i) => {
                    let angle = -orientations[i]
                    let cx = xscale(p)
                    let cy = this.height-20
    
                    let radius = ydomain[p](d[p])
    
                    let x = cx + Math.cos(deg2rad(angle)) * radius
                    let y = cy + Math.sin(deg2rad(angle)) * radius 
                    
                    return [x,y]            
                })
            return line()(points)
        }
    
        const dynamicpath_gen = (d) => {
    
            let cx = xscale(this.dimensions[0]),
                cy = this.height - 20,
                points = [[cx, cy]]

            this.dimensions.forEach((v,i) => {
                let angle = (-orientations[i]),
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
            .attr("transform", (d,i) => `translate(${xscale(d)},${this.height-20}) rotate(${-orientations[i]})`)
            .each(function(d) { select(this).call(axisBottom(ydomain[d]).ticks([]).tickSize(0))})
            .call(brush)
    
        this.svg.selectAll(".domain")
            .attr('stroke', 'black')
            .attr('marker-end', 'url(#arrow)')
            .attr('fill', 'none');
    
    }
};
