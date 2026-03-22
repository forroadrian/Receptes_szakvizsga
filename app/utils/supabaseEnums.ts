import { Constants } from "~/types/database.types";

type SupabaseEnumMap = typeof Constants.public.Enums;
export type SupabaseEnumName = keyof SupabaseEnumMap;

export function getEnumValues<K extends SupabaseEnumName>(name: K): SupabaseEnumMap[K] {
  return Constants.public.Enums[name];
}

export function getEnumNames(): SupabaseEnumName[] {
  return Object.keys(Constants.public.Enums) as SupabaseEnumName[];
}
