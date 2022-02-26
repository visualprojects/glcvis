import Chart from './BaseClass';
import { keys } from 'd3-collection'
import { scaleLinear } from 'd3-scale'
import { range, extent, pairs } from 'd3-array'
import { brushX } from 'd3-brush'
import { line } from 'd3-shape'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'



export default class SequentialGeneric extends Chart {
    constructor(params) {
        super(params)
        this.orientations = range(this.dimensions.length).map(l => Math.random()* 360)
    }

    draw(){

        //const dimensions = d3.keys(data[0]).filter(function(d) { return d != "class" })
    
        const segment = this.width / this.dimensions.length,
            middle_segment = segment/2,
            brushHeight = 30
          
        var ysegments = {}
        keys(this.data[0]).filter((d,i) => {
            return d != this.target && (ysegments[d] = scaleLinear()
            .domain(extent(this.data, function(p) { return +p[d]; }))
            .range([0, segment]))
            
        })

        super.initBrush(ysegments)
    
        const brush = brushX()
          .extent([
            [0, -(brushHeight / 2)],
            [segment, brushHeight / 2]
          ])
          .on("start brush end", this.brushed);
    
      
        const deg2rad = e => (e *Math.PI/180)    
        
        
        let origins = {}
        let cx = this.width/2
        let cy = this.height/2
    
        const locate_axis = (d, i) => {
    
            let x = cx,
                y = cy,
                angle = -this.orientations[i];
    
            origins[d] = [x, y]
         
            cx = cx + segment * Math.cos(deg2rad(angle))
            cy = cy + segment * Math.sin(deg2rad(angle))
    
            return `translate(${x},${y}) rotate(${angle})`
        }
        
        this.axis = this.svg.append("g")
            .selectAll("g")
            .data(this.dimensions)
            .join("g")
            .attr("transform", locate_axis)
            .each(function(d) { select(this).call(axisBottom(ysegments[d]).ticks([]).tickSize(0))})
            .call(brush)
            .call(g => g.append("text")
            .attr("x", middle_segment)
            .attr("y", -6)
            .attr("text-anchor", "start")
            .attr("fill", "currentColor")
            .text(d => d))
    
        this.svg.selectAll(".domain")
            .attr('stroke', 'black')
            .attr('marker-end', 'url(#arrow)')
            .attr('fill', 'none');
    
        const path_gen = (d) => {
    
            let points = this.dimensions.map((p,i) => {
                    let angle = -this.orientations[i]
                    let cx = origins[p][0]
                    let cy = origins[p][1]
    
                    let radius = ysegments[p](d[p])
    
                    let x = cx + Math.cos(deg2rad(angle)) * radius
                    let y = cy + Math.sin(deg2rad(angle)) * radius 
                    
                    return [x,y]            
                })
            return line()(points)
        }
    
        const dynamicpath_gen = (d) => {
    
            let [cx, cy] = origins[this.dimensions[0]],
                points = [[cx, cy]]

            this.dimensions.forEach((v, i) => {
                let angle = (-this.orientations[i]),
                    radius = ysegments[v](d[v])
    
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
        
    }

    setOrientations(value){
        this.orientations = value
    }
};
