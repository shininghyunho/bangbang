import { Footer } from "./Footer"
import { Header } from "./header/Header"
import { Main } from "./Main"
import { SearchProvider } from "./header/searchBar/SearchContext"

const borderStyle = { borderBottom: '1px solid #ccc', };

function App() {
  return(
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SearchProvider>
        <div style={borderStyle}>
          <Header/>
        </div>
        <div style={{ ...borderStyle, flex: 1 }}>
          <Main/>
        </div>
      </SearchProvider>
      <Footer />
    </div>
  )
}

export default App
