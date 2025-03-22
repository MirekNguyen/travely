import { db } from "@/db";

export const getPrices = async () => {
  return db.query.prices.findMany();
}
