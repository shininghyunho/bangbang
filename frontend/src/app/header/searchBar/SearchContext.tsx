import { createContext, useContext, useState } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';

// 숙소 검색 결과 단일 값.
export interface Listing {
    name: string;
    description: string;
    address: string;
    totalPrice: number;
    guestCapacity: number;
    infantCapacity: number;
}

interface SearchContextType {
    searchResults: Listing[];
    setSearchResults: Dispatch<SetStateAction<Listing[]>>;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
}

// Context 생성
// 초기값은 undefined, useSearch 훅에서 Provider 내에서 사용되었는지 확인함.
export const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Context를 제공하는 Provider
interface SearchProviderProps {
    children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
    const [searchResults, setSearchResults] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const value = { searchResults, setSearchResults, isLoading, setIsLoading };

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// 검색용 커스텀 훅
export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) throw new Error('search context가 undefined 입니다!');
    return context;
}