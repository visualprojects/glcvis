import Chart from './BaseClass';
import { scaleLinear } from 'd3-scale'
import { keys } from 'd3-collection'
import { extent } from 'd3-array'
import { line } from 'd3-shape'
import { axisBottom, axisLeft } from 'd3-axis'
import { select } from 'd3-selection'


export default class SPC extends Chart {

    constructor(params){
        super(params)
    }
    

    draw(){

        let pairs = []

        for (let index = 0; index < this.dimensions.length; index+=2) {
            pairs.push(this.dimensions.slice(index, index+2))
            
        }
    
        const xplot = scaleLinear()
            .domain([0, pairs.length])
            .range([0, this.width])

        
        const yplot = scaleLinear()
            .domain([0, pairs.length])
            .range([this.height, 0])


        var normalize = {}
        keys(this.data[0]).filter((d) => {
            return d != this.target && (normalize[d] = scaleLinear()
            .domain(extent(this.data, p => +p[d]))
            .range([0, 1]))
        })
    

        const linegen = function(d){
            
            let coordinates = pairs.map((l, i)=> {
                let x = normalize[l[0]](d[l[0]]) + i
                let y = normalize[l[1]](d[l[1]]) + i
                return [xplot(x), yplot(y)]
            })

            return line()(coordinates)

        }
        
        this.items = this.svg.append("g")
            .selectAll(".items")
            .data(this.data).enter()
            .append("path")
            .attr("d", linegen)
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 1)   

        this.axis = this.svg.append("g")
            .selectAll(".axis")
            .data([xplot, yplot])
            .join("g")
            .attr("transform", (d, i) => `translate(0,${i==0?this.height:0})`)
            .each(function(d, i) { 
                
                if (i==0)
                    select(this).call(axisBottom(d).ticks([]).tickSize(0))
                else
                    select(this).call(axisLeft(d).ticks([]).tickSize(0))
                
            })
    
        this.svg.selectAll(".domain")
            .attr('stroke', 'black')
            .attr('marker-end', 'url(#arrow)')
            .attr('fill', 'none');

    }
};
