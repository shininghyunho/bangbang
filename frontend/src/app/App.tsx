import { Footer } from "./Footer"
import { Header } from "./Header"
import { Main } from "./Main"
import { SearchProvider } from "../searchBar/SearchContext"

function App() {
  return(
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SearchProvider>
        <Header/>
        <Main/>
      </SearchProvider>
      <Footer/>
    </div>
  )
}

export default App
