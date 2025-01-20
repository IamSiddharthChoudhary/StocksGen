"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "@/components/fancy-dark-loading";
import { StockDataDisplay } from "@/components/StockDataDisplay";
import type { StockData } from "@/app/types/StockData";
import { createSupabaseClient } from "@/lib/supaBaseClient";

export default function Page() {
  const [stockData, setStockData] = useState<StockData | null>(null);
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
        .eq("name", `${user}-${extractName(id)}`)
        .single();
      console.log(data);
      if (data) {
        let d: StockData = data;
        setStockData(d);
      } else {
        let { data: d, error } = await supabase
          .from("company")
          .select("*")
          .eq("name", `${id}`)
          .single();
        setStockData(d);
      }

      setIsLoading(false);
    }

    data();
  }, [id]);

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500">{error}</div>;

  return <StockDataDisplay data={stockData} id={id} />;
}

function extractName(input: string) {
  if (!input) return "";
  const parts = input.split("-");
  return parts.length > 1 ? parts[1].trim() : input.trim();
}
