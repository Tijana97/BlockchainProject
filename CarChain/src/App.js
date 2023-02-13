import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Auto from './components/Auto';

// ABIs
import Car from './abis/Car.json'
import Carchain from './abis/Carchain.json'

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [carchain, setCarchain] = useState(null)

  const [account, setAccount] = useState(null)

  const [autos, setAutos] = useState([])
  const [auto, setAuto] = useState({})
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    const car = new ethers.Contract(config[network.chainId].car.address, Car, provider)
    const totalSupply = await car.totalSupply()
    const autos = []

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await car.tokenURI(i)
      const response = await fetch(uri)
      const metadata = await response.json()
      autos.push(metadata)
    }

    setAutos(autos)

    const carchain = new ethers.Contract(config[network.chainId].carchain.address, Carchain, provider)
    setCarchain(carchain)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (auto) => {
    setAuto(auto)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <div className='cards__section'>

        <h3>Cars For You</h3>

        <hr />

        <div className='cards'>
          {autos.map((auto, index) => (
            <div className='card' key={index} onClick={() => togglePop(auto)}>
              <div className='card__image'>
                <img src={auto.image} alt="Auto" />
              </div>
              <div className='card__info'>
                <h4>{auto.attributes[0].value} ETH</h4>
                <p>
                  Condition: <strong>{auto.attributes[1].value}</strong>  
                </p>
                <p>{auto.address}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {toggle && (
        <Auto auto={auto} provider={provider} account={account} carchain={carchain} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;
