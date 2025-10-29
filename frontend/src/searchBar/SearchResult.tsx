import { useSearch } from "./SearchContext";

export function SearchResult() {
    const { searchResults, isLoading } = useSearch();

    if (isLoading) {
        return <h2 style={{ textAlign: 'center' }}>검색 중...</h2>;
    }

    if (searchResults.length === 0) {
        return <h2 style={{ textAlign: 'center' }}>검색 결과가 없습니다.</h2>;
    }

    return(
        <div style={{ padding: '1rem' }}>
            <h2 style={{ textAlign: 'center' }}>검색 결과 ({searchResults.length}개)</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {searchResults.map((listing, index) => (
                    <li key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                        <h3>{listing.name}</h3>
                        <p>{listing.description}</p>
                        <p><strong>주소:</strong> {listing.address}</p>
                        <p>
                            <strong>총 가격:</strong> {listing.totalPrice.toLocaleString()}원
                        </p>
                        <p>
                            <strong>최대 인원:</strong> 성인 {listing.guestCapacity}명
                            {listing.infantCapacity > 0 && `, 유아 ${listing.infantCapacity}명`}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}