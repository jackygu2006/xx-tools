import { useEffect } from 'react';
import { Link} from 'react-router-dom';
import '../css/style.css';

function Menu() {
	useEffect(() => {
		console.log('Menu...')
  }, [])

	return (
		<div className="menu-bar">
			<div className="menu-item-title">XX Network Tool Box</div>
			<div className="menu-item"><Link to={'/validator'}>Staking Rewards</Link></div>
			<div className="menu-item">-</div>
			<div className="menu-item"><Link to={'/top'}>Find Best Nodes</Link></div>
			<div className="menu-item">-</div>
			<div className="menu-item"><Link to={'/charts'}>Validator Point Chart</Link></div>
			<div className="menu-item">-</div>
			<div className="menu-item"><Link to={'/generator'}>Account Generator</Link></div>
			<div className="menu-item">-</div>
			<div className="menu-item"><Link to={'/cmix'}>Account to Cmix</Link></div>
			<div className="footer">
				<a href="https://github.com/jackygu2006/xx_tools">Github</a>
			</div>
		</div>
	)
}

export default Menu;