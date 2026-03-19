export default interface SearchParams<T> {
  haystack: T[] | MaybeRefOrGetter<T[]>; // ingredients
  searchFor: (keyof T | string)[]; // [title, nev]
  query?: string; // keresett szöveg
  showAllByDefault?: boolean;
  filter?: (value: any) => boolean; // filter
}