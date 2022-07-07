import Chart from './BaseClass'
import { keys } from 'd3-collection'
import { scaleLinear } from 'd3-scale'
import { range, extent, pairs} from 'd3-array'
//import { brushX } from 'd3-brush'
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

        const segment = this.width / this.dimensions.length/2,
            middle_segment = segment/2,
            off_angle = 360/(this.dimensions.length/2),
            orientations = range(this.dimensions.length/2).map((l, i) => i * off_angle)


        //Normalizers de dimensions para paired radial coordinates
        var norms = {}
        this.dimensions.forEach(dim => {
            var [min, max] = extent(this.data, p => +p[dim])
            norms[dim] = function(d){
                return (d-min) / (max-min)
            }
        });

        var ydomain = {}
        this.dimensions.forEach(dim => {
            ydomain[dim] = scaleLinear()
                .domain([0,1])
                .range([0, this.radius])
        });
        
        const deg2rad = e => (e *Math.PI/180)
                
        const path_gen = d => {

            let points = []

            for (let i=0, j=0; i < this.dimensions.length, j<orientations.length; i+=2, j++) {
                
                //Calcular el punto del comienzo
                
                let cx = this.width/2
                let cy = this.height/2

                let angle = orientations[j]
                let dim = this.dimensions[i]
                let value = norms[dim](d[dim])
                let radius = ydomain[dim](value)

                cx = cx + Math.cos(deg2rad(angle)) * radius
                cy = cy + Math.sin(deg2rad(angle)) * radius

                let idx = j==orientations.length-1?0:j+1
                angle = orientations[idx]
                dim = this.dimensions[i+1]
                radius = ydomain[dim](norms[dim](d[dim]))

                let x = cx + Math.cos(deg2rad(angle)) * radius
                let y = cy + Math.sin(deg2rad(angle)) * radius

                points.push([x, y])

            }
            
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

        
            
        this.axis = this.svg.append("g")
            .selectAll(".axis")
            .data(pairs(this.dimensions.slice(-1).concat(this.dimensions.slice(0,-1))).filter((d, i) => i%2==0))
            .join("g")
            .attr("transform", (d,i) => `translate(${this.width/2},${this.height/2}) rotate(${orientations[i]})`)
            .each(function(d) { select(this).call(axisBottom(ydomain[d[0]]).ticks([]).tickSize(0))})
            .call(g => g.append("text")
            .attr("x", this.radius+10)
            .attr("y", -6)
            .attr("text-anchor", "start")
            .attr("fill", "currentColor")
            .text(d => d[0]))
            .call(g => g.append("text")
            .attr("x", this.radius+10)
            .attr("y", 12)
            .attr("text-anchor", "start")
            .attr("fill", "currentColor")
            .text(d => d[1]))
    
        this.svg.selectAll(".domain")
            .attr('stroke', 'black')
            .attr('marker-end', 'url(#arrow)')
            .attr('fill', 'none');

        this.svg.append('circle')
            .attr('cx', this.width/2)
            .attr('cy', this.height/2)
            .attr('r',1)
            .attr('fill', 'black')

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
