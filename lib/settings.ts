import { supabase } from "./supabase";

export async function getAppSettings() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return {
      id: 1,
      symbol: "SPCX",
      fee_rate: 0.001,
      quick_qty: "1,3,5,7,10",
    };
  }

  return data;
}

export function parseQuickQty(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => item > 0);
}