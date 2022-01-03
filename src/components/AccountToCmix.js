import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { definitions }  from '../types/xxnetwork';
import { Buffer } from 'buffer';
import { wss } from '../config';
import '../css/style.css';

function AccountToCmix() {
	const [loading, setLoading] = useState(true);
	const [api, setApi] = useState(null);
	const [validator, setValidator] = useState("5HEtg4HZ3jxoeTFbaxt7WqrLCuHr7SV1eHMYHHPaSNaTaJE2");
	const [cmixRoot, setCmixRoot] = useState("");
	const [cmixId, setCmixId] = useState("");

	useEffect(() => {
    async function connet() {
      const provider = new WsProvider(wss);
      const api = await ApiPromise.create({
        provider: provider,
        types: definitions.types
      });
			setApi(api);
			setLoading(false)
    }
    connet();
  }, [])

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