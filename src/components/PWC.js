import Chart from './BaseClass'
import { scaleLinear } from 'd3-scale'
import { extent, pairs } from 'd3-array'
import { line } from 'd3-shape'
//import { polygonContains } from 'd3-polygon';


export default class PWC extends Chart {
    
    constructor(params) {
        super(params);
        this.radius = 200
    }

    draw(){

        const N = this.dimensions.length
        const cx = this.width/2
        const cy = this.height/2
        
        
        //Normalizers de dimensions para paired radial coordinates
        var norms = {}
        this.dimensions.forEach(dim => {
            var [min, max] = extent(this.data, p => +p[dim])
            norms[dim] = function(d){
                return (d-min) / (max-min)
            }
        });

        var crown = scaleLinear()
            .domain([0,1])
            .range([0, Math.PI*2])     
        
        
        const path_gen = datum => {
            
            var points = []
            
            let x = 0
            let y = 0

            let angle = 0

            this.dimensions.forEach(dim => {
                datum[dim] = norms[dim](datum[dim])
            })
        
            let pairsp = pairs(this.dimensions).filter((d, i) => i%2==0)

            pairsp = pairsp.sort(function(a, b){
                if (+datum[a] > +datum[b])
                    return 1
                if (+datum[a] < +datum[b])
                    return -1
                return 0
            })

            pairsp = pairsp.flat()

            for (let i = 0; i < N; i++) {

                let dim = pairsp[i]

                let value = datum[dim]

                if (i%2==0){

                    angle = crown(value)

                    x = cx + this.radius * Math.cos(angle)
                    y = cy + this.radius * Math.sin(angle)

                    // this.svg.append("circle")
                    //     .attr("cx", x)
                    //     .attr("cy", y)
                    //     .attr("r", 2)
                    //     .attr("stroke", "purple")
                    //     .attr("fill", "purple")

                }else{

                    x = cx + (this.radius+(value*50)) * Math.cos(angle)
                    y = cy + (this.radius+(value*50)) * Math.sin(angle)

                    points.push([x, y])

                    // this.svg.append("circle")
                    //     .attr("cx", x)
                    //     .attr("cy", y)
                    //     .attr("r", 2)
                    //     .attr("stroke", "orange")
                    //     .attr("fill", "orange")
                }
            }

            return line()(points)
                       
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

        this.svg.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", this.radius)
            .attr("stroke", "black")
            .attr("fill", "none")

    }
};
