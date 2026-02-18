export default interface SearchParams<T> {
  haystack: T[];
  searchFor: (keyof T | string)[];
  query?: string;
  filter?: (value: any) => boolean;
}