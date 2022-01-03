import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { definitions }  from '../types/xxnetwork';
import { wss } from '../config';

import '../css/style.css';

function TopValidator() {
	const [loading, setLoading] = useState(true);
	const [validator, setValidator] = useState('5DSK87eLHYWKKb7ZP4iDYvdBSTXsDbzAqmMxJn1ndvEy4Lr8');
	const [stakeAmount, setStakeAmount] = useState(10000);
	const [era, setEra] = useState(0);
	const [api, setApi] = useState(null);
	const [table1, setTable1] = useState([]);
	const [table2, setTable2] = useState([]);

	useEffect(() => {
    async function connet() {
      const provider = new WsProvider(wss);
      const api = await ApiPromise.create({
        provider: provider,
        types: definitions.types
      });
			console.log("websocket is connected...")
      setApi(api);
			const currentEra = await api.query.staking.currentEra();
			setEra(parseInt(currentEra.toString()) - 2);
			setLoading(false)
    }
    connet();
  }, [])

	const load = async () => {
		if(loading) return;
		setLoading(true);
		console.log('loading...');
		let d = {};

		const points = await api.query.staking.erasRewardPoints(era);
		const individual = JSON.parse(points.individual);

		// Top 20 point validators
		console.log('================');
		console.log('Top 20 points validators');
		let individualArray = [];
		for(var v in individual) {
			individualArray.push({
				validator: v,
				points: individual[v]
			});
		}
		individualArray.sort(function(a, b) {return a.points < b.points ? 1 : -1});
		let tableArray  = [["No", "Validator Account", "Points"]];
		for(let i = 0; i < 200; i++) {
			// console.log(i + 1, individualArray[i].validator, individualArray[i].points);
			tableArray.push([
				i+1, 
				individualArray[i].validator,
				individualArray[i].points
			])
		}
		setTable1(tableArray);

		// 综合预期收益排行
		// console.log('================');
		/**
		 * index = (1 - commission) * newStakeAmount / (totalStakeAmount + newStakeAmount) * validatorPoint / points.total
		 */
		let array = [];
		for(let i = 0; i < 100; i++) {
			const _validatorAccount = individualArray[i].validator; 
			const _validators = await api.query.staking.validators(_validatorAccount);
			const _commission = _validators.commission / 1e9;
			const _erasStakers = await api.query.staking.erasStakers(era, _validatorAccount);
			const _totalStakeAmount = _erasStakers.total;
			const _validatorPoint = individual[_validatorAccount];

			const index = (1 - _commission) * stakeAmount * 1e9 / (_totalStakeAmount + stakeAmount * 1e9) * _validatorPoint / points.total * 1e20;
			if(_validatorAccount.substr(0, 4) === "5GgJ") {
				console.log(_validatorAccount);
				console.log(`commission: ${_commission}, newStakeAmount: ${stakeAmount}, totalStakedAmount: ${_totalStakeAmount}, validatorPoint: ${_validatorPoint}, totalPoints: ${points.total}`);
			}
			// commission: 0.07, newStakeAmount: 10000, totalStakedAmount: 69497781687952, validatorPoint: 15248, totalPoints: 2560704
			const o = {
				validator: _validatorAccount,
				index,
				points: individualArray[i].points,
			}
			array.push(o);
		}

		console.log('================');
		console.log('Top 100 high yield validators if stake ' + stakeAmount);
		array.sort(function(a, b) {return a.index < b.index ? 1 : -1});
		let tableArray2  = [["No", "Validator Account", "Points"]];
		for(let i = 0; i < 100; i++) {
			// console.log(i + 1, array[i].validator, array[i].index);
			tableArray2.push([
				i+1, 
				array[i].validator,
				array[i].index.toFixed(0)
			])
		}
		setTable2(tableArray2);

		console.log('\nDone...');
		setLoading(false);
	}

	return (
		<div>
			<div className="container">
				<div className="description">Validator Account</div>
				<input type="text" className="account-number gap" placeholder="Validator" value={validator} onChange={(e) => {setValidator(e.target.value)} } onFocus={(e) => e.target.select()}/>
				<div className="description">Will stake Amount</div>
				<input type="text" className="account-number gap" placeholder="Stake amount" value={stakeAmount} onChange={(e) => {setStakeAmount(e.target.value)} } onFocus={(e) => e.target.select()}/>
				<div className="description">Era</div>
				<input type="text" className="account-number gap" placeholder="Era" value={era} onChange={(e) => {setEra(e.target.value)} } onFocus={(e) => e.target.select()}/>
        <div className="button" onClick={() => load()}>{loading ? "Loading..." : "Fetch Data"}</div>

				<div className="description">Points of each validator</div>
				<div>
					<table>
						{table1.map((element, index) => 
							<tr>
								<td>{element[0]}</td>
								<td>{element[1]}</td>
								<td>{element[2]}</td>
							</tr>
						)}
					</table>
				</div>
				<div className="description">Top 100 ARP of each validator</div>
				<div>
					<table>
						{table2.map((element, index) => 
							<tr>
								<td>{element[0]}</td>
								<td>{element[1]}</td>
								<td>{element[2]}</td>
							</tr>
						)}
					</table>
				</div>
				<div className="gap"></div>
			</div>
			<div className="footer">
				<a href="https://github.com/jackygu2006/xx_tools">Github</a>
			</div>
		</div>
	)
}
export default TopValidator;