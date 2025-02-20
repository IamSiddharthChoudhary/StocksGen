"use client";

import { createSupabaseClient } from "@/lib/supaBaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FileText, Frown, PieChart, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface Ppt {
  name: string;
  time: string;
  ticker: string;
}

interface Subscription {
  req: number;
  total: number;
}

export default function Page({ id }: { id: string }) {
  const [ppts, setPpts] = useState<Ppt[]>([]);
  const [subscription, setSubscription] = useState<Subscription>();
  const router = useRouter();

  useEffect(() => {
    const client: SupabaseClient = createSupabaseClient();

    async function fetchPpts() {
      const { data, error } = await client
        .from("company")
        .select("name,time,ticker")
        .eq("name", id);

      data?.map((item) => {
        item.name = item.name.toString().slice(item.name.indexOf("@"));
      });

      if (data) setPpts(data);
    }

    async function fetchSubscription() {
      const { data, error } = await client
        .from("subs")
        .select("req,total")
        .eq("name", id)
        .single();

      if (data) setSubscription(data);
    }

    fetchPpts();
    fetchSubscription();
  }, [id]);

  function upgrade() {
    // Implement upgrade logic here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  text-gray-100  from-slate-800 to-stone-400 p-4 sm:p-6 md:p-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl barlow-bold font-bold text-center mb-8">
        Welcome to Your Dashboard
      </h1>

      <section className="mb-8  text-gray-100">
        <h2 className="barlow-bold text-xl sm:text-2xl mb-4">Stats</h2>
        <div className="montserrat grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className=" text-gray-100 glass-effect hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Presentations
              </CardTitle>
              <FileText className="h-4 w-4  text-gray-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ppts.length}</div>
            </CardContent>
          </Card>

          <Card className="text-gray-100 glass-effect hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscription Usage
              </CardTitle>
              <PieChart className="h-4 w-4 text-gray-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.req && subscription?.total
                  ? `${((subscription.req / subscription.total) * 100).toFixed(
                      0
                    )}%`
                  : "Unlimited"}
              </div>
              <Progress
                value={
                  ((subscription?.req ?? 0) / (subscription?.total ?? 1)) * 100
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="text-gray-100 glass-effect hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upgrade Subscription
              </CardTitle>
              <Users className="h-4 w-4  text-gray-100" />
            </CardHeader>
            <CardContent>
              <Button
                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                onClick={upgrade}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="barlow-bold text-xl sm:text-2xl mb-4">Presentations</h2>
        {ppts.length === 0 ? (
          <div className="flex flex-col p-6 sm:p-10 montserrat justify-center items-center text-gray-100 glass-effect">
            <Frown size={60} className="text-gray-200 mb-4" />
            <p className="text-lg  mb-6">No edited presentations yet</p>
            <Button
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-semibold shadow-md hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300"
              onClick={() => router.push("/")}
            >
              Generate Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {ppts.map((ppt, index) => (
              <Card
                key={index}
                onClick={() => {
                  router.push("/pptDisplay/" + ppt.ticker);
                }}
                className="text-gray-100 glass-effect hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {ppt.name} Presentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm ">
                    Last updated: {new Date(ppt.time).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
