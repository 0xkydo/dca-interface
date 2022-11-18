import { ethers } from 'ethers';
import DCAFactory_abi from '../abi/DCAFactory.json';
import DCA_abi from '../abi/DCA.json';
import ERC20_abi from '../abi/ERC20.json';
import React, { useState } from 'react';
import styles from '../style'


function DCA() {
    // Declare factory contract address
    const factoryContractAddress = '0x6CD3D421220A961462c306DEC213B6b1e208Ebfe';

    const [errorMessage, setErrorMessage] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState('Not Connected');
    const [DCABotAddress, setDCABotAddress] = useState("Create One First");
    const [connButtonText, setConnButtonText] = useState("Connect with Metamask");

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contractFactory, setcontractFactory] = useState(null);
    const [contractApprove, setcontractApprove] = useState(null);
    const [contractDCASwap, setcontractDCASwap] = useState(null);

    async function connectWallet() {
        if (window.ethereum) {
            let requestedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setConnButtonText(requestedAccounts[0]);
            setDefaultAccount(requestedAccounts[0]);

        } else {
            setErrorMessage("Need to install metamask");
        }
    }

    // Update ethers instance with metamask provider, signer, and initialize factory contract.
    async function updateEthers() {
        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        let tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);

        let tempContract = new ethers.Contract(factoryContractAddress, DCAFactory_abi, signer);
        setcontractFactory(tempContract);

    }

    // Connect to Metamask extension.
    async function connectWalletHandler() {
        await connectWallet();
        await updateEthers();
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
        connectWalletHandler();


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
        let amount = event.target.amount.value * event.target.decimal.value;
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

        setDCABotAddress("Creating...");

        let tx_receipt = await tx.wait();

        console.log(tx_receipt.logs[1].address)

        setDCABotAddress(tx_receipt.logs[1].address);

    }

    async function approveHandler(event) {
        event.preventDefault();
        connectWalletHandler();


        let tempBot = new ethers.Contract(event.target.botAddress.value, DCA_abi, signer);
        setcontractDCASwap(tempBot);

        let baseToken = await contractDCASwap.baseTokenAddress();

        let tempERC = new ethers.Contract(baseToken, ERC20_abi, signer);
        setcontractApprove(tempERC);

        await contractApprove.approve(event.target.botAddress.value, contractApprove.totalSupply());

    }

    // Execute a swap through the inputted bot.
    async function swapHandler(event) {
        event.preventDefault();
        connectWalletHandler();

        let tempContract = new ethers.Contract(event.target.address.value, DCA_abi, signer);
        setcontractDCASwap(tempContract);

        let tx = await contractDCASwap.swap(event.target.amount.value);


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
                <button type="button" className="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 text-[13px] rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2" onClick={connectWalletHandler}>
                    {connButtonText}
                </button>
            </div>

            {/* Create DCA Bot */}
            <div>
                <h3 className='text-[26px] py-2  text-slate-50	font-semibold'> 2. Create your DCA Bot</h3>
            </div>
            <div className='w-[500px] '>
                <form className='items-center' onSubmit={creatDCAHandler}>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        {/*Recipient*/}
                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="r_address" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="r_address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Recipient Address</label>
                        </div>
                        {/*Funder*/}

                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="f_address" id="funder" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />

                            <label htmlFor="f_address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Funding address</label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        {/*baseToken*/}
                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="r_address" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="r_address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Base Token</label>
                        </div>
                        {/*decimal*/}

                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="f_address" id="funder" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />

                            <label htmlFor="f_address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Decimal For Base Token</label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        {/*targetToken*/}
                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="t_token" id="targetToken" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="t_token" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Target token address</label>
                        </div>
                        {/*interval*/}

                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="intervals" id="interval" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />

                            <label htmlFor="intervals" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Buy every __ day</label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        {/*amount*/}
                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="amount" id="amount" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="amount" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Amount to spend each time</label>
                        </div>
                        {/*startNow*/}

                        <div className="relative z-0 mb-6 w-full group">
                            <input type="text" name="startNow" id="startNow" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />

                            <label htmlFor="startNow" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">I want to buy now (1:yes,0:no)</label>
                        </div>
                    </div>


                    {/*poolFee*/}
                    <div className="relative z-0 mb-6 w-full group">
                        <input type="number" name="poolFee" id="poolFee" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="r_address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Which pool to use? (3000, 500, 100 for 0.3%, 0.05%, 0.01% respectively)</label>
                    </div>
                    {/*maxEpoch*/}

                    <div className="relative z-0 mb-6 w-full group">
                        <input type="text" name="maxEpoch" id="maxEpoch" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />

                        <label htmlFor="maxEpoch" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">How many times do you want to buy?</label>
                    </div>
                    <div className="justify-between items-center ">
                        <button className='text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2 ' type={'submit'}> Create DCA Bot</button>
                    </div>


                </form>
                <h3 className='text-[18px] py-2  text-slate-50'>DCA Bot Address: {DCABotAddress}</h3>
            </div>

            {/* Approve Bot to Swap */}
            <div className='mx-100'>
                <h3 className='text-[26px] py-2  text-slate-50	font-semibold'>
                    3. Approve Bot to Swap on your behalf.
                </h3>

                <form onSubmit={approveHandler}>
                    <div className="relative z-0 mb-6 w-full group">
                        <input type="text" name="botaddress" id="botaddress" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="botaddress" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Bot address</label>
                    </div>
                    <button className='text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2 ' type={'submit'}>Approve</button>
                </form>

            </div>

            {/* Execute a Swap */}
            <div className='mx-30'>
                <h3 className='text-[26px] py-2  text-slate-50	font-semibold'>
                    4. Execute a swap
                </h3>

                <form onSubmit={swapHandler}>
                    <div className="relative z-0 mb-6 w-full group">
                        <input type="text" name="address" id="address" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="address" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Bot address</label>
                    </div>
                    <div className="relative z-0 mb-6 w-full group">
                        <input type="text" name="amount" id="amount" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="amount" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Minimal output amount</label>
                    </div>
                    <button className='text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2 ' type={'submit'}>Execute Swap</button>
                </form>

            </div>










            {errorMessage}
        </div>
    );


}



export default DCA;