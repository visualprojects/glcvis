import Chart from "./BaseClass";
import { line, curveLinearClosed, arc } from "d3-shape"
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'


export default class CircularChart extends Chart {
    constructor(params) {
        super(params)
        this.radius = 200
    }

    draw(){

        const fullcircle = Math.PI * 2,
            segment = fullcircle / this.dimensions.length
            
    
        var y = {}
        this.dimensions.forEach((d, i) => {
            
            y[d] = scaleLinear()
                .domain(extent(this.data, function(p) { return +p[d]; }))
                .range([segment*i, segment*(i+1)]);
    
        })
    
        const path = (d) => {
    
            let points = this.dimensions.map((p) => { 

                return [   
                    Math.cos(y[p](d[p]))*(this.radius-5), 
                    Math.sin(y[p](d[p]))*(this.radius-5)
                ]
            })
            return line().curve(curveLinearClosed)(points)
        }
    
        this.items = this.svg
            .attr("transform", `translate(${this.width/2}, ${this.height/2})`)
            .selectAll(".items")
            .data(this.data).enter()
            .append("path")
            .attr("d", path)
            .attr("stroke", d =>this.colorScale(d[this.target]))
            .style("fill", "none")
    
    
        const garc = arc()
            .innerRadius(this.radius-3)
            .outerRadius(this.radius)
            .startAngle((d,i)=>segment*i)
            .endAngle((d,i)=>segment*(i+1))
    
        this.svg
            .selectAll(".dimensions")
            .data(this.dimensions).enter()
            .append("path")
            .attr("class", "dimension")
            .attr("id", function(d,i) { return "dimensionArc_"+i; })
            .attr("d", garc)
            .attr("stroke", "gray")
            .attr("fill", "gray")
    
        this.svg.selectAll(".dimText")
            .data(this.dimensions)
            .enter().append("text")
            .attr("class", "dimext")
            .attr("x", 100)   //Move the text from the start angle of the arc
            .attr("dy", -5) //Move the text down
            .append("textPath")
            .attr("xlink:href",function(d,i){return "#dimensionArc_"+i;})
            .text(function(d){return d});

        this.svg.selectAll(".dimension")
            .attr('stroke', 'black')
            .attr('marker-end', 'url(#arrow)')
            .attr('fill', 'none');
    
    }

    setRadius(value){
        this.radius = value
    }
}

