import { MapResult } from "../searchBar/MapResult";
import { SearchResult } from "../searchBar/SearchResult";

export function Main() {
  return (
    <main>
      <h1 style={{ textAlign: 'center' }}>여긴 Main 컴포넌트입니다.</h1>
      <div style={{ display: 'flex', width: '100%', minHeight: '60vh' }}>
        <div style={{ width: '50%', overflow: 'auto', borderRight: '1px solid #ccc' }}>
          <SearchResult />
        </div>
        <div style={{ width: '50%' }}>
          <MapResult />
        </div>
      </div>
    </main>
  );
}