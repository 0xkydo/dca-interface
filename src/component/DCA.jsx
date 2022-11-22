import { ethers } from 'ethers';
import DCAFactory_abi from '../abi/DCAFactory.json';
import DCA_abi from '../abi/DCA.json';
import ERC20_abi from '../abi/ERC20.json';
import React, { useState } from 'react';
import styles from '../style'


function DCA() {
    // Declare factory contract address
    const factoryContractAddress = '0x04A5e1bD0737a2D3B2Fe3bBC77370152B3eB2464';

    const [errorMessage, setErrorMessage] = useState(null);
    const [DCABotAddress, setDCABotAddress] = useState("**Create One First**");
    const [connButtonText, setConnButtonText] = useState("Connect with Metamask");

    const [signer, setSigner] = useState(null);
    const [contractFactory, setcontractFactory] = useState(null);
    const [showVarDescription, setShowVarDescription] = useState(false);
    const [varDescriptionText, setVarDescriptionText] = useState("Show variable descriptions");

    async function connectWallet() {
        if (window.ethereum) {
            let requestedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setConnButtonText(requestedAccounts[0]);

        } else {
            setErrorMessage("Need to install metamask");
        }
    }

    // Update ethers instance with metamask provider, signer, and initialize factory contract.
    async function updateEthers() {
        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);

        let tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);

        let tempContract = new ethers.Contract(factoryContractAddress, DCAFactory_abi, tempSigner);

        setcontractFactory(tempContract);
    }

    // Connect to Metamask extension.
    async function connectWalletHandler() {
        await connectWallet();
        await updateEthers();

        console.log("Wallet Connected.")
    }

    /* Create a new DCA Bot.
        uint256 _amount,
        address _baseToken,
        address _targetToken,
        uint256 _interval,
        uint8 _startNow,
        address payable _recipient,
        address payable _funder,
        uint24 _poolFee,
        uint256 _maxEpoch
    */
    async function creatDCAHandler(event) {
        event.preventDefault();
        await connectWalletHandler();


        // Hard Coded testing
        // let amount = '30000000000000000000000';
        // let baseToken = '0xfBE283ba7053B3Cbf90522259aA143EB39f5D5AE';
        // let targetToken = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
        // let interval = 0; // convert from days to seconds.
        // let startNow = 1;
        // let recipient = '0xcEDB35d2163E721B6B9944Dd358C883bbE3C0F2a';
        // let funder = '0xcEDB35d2163E721B6B9944Dd358C883bbE3C0F2a';
        // let poolFee = 500;
        // let maxEpoch = 3;

        // Convert input variables to correct format.
        let amount = ethers.BigNumber.from(event.target.amount.value).mul(ethers.BigNumber.from(10).pow(event.target.decimal.value));
        let baseToken = event.target.baseToken.value;
        let targetToken = event.target.targetToken.value;
        let interval = event.target.interval.value * 60 * 60 * 24; // convert from days to seconds.
        let startNow = event.target.startNow.value;
        let recipient = event.target.recipient.value;
        let funder = event.target.funder.value;
        let poolFee = event.target.poolFee.value;
        let maxEpoch = event.target.maxEpoch.value;

        let tx = await contractFactory.createDCA(
            amount,
            baseToken,
            targetToken,
            interval,
            startNow,
            recipient,
            funder,
            poolFee,
            maxEpoch
        );

        console.log("Creating DCA Bot...");

        setDCABotAddress("**Creating...**");

        let tx_receipt = await tx.wait();

        setDCABotAddress(ethers.utils.hexStripZeros(tx_receipt.logs[1].topics[3]));

        console.log("Transaction hash: " + tx_receipt.logs[1].transactionHash);
        console.log("DCA Bot address: " + ethers.utils.hexStripZeros(tx_receipt.logs[1].topics[3]));

    }

    async function approveHandler(event) {
        event.preventDefault();
        await connectWalletHandler();

        let tempBot = new ethers.Contract(event.target.botAddress.value, DCA_abi, signer);

        let baseToken = await tempBot.baseTokenAddress();

        console.log("Base token address: " + baseToken);

        let tempERC = new ethers.Contract(baseToken, ERC20_abi, signer);

        await tempERC.approve(event.target.botAddress.value, await tempERC.totalSupply());

    }

    // Execute a swap through the inputted bot.
    async function swapHandler(event) {
        event.preventDefault();
        await connectWalletHandler();

        let tempContract = new ethers.Contract(event.target.address.value, DCA_abi, signer);

        let tx = await tempContract.swap(event.target.amount.value);

        console.log("Swap transaction hash: " + tx.transactionHash);

    }

    function showDescriptionHandler(){
        setShowVarDescription(!showVarDescription);
        if(!showVarDescription){
            setVarDescriptionText("Hide variable descriptions");
        }else{
            setVarDescriptionText("Show variable descriptions");
        }
    }

    // Render HTML
    return (

        <div className='w-full flex flex-col items-center py-6 justify-between text-slate-300 font-poppins font-normal'>
            {/* Connect Wallet */}
            <div>
                <h2 className='text-[42px]'>
                    🤖 Simple DCA bot
                </h2>
            </div>

            <div>
                <p className='text-[25px] py-3  text-gradient font-semibold'>
                    Simple code. Simple Life.
                </p>
            </div>

            <div>
                <p className='my-6 w-[600px]'>
                    <span className='text-gradient'>Simple DCA</span> is the first DCA tool that does not require you to deposit your fund anywhere. Exchanges are dangerous, and current solutions are too complicated. Simple DCA follows a simple smart contract to minimize the attack surface. Follow the steps below to create your first DCA bot!
                </p>

                <p className='my-6 w-[600px]'>
                    If you are interested in the project, reach out to   <a href="https://twitter.com/0xkydo" target="_blank" rel="noreferrer" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
                        Kydo
                    </a> on twitter! He would be more than happy to hear your ideas.
                </p>
            </div>

            {/* Connect Wallet */}
            <div>
                <p className='text-[26px] py-5  text-slate-50	font-semibold'>
                    1. Connect Wallet
                </p>
            </div>
            <div className='mb-3'>
                <button type="button" className={`${styles.btn}`} onClick={connectWalletHandler}>
                    {connButtonText}
                </button>
            </div>

            {/* Create DCA Bot */}
            <div>
                <h3 className='text-[26px] py-4  text-slate-50	font-semibold'> 2. Create your DCA Bot</h3>
            </div>
            <div>
                <button className={`${styles.btn}`} onClick={showDescriptionHandler}>
                {varDescriptionText}
                </button>
                </div>
                <div>
                {
                    showVarDescription && (<p className='font-thin text-[16px]'>
                    <ul>
                        <li>Recipient address: address receiving from the swap</li>
                        <li>Funding address: address supplying the swap</li>
                        <li>Base token address: the token you are swapping from</li>
                        <li>Decimals of base token: number of decimals</li>
                        <li>Target token address: the token you are swapping to</li>
                        <li>Buy every __ day: interval of swaps</li>
                        <li>Amount to spend each time: if you want to spend 300 usdc each time, input 300</li>
                        <li>I want to buy now: Do you want to wait for the next interval to start or start now?</li>
                        <li>Which pool to use? Specify which Uniswap pool you want to transaction through ()</li>
                        <li>How many times do you want to buy? The bot cannot swap more than this times</li>
                    </ul>
                </p>)
                }
            </div>
            <div className='w-[500px] '>
                <form className='items-center' onSubmit={creatDCAHandler}>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        {/*Recipient*/}
                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="r_address" id="recipient" className={`${styles.inputBox}`} placeholder=" " required />
                            <label htmlFor="r_address" className={`${styles.inputLabel}`}>Recipient Address</label>
                        </div>
                        {/*Funder*/}

                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="f_address" id="funder" className={`${styles.inputBox}`} placeholder=" " required />

                            <label htmlFor="f_address" className={`${styles.inputLabel}`}>Funding address</label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        {/*baseToken*/}
                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="baseToken" id="baseToken" className={`${styles.inputBox}`} placeholder=" " required />
                            <label htmlFor="baseToken" className={`${styles.inputLabel}`}>Base token address</label>
                        </div>
                        {/*decimal*/}

                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="decimals" id="decimal" className={`${styles.inputBox}`} placeholder=" " required />

                            <label htmlFor="decimals" className={`${styles.inputLabel}`}>Decimals of base token</label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        {/*targetToken*/}
                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="t_token" id="targetToken" className={`${styles.inputBox}`} placeholder=" " required />
                            <label htmlFor="t_token" className={`${styles.inputLabel}`}>Target token address</label>
                        </div>
                        {/*interval*/}

                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="intervals" id="interval" className={`${styles.inputBox}`} placeholder=" " required />

                            <label htmlFor="intervals" className={`${styles.inputLabel}`}>Buy every __ day</label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        {/*amount*/}
                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="amount" id="amount" className={`${styles.inputBox}`} placeholder=" " required />
                            <label htmlFor="amount" className={`${styles.inputLabel}`}>Amount to spend each time</label>
                        </div>
                        {/*startNow*/}

                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="startNow" id="startNow" className={`${styles.inputBox}`} placeholder=" " required />

                            <label htmlFor="startNow" className={`${styles.inputLabel}`}>I want to buy now (1:yes,0:no)</label>
                        </div>
                    </div>


                    {/*poolFee*/}
                    <div className="relative z-0 mb-6 w-full group">
                        <input type="number" name="poolFee" id="poolFee" className={`${styles.inputBox}`} placeholder=" " required />
                        <label htmlFor="r_address" className={`${styles.inputLabel}`}>Which pool to use? (3000, 500, 100 for 0.3%, 0.05%, 0.01% respectively)</label>
                    </div>
                    {/*maxEpoch*/}

                    <div className="relative z-0 mb-6 w-full group">
                        <input type="text" name="maxEpoch" id="maxEpoch" className={`${styles.inputBox}`} placeholder=" " required />

                        <label htmlFor="maxEpoch" className={`${styles.inputLabel}`}>How many times do you want to buy?</label>
                    </div>
                    <div className="justify-between items-center ">
                        <button className={`${styles.btn}`} type={'submit'}> Create DCA Bot</button>
                    </div>


                </form>
                <h3 className='text-[18px] py-4  text-slate-50'>DCA Bot Address: {DCABotAddress}</h3>
            </div>

            {/* Approve Bot to Swap */}
            <div>
                <h3 className='text-[26px] py-6  text-slate-50	font-semibold'>
                    3. Approve Bot to Swap on your behalf.
                </h3>

                <form onSubmit={approveHandler}>
                    <div className="relative z-0 mb-6 w-full group">
                        <input type="text" name="botaddress" id="botAddress" className={`${styles.inputBox}`} placeholder=" " required />
                        <label htmlFor="botaddress" className={`${styles.inputLabel}`}>Bot address</label>
                    </div>
                    <button className={`${styles.btn}`} type={'submit'}>Approve</button>
                </form>

            </div>

            {/* Execute a Swap */}
            <div>
                <h3 className='w-full text-[26px] py-4  text-slate-50	font-semibold'>
                    4. Execute a swap
                </h3>

                <form onSubmit={swapHandler}>
                    <div className="relative z-0 mb-6 w-full group">
                        <input type="text" name="address" id="address" className={`${styles.inputBox}`} placeholder=" " required />
                        <label htmlFor="address" className={`${styles.inputLabel}`}>Bot address</label>
                    </div>
                    <div className="relative z-0 mb-6 w-full group">
                        <input type="text" name="amount" id="amount" className={`${styles.inputBox}`} placeholder=" " required />
                        <label htmlFor="amount" className={`${styles.inputLabel}`}>Minimal output amount</label>
                    </div>
                    <button className={`${styles.btn}`} type={'submit'}>Execute Swap</button>
                </form>

            </div>

            <div className='py-16'>
                <p>
                    Built by <a href="https://twitter.com/0xkydo" target="_blank" rel="noreferrer" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
                        Kydo
                    </a> .  Repos can be found here: <a href="https://github.com/0xkydo/onchain-dca" target="_blank" rel="noreferrer" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
                        smart contract
                    </a> and <a href="https://github.com/0xkydo/dca-interface" target="_blank" rel="noreferrer" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
                        front end
                    </a>.
                </p>
            </div>

        </div>
    );


}



export default DCA;