import { Footer } from "./Footer"
import { Header } from "./Header"
import { Main } from "./Main"

function App() {
  return(
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header/>
      <Main/>
      <Footer/>
    </div>
  )
}

export default App
