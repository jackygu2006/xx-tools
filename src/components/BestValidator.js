/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { symbol as Symbol } from '../config';
import '../css/style.css';

function BestValidator(props) {
	const api = props.api;
	const [loading, setLoading] = useState(false);
	const [validator, setValidator] = useState(window.localStorage.getItem('validator') === undefined ? '' : window.localStorage.getItem('validator'));
	const [nominator, setNominator] = useState(window.localStorage.getItem('nominator') === undefined ? '' : window.localStorage.getItem('nominator'));
	const [era, setEra] = useState(0);
	const [validatorData, setValidatorData] = useState({});
	const [totalStakeableIssuance, setTotalStakeableIssuance] = useState(0);

	const symbol = " " + Symbol;
	useEffect(async() => {
		try {
			const _currentEra = await api.query.staking.currentEra();
			const currentEra = parseInt(_currentEra.toString()) - 2;
			setEra(currentEra);
		} catch(err){}
	}, [])

	const load = async () => {
		if(loading) return;
		if(validator === '' || nominator === '') return;
		console.log('loading...');
		setLoading(true);
		let d = {};

		const currentEra = await api.query.staking.currentEra();
		console.log(`current Era: ${currentEra}`);

		const totalPayout = await api.query.staking.erasValidatorReward(era);
		console.log(`caculating era ${era}`);
		console.log(`total validators payout: ${totalPayout / 1e9} PTC`);

		const _totalStakeableIssues = await getTotalStakeableIssuance();
		setTotalStakeableIssuance(_totalStakeableIssues.totalStakeableIssuance / 1e9);

		const validators = await api.query.staking.validators(validator);
		const commission = validators.commission / 1e9;
		console.log('commission rate: ' + commission * 100 + ' %');

		const validatorsArray = await api.query.session.validators();
		console.log('validators: ' + validatorsArray.length);

		const erasStakers = await api.query.staking.erasStakers(era, validator);
		// console.log(erasStakers);
		let nominatorAmount = 0;

		// Points
		console.log('================');
		const points = await api.query.staking.erasRewardPoints(era);
		const individual = JSON.parse(points.individual);

		const validatorPoint = individual[validator];
		console.log('validator points: ' + validatorPoint);
		console.log('total points: ' + points.total);
		console.log('point rate: ' + (validatorPoint / points.total * 100) + ' %');
		console.log('everage point rate: ' + (1 / validatorsArray.length * 100) + ' %');
		const diff = (validatorPoint / points.total - 1 / validatorsArray.length) / (1 / validatorsArray.length)
		console.log('diff from average: ' + (diff * 100) + ' %');
		console.log('*node reward: ' + (totalPayout * validatorPoint / points.total) / 1e9 + symbol);

		// Stake
		console.log('================');
		console.log('node total stake: ' + erasStakers.total / 1e9 + symbol);

		let reward = 0;
		let operatingReward = 0;
		let stakingReward = 0;
		if(nominator === validator) {
			nominatorAmount = erasStakers.own;
			console.log('self stake: ' + nominatorAmount / 1e9 + symbol);
			console.log('self stake rate: ' + nominatorAmount / erasStakers.total * 100 + ' %');
			
			console.log('================');
			stakingReward = totalPayout * validatorPoint / points.total * (1 - commission) * nominatorAmount / erasStakers.total;
			console.log('era stake reward: ' + stakingReward / 1e9 + symbol);
			operatingReward = totalPayout * validatorPoint / points.total * commission;
			console.log('era operating reward: ' + operatingReward / 1e9 + symbol);
			reward = stakingReward + operatingReward;
			console.log('*era total reward: ' + reward / 1e9 + symbol);
		} else {
			for(let i = 0; i < erasStakers.others.length; i++) {
				if(nominator === erasStakers.others[i].who) {
					nominatorAmount = erasStakers.others[i].value;
				}
			}
			console.log('nominator stake: ' + nominatorAmount / 1e9 + symbol);
			console.log('nominating rate: ' + nominatorAmount / erasStakers.total * 100 + ' %');
			
			console.log('================');
			stakingReward = totalPayout * validatorPoint / points.total * (1 - commission) * nominatorAmount / erasStakers.total;
			reward = stakingReward;
			console.log('*era reward: ' + stakingReward / 1e9 + symbol);
		}

		// Hours per Era
		const hours = 24;
		console.log('hours per era: ' + hours);

		// APR
		console.log('simple APR: ' + 24 / hours * 365 * reward / nominatorAmount * 100 + ' %');
		
		// console.log('compound APR: ');

		d = {
			currentEra: currentEra.toString(),
			era,
			totalPayout: totalPayout / 1e9,
			validators: validatorsArray.length,
			validatorPoint: validatorPoint,
			commission: commission * 100,
			totalPoints: points.total.toString(),
			pointRatio: validatorPoint / points.total * 100,
			everagePoints: 1 / validatorsArray.length * 100,
			diff: (diff * 100),
			nodeReward: (totalPayout * validatorPoint / points.total) / 1e9,
			
			totalStake: erasStakers.total / 1e9,
			accountStake: nominatorAmount / 1e9,
			stakeRatio: nominatorAmount / erasStakers.total * 100,
			stakeReward: stakingReward / 1e9,
			operatingReward: operatingReward / 1e9,
			totalReward: stakingReward / 1e9 + operatingReward / 1e9,

			hoursPerEra: hours,
			arp: 24 / hours * 365 * reward / nominatorAmount * 100,

		}

		setValidatorData(d);
		console.log('\nDone...');
		setLoading(false);
	}

	// 计算质押量
	async function getTotalStakeableIssuance() {
		const totalIssuance = await api.query.balances.totalIssuance();
		const rewardsPoolAccount = await api.consts.xxEconomics.rewardsPoolAccount;
		const balanceRPA = await api.query.balances.account(rewardsPoolAccount);
		const totalCustody = await api.query.xxCustody.totalCustody();
		const liquidityRewards = await api.query.xxEconomics.liquidityRewards();
		
		const totalStakeableIssuance = totalIssuance.sub(balanceRPA.free).sub(totalCustody).sub(liquidityRewards);
		return {
			totalIssuance,
			rewardsPoolAccount,
			balanceRPA: balanceRPA.free,
			totalCustody,
			liquidityRewards,
			totalStakeableIssuance
		}
	}

	return (
		<div>
			<div className="container">
				<div className="description">Validator Account</div>
				<input type="text" className="account-number gap" placeholder="Validator" value={validator} onChange={(e) => {setValidator(e.target.value); window.localStorage.setItem('validator', e.target.value)} } onFocus={(e) => e.target.select()}/>
				<div className="description">Nominator Account</div>
				<input type="text" className="account-number gap" placeholder="Nominator" value={nominator} onChange={(e) => {setNominator(e.target.value); window.localStorage.setItem('nominator', e.target.value)} } onFocus={(e) => e.target.select()}/>
				<div className="description">Era</div>
				<input type="text" className="account-number gap" placeholder="Era" value={era} onChange={(e) => {setEra(e.target.value)} } onFocus={(e) => e.target.select()}/>
        <div className="button" onClick={() => load()}>{loading ? "Loading..." : "Fetch Data"}</div>
				<div className="validator_details">
					<div className="item">
						<div className="item_left">Total Stakable Issurance</div>
						<div className="item_right">{totalStakeableIssuance === 0 ? '' : totalStakeableIssuance.toLocaleString() + symbol}</div>
						<div className="clear"></div>
					</div>

					<div className="item">
						<div className="item_left">Current Era</div>
						<div className="item_right">{validatorData.currentEra === undefined ? '' : validatorData.currentEra}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Your Era</div>
						<div className="item_right">{validatorData.era === undefined ? '' : validatorData.era}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Total Payout</div>
						<div className="item_right">{validatorData.totalPayout === undefined ? '' : validatorData.totalPayout?.toLocaleString() + symbol}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Total validators</div>
						<div className="item_right">{validatorData.validators === undefined ? '' : validatorData.validators}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Validator Points</div>
						<div className="item_right">{validatorData.validatorPoint === undefined ? '' : validatorData.validatorPoint.toLocaleString()}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Points of all validators</div>
						<div className="item_right">{validatorData.totalPoints === undefined ? '' : parseFloat(validatorData.totalPoints).toLocaleString()}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Point Ratio</div>
						<div className="item_right">{validatorData.pointRatio === undefined ? '' : validatorData.pointRatio.toFixed(2) + "%"}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Everage Points</div>
						<div className="item_right">{validatorData.everagePoints === undefined ? '' : validatorData.everagePoints.toFixed(2) + "%"}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Diff from average</div>
						<div className="item_right">{validatorData.diff === undefined ? '' : validatorData.diff.toFixed(2) + "%"}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Commission Rate</div>
						<div className="item_right">{validatorData.commission === undefined ? '' : validatorData.commission.toFixed(2) + "%"}</div>
						<div className="clear"></div>
					</div>

					<div className="item">
						<div className="item_left">Node Rewards</div>
						<div className="item_right">{validatorData.nodeReward === undefined ? '' : validatorData.nodeReward.toLocaleString() + symbol}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Total Staked</div>
						<div className="item_right">{validatorData.totalStake === undefined ? '' : validatorData.totalStake.toLocaleString() + symbol}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Nominator Staked</div>
						<div className="item_right">{validatorData.accountStake === undefined ? '' : validatorData.accountStake.toLocaleString() + symbol}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Stake Ratio</div>
						<div className="item_right">{validatorData.stakeRatio === undefined ? '' : validatorData.stakeRatio.toFixed(2) + "%"}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Operating Reward</div>
						<div className="item_right">{validatorData.operatingReward === undefined ? '' : validatorData.operatingReward.toLocaleString() + symbol}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Staking Reward</div>
						<div className="item_right">{validatorData.stakeReward === undefined ? '' : validatorData.stakeReward.toLocaleString() + symbol}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Total Rewards</div>
						<div className="item_right">{validatorData.totalReward === undefined ? '' : validatorData.totalReward.toLocaleString() + symbol}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">Hours per Era</div>
						<div className="item_right">{validatorData.hoursPerEra === undefined ? '' : validatorData.hoursPerEra}</div>
						<div className="clear"></div>
					</div>
					<div className="item">
						<div className="item_left">ARP</div>
						<div className="item_right">{validatorData.arp === undefined ? '' : validatorData.arp.toFixed(2) + "%"}</div>
						<div className="clear"></div>
					</div>
				</div>

			</div>
			<div className="footer">
			<a href="https://github.com/jackygu2006/xx-tools">Github</a>
			</div>
		</div>
	)
}
export default BestValidator;