import react, {useEffect, useState} from 'react';
import './App.css';
import {HashRouter, Routes, Route} from 'react-router-dom';
import BatchAccountGenerator from './components/BatchAccountGenerator';
import BestValidator from './components/BestValidator';
import TopValidator from './components/TopValidator';
// import ValidatorChart from './components/ValidatorChart';
import Menu from './components/Menu';
import ChartCards from './components/ChartCards';
import AccountToCmix from './components/AccountToCmix';
import { ApiPromise, WsProvider } from '@polkadot/api';

function App() {
  const [api, setApi] = useState(null);

	useEffect(() => {
    async function connet() {
      const provider = new WsProvider(process.env.REACT_APP_WSS);
      const api = await ApiPromise.create({
        provider
      });
			setApi(api);
    }
    connet();
  }, [])

  return (
    <div>
    {api === null ? <div className="loading">Connecting xx network...</div> :
    <HashRouter>
      <Routes>
        <Route exact path='/' element={<Menu />}/>
        <Route exact path="/generator" element={<BatchAccountGenerator />}/>
        <Route exact path="/validator" element={<BestValidator api={api}/>}/>
        <Route exact path="/top" element={<TopValidator api={api}/>}/>
        <Route exact path="/charts" element={<ChartCards />} />
        <Route exact path="/cmix" element={<AccountToCmix api={api}/>}/>
      </Routes>
    </HashRouter>}
    </div>
  )
}

export default App;
