export default function getValue<T extends object>(element: T, key: string): any {
  const descriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(element),
    key
  );
  
  if (descriptor?.get) {
    return descriptor.get.call(element);
  }

  return (element as Record<string, any>)[key];
}