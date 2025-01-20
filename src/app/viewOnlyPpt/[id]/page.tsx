"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "@/components/fancy-dark-loading";
import { StockDataDisplay } from "@/components/StockDataDisplay";
import type { StockData, TableType } from "@/app/types/StockData";
import { createSupabaseClient } from "@/lib/supaBaseClient";

export default function Page() {
  const [stockData, setStockData] = useState<TableType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const user = params.user as string;
  const id = params.id as string;

  useEffect(() => {
    const supabase = createSupabaseClient();

    async function data() {
      setIsLoading(true);

      let { data, error } = await supabase
        .from("company")
        .select("*")
        .eq("ticker", id)
        .single();
      if (data) {
        let d: TableType = data;
        setStockData(d);
      } else {
        let { data: d, error } = await supabase
          .from("company")
          .select("*")
          .eq("ticker", id)
          .single();
        setStockData(d);
      }

      console.log(data);

      setIsLoading(false);
    }

    data();
  }, [id]);

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500">{error}</div>;

  return <StockDataDisplay data={stockData} id={id} />;
}
