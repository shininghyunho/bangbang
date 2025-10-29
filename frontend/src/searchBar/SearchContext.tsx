import { createContext, useContext, useState } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';

/**
 * 백엔드 API 응답을 기반으로 한 단일 숙소 데이터 타입
 */
export interface Listing {
    name: string;
    description: string;
    address: string;
    totalPrice: number;
    guestCapacity: number;
    infantCapacity: number;
}

/**
 * Context가 제공할 값의 타입
 */
interface SearchContextType {
    searchResults: Listing[];
    setSearchResults: Dispatch<SetStateAction<Listing[]>>;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
}

// Context 생성 (초기값 설정)
// 초기값은 undefined로 설정하고, useSearch 훅에서 Provider 내에서 사용되었는지 확인합니다.
export const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Context를 제공하는 Provider 컴포넌트
interface SearchProviderProps {
    children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
    const [searchResults, setSearchResults] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const value = { searchResults, setSearchResults, isLoading, setIsLoading };

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// Context를 쉽게 사용하기 위한 커스텀 훅
export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}