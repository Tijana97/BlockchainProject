
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [buyer, seller, agent] = await ethers.getSigners()

  // Deploy Car
  const Car = await ethers.getContractFactory('Car')
  const car = await Car.deploy()
  await car.deployed()

  console.log(`Deployed Car Contract at: ${car.address}`)
  console.log(`Minting 10 cars\n`)

  for (let i = 0; i < 10; i++) {
    const transaction = await car.connect(seller).mint(`https://ipfs.moralis.io:2053/ipfs/QmdKsBdgS33SvohUhHeY6V6nnX5Sz4dGYoj3g9ZBssM3if/${i + 1}.json`)
    await transaction.wait()
  }

  // Deploy Carchain
  const Carchain = await ethers.getContractFactory('Carchain')
  const carchain = await Carchain.deploy(
    car.address,
    seller.address,
    agent.address
  )
  await carchain.deployed()

  console.log(`Deployed carchain Contract at: ${carchain.address}`)
  console.log(`Listing 10 cars\n`)

  for (let i = 0; i < 10; i++) {
    // Approving cars
    let transaction = await car.connect(seller).approve(carchain.address, i + 1)
    await transaction.wait()
  }

  // Listing cars
  transaction = await carchain.connect(seller).list(1, buyer.address, tokens(20))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(2, buyer.address, tokens(10))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(3, buyer.address, tokens(7))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(4, buyer.address, tokens(8))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(5, buyer.address, tokens(22))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(6, buyer.address, tokens(16))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(7, buyer.address, tokens(16))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(8, buyer.address, tokens(14))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(9, buyer.address, tokens(20))
  await transaction.wait()

  transaction = await carchain.connect(seller).list(10, buyer.address, tokens(18))
  await transaction.wait()

  console.log(`Finished.`)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
