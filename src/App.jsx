import React from 'react'
import DCA from './component/DCA'
import Header from './component/Header'

const App = () => {
  return (
    <div className='bg-primary w-full overflow-hidden'>
      <Header/>
      <DCA/>
    </div>
  )
}

export default App