export default interface SearchParams<T> {
  haystack: T[];
  searchFor: (keyof T | string)[];
  query?: string | string[];
  showAllByDefault?: boolean;
  filter?: (value: any) => boolean;
}