import { useState, useEffect } from 'react';
import '../css/style.css';
import ReactECharts from 'echarts-for-react';
import { maxPoints, defaultMinEra, defaultMaxEra, refreshSeconds } from '../config';
import useCountDown from 'react-countdown-hook';

const axios = require('axios').default;

function ValidatorChart() {
	const option = {
		xAxis: {
			type: 'category',
			data: []
		},
		yAxis: [{
			name: 'Points',
			type: 'value',
			min: 0,
			max: maxPoints,
		},{
			name: 'Ratio%',
			type: 'value',
			min: 0,
			max: 1,
			axisLabel: {
				formatter: '{value} %'
			}
		}],
		legend: {
			data: ['Point', 'Ratio']
		},
		tooltip: {
			trigger: 'axis'
		},
		series: [{
				name: 'Point',
				data: [],
				type: 'line'
			}, {
				name: 'Ratio',
				data: [],
				type: 'line'
			}]
	};
	const [validator, setValidator] = useState(window.localStorage.getItem('validator') === undefined ? '' : window.localStorage.getItem('validator'));
	const [eraStart, setEraStart] = useState(defaultMinEra);
	const [eraEnd, setEraEnd] = useState(defaultMaxEra);
	const [chartOption, setChartOption] = useState({});
	const [timeLeft, { start }] = useCountDown(refreshSeconds, 1000);

	useEffect(() => {
		setInterval(async () => {
			await load()
		}, refreshSeconds);
		load();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[])

	const load = async () => {
		setChartOption({})
		const url = process.env.REACT_APP_API_URL + '/scan/points';
		const res = await axios({
			method: 'post',
			url, 
			data: JSON.stringify({
				validator: validator,
				era_from: eraStart,
				era_to: eraEnd
			}),
			withCredentials: true,
			headers: {
				'Content-Type': 'application/json',
				"Accept": "*/*"
			}
		})

		if(res.data.code === 0 && res.data.data.count > 0) drawChart(res.data.data.points);
	}

	const drawChart = (points) => {
		let pointsData = [];
		let ratioData = [];
		let xAxis = [];
		for(let i = 0; i < points.length; i++) {
			xAxis.push(points[i].era.toString())
			pointsData.push(points[i].point)
			ratioData.push(points[i].ratio * 1000000);
		}

		let eChartOption = option;
		eChartOption.series[0].data = pointsData;
		eChartOption.series[1].data = ratioData;
		eChartOption.xAxis.data = xAxis;
		setChartOption(eChartOption);
		start(refreshSeconds);
	}

	return (
		<div>
			<div className="container">
				<div className="description">Validator Account</div>
				<input type="text" className="account-number gap" placeholder="Validator" value={validator} onChange={(e) => {setValidator(e.target.value)} } onFocus={(e) => e.target.select()}/>
				<div className="description">Era Start</div>
				<input type="text" className="account-number gap" placeholder="Era Start" value={eraStart} onChange={(e) => {setEraStart(e.target.value)}} onFocus={(e) => e.target.select()}/>
				<div className="description">Era End</div>
				<input type="text" className="account-number gap" placeholder="Era End" value={eraEnd} onChange={(e) => {setEraEnd(e.target.value)} } onFocus={(e) => e.target.select()}/>
        <div className="button" onClick={async() => await load()}>Fetch Data</div>
				<div className="description">Validator Points, update after {timeLeft / 1000}"</div>
				<ReactECharts
					option={chartOption}
					notMerge={true}
					lazyUpdate={true}
					className={"chart_theme"}
				/>
			</div>
			{/* <div className="footer">
				<a href="https://github.com/jackygu2006/xx_tools">Github</a>
			</div> */}
		</div>
	)
}
export default ValidatorChart;