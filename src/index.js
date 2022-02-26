import RadialChart from "./components/RadialChart"
import InlineChart from "./components/InLineChart"
import CircularChart from "./components/CircularChart"
import SequentialGeneric from "./components/SequentialGeneric"
import BushChart from "./components/BushChart"
import NonSequentialGeneric from "./components/NonSequentialGeneric"
import CPC from "./components/CPC.js"
import SPC from "./components/SPC.js"
import APC from "./components/APC.js"
import PRC from "./components/PRC.js"
import EPC from "./components/EPC.js"
import PWC from "./components/PWC.js"


export const newChart = (params) => {
    
    console.log(params.type)


    switch(params.type){
        case 'radial':
            return new RadialChart(params)
        case 'inline':
            return new InlineChart(params)
        case 'circular':
            return new CircularChart(params)
        case 'seq-generic':
            return new SequentialGeneric(params)
        case 'polygon':
            let angle_offset = 360/params.dimensions.length
            let orientations = params.dimensions.map((l,i) => i*angle_offset)
            let chart = new SequentialGeneric(params)
            chart.setOrientations(orientations)
            return chart
        case 'bush':
            return new BushChart(params)
        case 'nseq-generic':
            return new NonSequentialGeneric(params)
        case 'parallel':
            let chart2 = new NonSequentialGeneric(params)
            chart2.setOrientations(params.dimensions.map(l => 90))
            return chart2
        case 'cpc':
            return new CPC(params)
        case 'spc':
            return new SPC(params)
        case 'apc':
            return new APC(params)
        case 'prc':
            return new PRC(params)
        case 'epc':
            return new EPC(params)
        case 'pwc':
            return new PWC(params)
        default:
            console.log("Chart not supported")
    }
};
