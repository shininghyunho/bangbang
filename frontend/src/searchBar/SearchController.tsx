type DateGroup = { fromDate: string; toDate: string };
type PriceGroup = { minPrice: number; maxPrice: number };
type GuestGroup = { adult: number; child: number; infant: number };

export const fetchSearch = (dateGroup: DateGroup, priceGroup: PriceGroup, guestGroup: GuestGroup) => {
    const params = {
        fromDate: dateGroup.fromDate,
        toDate: dateGroup.toDate,
        minPrice: String(priceGroup.minPrice),
        maxPrice: String(priceGroup.maxPrice),
        adultSize: String(guestGroup.adult),
        childSize: String(guestGroup.child),
        infantSize: String(guestGroup.infant),
    };

    const queryParams = new URLSearchParams(params);
    const url = `/api/search?${queryParams.toString()}`;

    // for DEBUG
    alert(`Search URL: ${url}`);

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            console.log('Search successful:', data);
        })
        .catch(error => {
            console.error('Search failed:', error);
        });
};