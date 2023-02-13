import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Auto = ({ auto, provider, account, carchain, togglePop }) => {
    const [hasBought, setHasBought] = useState(false)
    const [hasApproved, setHasApproved] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [agent, setAgent] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)

    const fetchDetails = async () => {
        // -- Buyer

        const buyer = await carchain.buyer(auto.id)
        setBuyer(buyer)

        const hasBought = await carchain.approval(auto.id, buyer)
        setHasBought(hasBought)

        // -- Seller

        const seller = await carchain.seller()
        setSeller(seller)

        const hasSold = await carchain.approval(auto.id, seller)
        setHasSold(hasSold)


        // -- Agent

        const agent = await carchain.agent()
        setAgent(agent)

        const hasApproved = await carchain.agentApproved(auto.id)
        setHasApproved(hasApproved)
    }

    const fetchOwner = async () => {
        if (await carchain.isListed(auto.id)) return

        const owner = await carchain.buyer(auto.id)
        setOwner(owner)
    }

    const buyHandler = async () => {
        const purchasePrice = await carchain.purchasePrice(auto.id)
        const signer = await provider.getSigner()

        let transaction = await signer.sendTransaction({ to: carchain.address, value: purchasePrice, gasLimit: 60000 })
        await transaction.wait()

        
        // Buyer approval
        transaction = await carchain.connect(signer).approveSale(auto.id)
        await transaction.wait()

        setHasBought(true)
    }

    const agentHandler = async () => {
        const signer = await provider.getSigner()

        // Agent updates status
        const transaction = await carchain.connect(signer).updateApprovalStatus(auto.id, true)
        await transaction.wait()

        setHasApproved(true)
    }

    

    const sellHandler = async () => {
        const signer = await provider.getSigner()

        // Seller approval
        let transaction = await carchain.connect(signer).approveSale(auto.id)
        await transaction.wait()

        transaction = await carchain.connect(signer).finalizeSale(auto.id)
        await transaction.wait()

        setHasSold(true)
    }

    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold])

    return (
        <div className="auto">
            <div className='auto__details'>
                <div className="auto__image">
                    <img src={auto.image} alt="auto" />
                </div>
                <div className="auto__overview">
                    <h1>{auto.name}</h1>
                    <p>
                        Description: <strong>{auto.description}</strong> |
                        Usage: <strong>{auto.attributes[1].value}</strong>
                    </p>

                    <h2>{auto.attributes[0].value} ETH</h2>

                    {owner ? (
                        <div className='auto__owned'>
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {(account === agent) ? (
                                <button className='auto__buy' onClick={agentHandler} disabled={hasApproved}>
                                    Approve Purchase
                                </button>
                            ) : (account === seller) ? (
                                <button className='auto__buy' onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (
                                <button className='auto__buy' onClick={buyHandler} disabled={hasBought}>
                                    Buy
                                </button>
                            )}
                        </div>
                    )}

                    <hr />

                    <h2>Facts and features</h2>

                    <ul>
                        {auto.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>


                <button onClick={togglePop} className="auto__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div >
    );
}

export default Auto;