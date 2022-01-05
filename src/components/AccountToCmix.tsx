import { useState } from 'react';
import { Buffer } from 'buffer';
import { Hash } from '@polkadot/types/interfaces';
import '../css/style.css';

function AccountToCmix(props: { api: any; }) {
	const api = props.api;
	const [loading, setLoading] = useState(false);
	const [validator, setValidator] = useState(window.localStorage.getItem('validator') === undefined ? '' : window.localStorage.getItem('validator'));
	const [cmixRoot, setCmixRoot] = useState("");
	const [cmixId, setCmixId] = useState("");

	const toByteArray = (nodeId: Hash) => Buffer.concat([Buffer.from(nodeId), Buffer.from(new Uint8Array([2]))]);
	const toBase64 = (cmixRoot : Buffer) => cmixRoot.toString('base64');
	const transformCmixAddress = (nodeId? : Hash): string | undefined => (nodeId && Number(nodeId) !== 0) ? toBase64(toByteArray(nodeId)) : '';

	// const encoder = new TextEncoder();
	// const stringToU8a = (value : string) => value ? encoder.encode(value) : new Uint8Array();

	const fromAccountToCmix = async (account : string) => {
		if(loading) return;
		if(account === '') return;
		setLoading(true);
		
		try {
			const controller = await api.query.staking.bonded(validator);
			const ledger = await api.query.staking.ledger(controller.toString());
			const cmixRoot = ledger.unwrap().cmixId;
			const cmixId = transformCmixAddress(cmixRoot.unwrap());//别忘了加unwrap()

			setCmixRoot(cmixRoot.toString());
			setCmixId(cmixId === undefined ? '' : cmixId);
		} catch(err) {
			console.log(err);
		}
		setLoading(false);
	}

	return (
		<div>
			<div className="container">
				<div className="description">Validator Account</div>
				<input type="text" className="account-number gap" placeholder="Validator" value={validator === null ? '' : validator} onChange={(e) => {setValidator(e.target.value)} } onFocus={(e) => e.target.select()}/>
        <div className="button" onClick={() => fromAccountToCmix(validator === null ? '' : validator)}>{loading ? "Loading..." : "Fetch Data"}</div>
				<div className="description">Cmix Root</div>
				<div className="account-number gap">{cmixRoot}</div>
				<div className="description">Cmix Id</div>
				<div className="account-number gap">{cmixId}</div>
			</div>
		</div>
	);
}
export default AccountToCmix;