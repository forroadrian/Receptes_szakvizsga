export default interface SearchParams<T> {
  haystack: T[]; // ingredients
  searchFor: (keyof T | string)[]; // [title, nev]
  query?: string; // keresett szöveg
  filter?: (value: any) => boolean; // filter
}