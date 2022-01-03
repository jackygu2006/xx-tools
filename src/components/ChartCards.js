import GridLayout from 'react-grid-layout';
import ValidatorChart from '../components/ValidatorChart';
import '../css/style.css';
import { showChartsQuantity } from '../config';

function ChartCards () {
	let layout = [];

	for(let i = 0; i < showChartsQuantity; i++) {
		layout.push({
			i: i.toString(),
			x: (i % 4) * 6,
			y: Math.floor(i / 4) * 6,
			w: 6, 
			h: 6, 
			maxW: 6,
			maxH: 6,
			static: true
		})
	}

	return(
		<div className="charts">
			<GridLayout className="layout" layout={layout} cols={24} rowHeight={110} width={1740}>
				{layout.map((element, index) => 
        <div key={index.toString()} className="grid"><ValidatorChart/></div>
				)}
      </GridLayout>
			<div className="footer">
				<a href="https://github.com/jackygu2006/xx_tools">Github</a>
			</div>
		</div>
	)
}

export default ChartCards;