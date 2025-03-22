import { getPrices } from "@/actions/actions";
import PriceExplorer from "./PriceExplorer";

export default async function Home() {
  const prices = await getPrices();
    return (
    <div className="min-h-screen bg-black text-white">
      <PriceExplorer initialData={prices} />
    </div>
  );
}
