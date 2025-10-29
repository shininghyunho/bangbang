import SearchBar from "../searchBar/SearchBar";

export function Header() {
  return (
    <header style={{ backgroundColor: '#FFDDE1', padding: '2rem 0' }}>
      <h1 style={{ textAlign: 'center' }}>여긴 Header 컴포넌트입니다.</h1>
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '1rem' }}>
        <SearchBar />
      </div>
    </header>
  )
}