import { useState, useEffect } from 'react';
import { fetchSleeveGenerator } from '../sleeve';
import Keyring from '@polkadot/keyring';
import '../css/style.css';

// const options = [
//   { value: 55, label: 'xx mainnet(55)' },
//   { value: 42, label: 'xx protonet(42)' },
// ];

function BatchAccountGenerator() {
  const [number, setNumber] = useState(2);
  const [result, setResult] = useState('');
  const [resultOnly, setResultOnly] = useState('');
  const [loading, setLoading] = useState(false);
  const [wasmLoaded, setWasmLoaded] = useState(false);
  const ss58Type = 55;

  useEffect(() => {
    try {
      generateSleeve();
      console.log('load success...');
      // test();
      setWasmLoaded(true);
    } catch (error) {
      setWasmLoaded(false);
    }
  },[])

  // const test = () => {
  //   const m = "afford put jewel ugly glove matrix art option various festival stage zero honey winner kite hidden rescue combine keep august absorb bright purpose swing";
  //   console.log(mnemonic2Address(m));
  // }
  const generateSleeve = async () => {
    const generateSleeve1 = await fetchSleeveGenerator();
    return generateSleeve1('password?');
  };

  const generateSleeves = async () => {
    if(number === 0 || loading) return;
    setResult('');
    setLoading(true);
    let accounts = [];
    for(let i = 0; i < number; i++) {
      let acc = await generateSleeve();
      const address = mnemonic2Address(acc.Output);
      acc.normalAddress = address;
      accounts.push(acc);
    }
    const txtResult = parseAccount(accounts);
    setResult(txtResult.fullResult);
    setResultOnly(txtResult.onlyResult);
    setLoading(false);
  }
  const mnemonic2Address = (mnemonic) => {
    const keyring = new Keyring();
    const pair = keyring.addFromMnemonic(mnemonic, null, 'sr25519');
    keyring.setSS58Format(ss58Type);
    return pair.address;
  }

  const parseAccount = (accounts) => {
    let fullResult = '';
    let onlyResult = '';
    for(let i = 0; i < accounts.length; i++) {
      fullResult = fullResult + (i+1) + ',' + accounts[i].normalAddress + ',' + accounts[i].Output + ',' + accounts[i].Mnemonic + ',' + accounts[i].XxAddress + '\n';
      onlyResult = onlyResult + (i+1) + ',' + accounts[i].normalAddress + '\n';
    }
    return {
      onlyResult,
      fullResult
    }
  }

  // const handleChange = (selectedOption) => {
  //   console.log(selectedOption.value);
  //   setSs58Type(selectedOption.value)
  //   setSs58Type(selectedOption.value);
  // };

  // const splitMnemonics = () => {
  //   // TODO:
  //   alert('Make sure again this website is offline! It will show you 3 texts with mask, copy, print or save it. Each Mnemonic is splited into 3 parts and keep separately.')
  // }

  return wasmLoaded ? (
    <div>
        <div className="alert">
          <div>ATTENTION: </div>
          <div>CLOSE WIFI AND DISCONNECT INTERNET AFTER LOADED THIS PAGE IMMEDIATELY! CREATE ACCOUNTS OFF-LINE! </div>
          <div>SAVE ALL ACCOUNT INFORMATION SAFELY, CLOSE THIS PAGE IMMEDIATELY AFTER EVERYTHING IS DONE!</div>
          <div>BE SURE NOBODY IS WATCHING NOW!</div>
        </div>
        <div className="container">
        {/* <Select className="select"
          defaultValue={ss58Type}
          onChange={(e) => handleChange(e)}
          options={options}
        /> */}
        <input type="text" className="account-number" placeholder="How many accounts you want create" value={number} onChange={(e) => {setNumber(e.target.value)} } onFocus={(e) => e.target.select()}/>
        <div className="button" onClick={() => generateSleeves()}>{loading ? "Loading..." : "Create Accounts & Show"}</div>
        {/* <div className="button" onClick={() => splitMnemonics()}>{loading ? "Loading..." : "Create Accounts & Split mnemonics"}</div>         */}
        <div className="description">Address only</div>
        <textarea className="result" value={resultOnly} readOnly></textarea>
        <div className="description">Address, normal mnemonic, quantum secured mnemonic and XxAddress</div>
        <textarea className="result" value={result} readOnly></textarea>
        </div>
        <div className="footer">
          <a href="https://github.com/jackygu2006/xx_tools">Github</a>
        </div>
    </div>
  ) : <div>Loading...</div>;
}

export default BatchAccountGenerator;
