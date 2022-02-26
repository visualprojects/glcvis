import Chart from './BaseClass'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { line } from 'd3-shape'


export default class EPC extends Chart {
    
    constructor(params) {
        super(params);
        this.rx = 300
        this.ry = 200
    }

    draw(){

        const N = this.dimensions.length
        const off_angle = (Math.PI*2)/N
        const cx = this.width/2
        const cy = this.height/2
        var ellipses = []
        
        //Normalizers de dimensions para paired radial coordinates
        var norms = {}
        this.dimensions.forEach(dim => {
            var [min, max] = extent(this.data, p => +p[dim])
            norms[dim] = function(d){
                return (d-min) / (max-min)
            }
        });

        //Escalas dimension-segmento, que permite el mapeo de puntos
        var ydomain = {}
        this.dimensions.forEach((dim, i) => {
            ydomain[dim] = scaleLinear()
                    .domain([0,1])
                    .range([(Math.PI*3/2)+i*off_angle, (Math.PI*3/2)+(i*off_angle)+off_angle-0.01]) //Truco para evitar los infinitos puntos
        })        
        
        const get_interception = (i, j) => {

            let hSq = Math.pow(this.ry, 2);
	        let wSq = Math.pow(this.rx, 2);

            let intY = -(Math.pow(ellipses[i][1], 2) - Math.pow(ellipses[j][1], 2)) / (2 * (-ellipses[i][1] + ellipses[j][1]));
            let intX = ellipses[i][0];

            if ((N/2)%2 == 0){ //el caso donde los pares de puntos son pares

                if (i < N/2) { //right ellipses
                    intX -= Math.sqrt(wSq - (wSq*Math.pow(intY - ellipses[i][1], 2) / hSq));
                }
                else { //left ellipse
                    intX += Math.sqrt(wSq - (wSq*Math.pow(intY - ellipses[i][1], 2) / hSq));
                }
            }else { // el caso donde los pares de puntos son impares

                if (i < N/2-1) //right ellipses
                    intX -= Math.sqrt(wSq - (wSq*Math.pow(intY - ellipses[i][1], 2) / hSq));
                else if (i== (N/2)-1){
                    intX = -(Math.pow(ellipses[i][0], 2) - Math.pow(ellipses[j][0], 2)) / (2 * (-ellipses[i][0] + ellipses[j][0]));
                    intY = ellipses[i][1];
                    intY -= Math.sqrt(hSq - (hSq*Math.pow(intX - ellipses[i][0], 2) / wSq));
                }
                else  //left ellipse
                    intX += Math.sqrt(wSq - (wSq*Math.pow(intY - ellipses[i][1], 2) / hSq));            
            }
            
            /*this.svg.append("circle")
                .attr("cx", intX)
                .attr("cy", intY)
                .attr("r", 3)
                .attr("stroke", "black")
                .attr("fill", "black")*/

            return [intX, intY]
        }

        const draw_ellipse = (i, coords, option) => {

            let x =  Math.round(coords[i][0]);
            let y =  Math.round(coords[i][1]);
            let a = 0;
            let b = 0;
            let xa = 0;
            let xaSq = 0;
            let yb = 0;
            let ybSq = 0;
            let color = "";

            let hSq = Math.pow(this.ry, 2); //H^2
            let wSq = Math.pow(this.rx, 2); //W^2

            if (option=="Left") {
                a = cx - this.rx;
                b = 0;
                xa = x - a;
                xaSq = Math.pow(xa, 2);
               
                if (i % 2 == 1) {
                    color = "red"
                    b = y + Math.sqrt((1 - (xaSq / wSq))*hSq);
                }
                else {
                    color = "blue"
                    b = y - Math.sqrt((1 - (xaSq / wSq))*hSq);
                } 
            }

            if (option=="Right") {
                a = cx + this.rx;
                b = 0;
                xa = x - a;
                xaSq = Math.pow(xa, 2);
               
                if (i % 2 == 1) {
                    color = "red"
                    b = y - Math.sqrt((1 - (xaSq / wSq))*hSq);
                }
                else {
                    color = "blue"
                    b = y + Math.sqrt((1 - (xaSq / wSq))*hSq);
                }  
            }

            if (option=="Down"){
                
                b = cy + this.ry;
                a = 0;
                yb = y - b;
                ybSq = Math.pow(yb, 2);

                if (i % 2 == 0) {
                    color="red"
                    a = x - Math.sqrt((1 - (ybSq / hSq))*wSq); 
                }
                else { 
                    color="blue"
                    a = x + Math.sqrt((1 - (ybSq / hSq))*wSq); 
                }
            }

            /*this.svg.append("ellipse")
                .attr("id", this.dimensions[i])
                .attr("cx", a)
                .attr("cy", b)
                .attr("rx", this.rx)
                .attr("ry", this.ry)
                .attr("stroke", color)
                .attr("fill", "none")*/

            ellipses[i] = [a,b]
        }


        const path_gen = (datum, j) => {
    
            let coordinates = []
            let interceptions = []

            this.dimensions.forEach((dim, i)=>{

                let angle = ydomain[dim](norms[dim](datum[dim]))

                let x = cx + Math.cos(angle)*this.rx
                let y = cy + Math.sin(angle)*this.ry

                coordinates.push([x, y])

                this.svg.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 1)
                    .attr("stroke", "purple")
                    .attr("fill", "purple")
                    .attr("id", dim)
            })

            //El caso en que los pares de puntos son pares. Quiere decier que
            //de cada lado de la ellipse hay un numero de par de dimensiones
            //por lo cual las ellipses se calculan con la forma (red/blue)
            if ((N/2)%2 == 0) { 
                
                for (let i = 0; i < N / 2; i++) {
                    draw_ellipse(i, coordinates, "Right");
                }
                for (let i = N / 2; i < N; i++) {
                    draw_ellipse(i, coordinates, "Left");
                }
            }else{

                for (let i=0; i < (N/2)-1; i++)  
                    draw_ellipse(i, coordinates, "Right");
                
                for (let i = N/2-1; i < N/2+1; i++) 
                     draw_ellipse(i, coordinates, "Down");
                
                for (let i = N/2+1; i < N; i++) 
                     draw_ellipse(i, coordinates, "Left");
            }


            for (let i = 0; i < N; i+=2) {
                interceptions.push(get_interception(i, i+1))
            }
            
            return line()(interceptions)
                       
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

        this.svg.append("ellipse")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("rx", this.rx)
            .attr("ry", this.ry)
            .attr("stroke", "black")
            .attr("fill", "none")

        this.svg.selectAll(".dimensions")
            .data(this.dimensions).enter()
            .append("line")
            .attr("x1", cx)
            .attr("y1", cy)
            .attr("x2", (d, i) => cx + Math.cos((Math.PI*3/2)+i*off_angle)*this.rx)
            .attr("y2", (d, i) => cy + Math.sin((Math.PI*3/2)+i*off_angle)*this.ry)
            .attr("stroke", "black")
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke-width", 0.3)

        this.svg.append("line")
            .attr("x1", cx)
            .attr("y1", cy-(this.ry+20))
            .attr("x2", cx)
            .attr("y2", cy+(this.ry+20))
            .attr("stroke", "purple")
            .style("stroke-dasharray", ("3, 3"))

    }
};
