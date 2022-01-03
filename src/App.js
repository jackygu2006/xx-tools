import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import BatchAccountGenerator from './components/BatchAccountGenerator';
import BestValidator from './components/BestValidator';
import TopValidator from './components/TopValidator';
// import ValidatorChart from './components/ValidatorChart';
import Menu from './components/Menu';
import ChartCards from './components/ChartCards';
import AccountToCmix from './components/AccountToCmix';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Menu />}/>
        <Route exact path="/generator" element={<BatchAccountGenerator />}/>
        <Route exact path="/validator" element={<BestValidator />}/>
        <Route exact path="/top" element={<TopValidator />}/>
        {/* <Route exact path="/chart" element={<ValidatorChart />}/> */}
        <Route exact path="/charts" element={<ChartCards />} />
        <Route exact path="/cmix" element={<AccountToCmix />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
