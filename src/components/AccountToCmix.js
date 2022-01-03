import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import '../css/style.css';

function AccountToCmix(props) {
	const api = props.api;
	const [loading, setLoading] = useState(false);
	const [validator, setValidator] = useState(process.env.REACT_APP_DEFAULT_ACCOUNT);
	const [cmixRoot, setCmixRoot] = useState("");
	const [cmixId, setCmixId] = useState("");

	const toByteArray = (nodeRoot, extraByte) => Buffer.concat([nodeRoot.toU8a(true), extraByte])
	const toBase64 = (cmixRoot) => cmixRoot.toString('base64');
	
	const fromAccountToCmix = async (account) => {
		if(loading) return;
		setLoading(true);
		try {
			const electedInfo = await api.derive.staking.electedInfo({withExposure: true, withPrefs: true});
			// console.log(electedInfo);

			electedInfo.info.map(({ accountId, exposure, stakingLedger, validatorPrefs }) => {	
				if(account === accountId.toString()) {
					const cmixRoot = validatorPrefs.cmix_root;
					setCmixRoot(cmixRoot.toString());
					let extraByte = new Uint8Array(1);
					extraByte[0] = parseInt('02'.substr(0, 2), 16);
					const cmixId = toBase64(toByteArray(cmixRoot, extraByte)); 
					setCmixId(cmixId);
				}
			})
		} catch(err) {
			console.log("ERROR");
			console.log(err.message);
		}
		setLoading(false);
	}

	return (
		<div>
			<div className="container">
				<div className="description">Validator Account</div>
				<input type="text" className="account-number gap" placeholder="Validator" value={validator} onChange={(e) => {setValidator(e.target.value)} } onFocus={(e) => e.target.select()}/>
        <div className="button" onClick={() => fromAccountToCmix(validator)}>{loading ? "Loading..." : "Fetch Data"}</div>
				<div className="description">Cmix Root</div>
				<div className="account-number gap">{cmixRoot}</div>
				<div className="description">Cmix Id</div>
				<div className="account-number gap">{cmixId}</div>
			</div>
		</div>
	)
}
export default AccountToCmix;