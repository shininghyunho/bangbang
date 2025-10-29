import SearchBar from "../searchBar/SearchBar";

export function Header() {
  return (
    <header>
      <h1 style={{ textAlign: 'center' }}>여긴 Header 컴포넌트입니다.</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <SearchBar />
      </div>
    </header>
  )
}