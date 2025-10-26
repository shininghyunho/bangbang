export class SearchListingsRequestDto {
  fromDate: string;
  toDate: string;
  minPrice: number;
  maxPrice: number;
  guestSize: number;
  infantSize: number;
}
