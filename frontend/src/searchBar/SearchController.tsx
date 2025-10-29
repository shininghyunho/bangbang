import type { Listing } from "./SearchContext";

type DateGroup = { fromDate: string; toDate: string };
type PriceGroup = { minPrice: number; maxPrice: number };
type GuestGroup = { adult: number; child: number; infant: number };

export const fetchSearch = async (dateGroup: DateGroup, priceGroup: PriceGroup, guestGroup: GuestGroup): Promise<Listing[]> => {
    const params = {
        fromDate: dateGroup.fromDate,
        toDate: dateGroup.toDate,
        minPrice: String(priceGroup.minPrice),
        maxPrice: String(priceGroup.maxPrice),
        guestSize: String(guestGroup.adult + guestGroup.child),
        infantSize: String(guestGroup.infant),
    };

    const queryParams = new URLSearchParams(params);
    const url = `http://localhost:3000/listings/search?${queryParams.toString()}`;

    // for DEBUG
    alert(`Search URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
};