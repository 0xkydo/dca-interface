import React, { useState } from 'react';
import styles from '../style'

function Header(){
  return(
    <div className="w-full h-6 bg-gradient-to-t from-cyan-800 to-blue-600 flex-center">
    
      <p className='py-1 text-center text-slate-300 font-poppins text-[12px]'>Currently only on Goerli Testnet. DO NOT USE ON MAINNET!</p>

    </div>

  )
}

export default Header;