import { BrowserRouter, Routes , Route} from 'react-router-dom'
import './App.css'
import Receiver from './pages/Receiver'
import Sender from './pages/Sender'
import Home from './pages/Home'
import Appbar from './components/Appbar'

function App() {
 

  return (
   <BrowserRouter>
   <Appbar/>
   <Routes>
    <Route path='receiver' element={<Receiver/>}/>
    <Route path='sender' element ={<Sender/>} />
    <Route path='/' element={<Home/>}/>
   </Routes>
   </BrowserRouter>
  )
}

export default App
