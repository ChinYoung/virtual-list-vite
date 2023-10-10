import './App.css'
import { TradeContextProvider } from './Providers/TradeProvider'
import TradeList from './components/TradeList'

function App() {
  return (
    <TradeContextProvider>
      <div className="text-center bg-gray-300 border border-blue-300 w-screen h-screen flex justify-center items-center">
        <div className='w-full h-full p-4'>
          <TradeList />
        </div>
      </div >
    </TradeContextProvider>
  )
}

export default App
