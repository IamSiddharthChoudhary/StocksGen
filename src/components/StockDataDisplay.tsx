import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StockData, TableType } from "../app/types/StockData";
import Loading from "@/components/fancy-dark-loading";
import {
  Banknote,
  BarChart2,
  Coins,
  Divide,
  Landmark,
  Percent,
  Scale,
  Share,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

interface StockDataDisplayProps {
  data: TableType;
}

interface Strength {
  title: string;
  description: string;
}

export function StockDataDisplay({ data }: StockDataDisplayProps) {
  const [cachedData, setCachedData] = useState<TableType | null>(null);
  const [companyDescription, setCompanyDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>(
    "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  );
  const [imageSrc2, setImageSrc2] = useState<string>(
    "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  );
  const [keyMetrics, setKeyMetrics] = useState<
    Array<{ label: string; value: string | number; description?: string }>
  >([]);
  const [financialHealth, setFinancialHealth] = useState<
    Array<{ label: string; value: string | number; description?: string }>
  >([]);
  const [strengthsAndCatalysts, setStrengthsAndCatalysts] = useState<
    Strength[]
  >([]);
  const [analystHealth, setAnalystHealth] = useState<
    Array<{ label: string; value: string | number; description?: string }>
  >([]);
  const [risksAndMitigations, setRisksAndMitigations] = useState<Strength[]>(
    []
  );
  const [conclusion, setConclusion] = useState<string>("");
  const [loadingStates, setLoadingStates] = useState({
    companyOverview: true,
    keyMetrics: true,
    financialHealth: true,
    strengthsAndCatalysts: true,
    analystHealth: true,
    risksAndMitigations: true,
    conclusion: true,
  });

  useEffect(() => {
    if (!cachedData) {
      setCachedData(data);
    }
  }, [data, cachedData]);

  const fetchCompanyOverview = useCallback(async () => {
    if (data.url1) setImageSrc(data.url1);
    setCompanyDescription(data.description);
    setLoadingStates((prev) => ({ ...prev, companyOverview: false }));
  }, [cachedData]);

  const fetchKeyMetrics = useCallback(async () => {
    if (cachedData) {
      try {
        const metricsData = [
          {
            label: "Market Cap",
            value: "$" + cachedData.marketCap,
            description: data.marketCapDsc,
          },
          {
            label: "Shares Outstanding",
            value: cachedData.sharesOutstanding,
            description: data.marketCapDsc,
          },
          {
            label: "Shares Float",
            value: cachedData.float,
            description: data.floatDsc,
          },
          {
            label: "EV/EBITDA",
            value: cachedData.evEbitda + "x",
            description: data.evEbitdaDsc,
          },
          {
            label: "P/E",
            value: cachedData.peTtm + "x",
            description: data.peTtmDsc,
          },
          {
            label: "Dividend Rate",
            value: "$" + cachedData.dividendRate,
            description: data.dividendRateDsc,
          },
        ];

        setKeyMetrics(metricsData);
      } catch (error) {
        console.error("Error fetching key metrics:", error);
        setKeyMetrics([]);
      } finally {
        setLoadingStates((prev) => ({ ...prev, keyMetrics: false }));
      }
    }
  }, [cachedData]);

  const fetchFinancialHealth = useCallback(async () => {
    if (cachedData) {
      const financialsData = [
        {
          label: "Cash Position",
          value: "$" + cachedData.cashPosition,
          description: data.cashPositionDsc,
        },
        {
          label: "Total Debt",
          value: "$" + cachedData.totalDebt,
          description: data.totalDebtDsc,
        },
        {
          label: "Debt to Equity",
          value: cachedData.debtToEquity + "x",
          description: data.debtToEquityDsc,
        },
        {
          label: "Current Ratio",
          value: cachedData.currentRatio + "x",
          description: data.currentRatioDsc,
        },
      ];

      setFinancialHealth(financialsData);
      setLoadingStates((prev) => ({ ...prev, financialHealth: false }));
    }
  }, [cachedData]);

  const fetchStrengthsAndCatalysts = useCallback(async () => {
    if (cachedData) {
      setStrengthsAndCatalysts(parsePoints(data.strengthsAndCatalysts));
      setLoadingStates((prev) => ({ ...prev, strengthsAndCatalysts: false }));
    }
  }, [cachedData]);

  const fetchAnalystHealth = useCallback(async () => {
    if (cachedData) {
      const analystInfo = [
        {
          label: "Analyst Rating (1-5)",
          value: cachedData.analystRating,
          description: cachedData.analystRatingDsc,
        },
        {
          label: "Number of Analysts",
          value: cachedData.numberOfAnalysts,
          description: cachedData.numberOfAnalystsDsc,
        },
        {
          label: "Mean Target Price",
          value: "$" + cachedData.meanTargetPrice,
          description: cachedData.meanTargetPriceDsc,
        },
        {
          label: "Implied +/-",
          value: cachedData.impliedChange,
          description: cachedData.impliedChangeDsc,
        },
      ];

      setAnalystHealth(analystInfo);
      setLoadingStates((prev) => ({ ...prev, analystHealth: false }));
    }
  }, [cachedData]);

  const fetchRisksAndMitigations = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, risksAndMitigations: false }));
    setRisksAndMitigations(parseRisksAndMitigations(data.risksAndMitigation));
  }, [cachedData]);

  const fetchConclusion = useCallback(async () => {
    if (data.url2) setImageSrc2(data.url2);
    setLoadingStates((prev) => ({ ...prev, conclusion: false }));
    setConclusion(data.conclusion);
  }, [cachedData]);

  useEffect(() => {
    if (cachedData) {
      fetchCompanyOverview();
      fetchKeyMetrics();
      fetchFinancialHealth();
      fetchStrengthsAndCatalysts();
      fetchAnalystHealth();
      fetchRisksAndMitigations();
      fetchConclusion();
    }
  }, [
    cachedData,
    fetchCompanyOverview,
    fetchKeyMetrics,
    fetchFinancialHealth,
    fetchStrengthsAndCatalysts,
    fetchAnalystHealth,
    fetchRisksAndMitigations,
    fetchConclusion,
  ]);

  if (!cachedData) {
    return <Loading />;
  }

  return (
    <div className="m-0 p-0">
      <div className="h-full flex flex-col gap-10 p-10 items-center justify-center bg-slate-900">
        {loadingStates.companyOverview ? (
          <LoadingCard />
        ) : (
          <CompanyOverview
            name={cachedData.name}
            description={companyDescription}
            imageSrc={imageSrc}
          />
        )}
        {loadingStates.keyMetrics ? (
          <LoadingCard />
        ) : (
          <KeyMetrics metrics={keyMetrics} />
        )}
        {loadingStates.financialHealth ? (
          <LoadingCard />
        ) : (
          <FinancialHealth financials={financialHealth} />
        )}
        {loadingStates.strengthsAndCatalysts ? (
          <LoadingCard />
        ) : (
          <StrengthsAndCatalysts strengths={strengthsAndCatalysts} />
        )}
        {loadingStates.analystHealth ? (
          <LoadingCard />
        ) : (
          <AnalystHealth analystData={analystHealth} />
        )}
        {loadingStates.risksAndMitigations ? (
          <LoadingCard />
        ) : (
          <RisksAnalysis points={risksAndMitigations} />
        )}
        {loadingStates.conclusion ? (
          <LoadingCard />
        ) : (
          <Conclusion
            rec={data.recommendation}
            description={conclusion}
            imageSrc={imageSrc2}
          />
        )}
      </div>
    </div>
  );
}

function CompanyOverview({
  name,
  description,
  imageSrc,
}: {
  name: string;
  description: string;
  imageSrc: string;
}) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-2xl shadow-cyan-400 text-white border-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <CardHeader className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 justify-center">
          <CardTitle className="barlow-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl pb-3 font-bold text-center lg:text-left">
            <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
              {name}
            </span>
          </CardTitle>
          <CardDescription className="montserrat text-sm sm:text-base md:text-lg lg:text-xl text-white">
            {description}
          </CardDescription>
          <div className="mt-4 sm:mt-6 md:mt-8 flex items-center">
            <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 bg-white rounded-full overflow-hidden">
              <img
                className="object-cover w-full h-full"
                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8SEg8QEA8NEhIQDxAPFhUQDQ8PFQ8QFRYWFxUXFRUYHSggGBolGxUWITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQFy0fICUtLS0tLSstLSstLS0tLS0tLS0tLS0tKy0tLSstKy0tLS0tKy0tLS0tKy0tLTUtLS0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAQIDBQYEB//EADoQAAIBAgQDBQYFAgYDAAAAAAABAgMRBBIhMQVBUQYiYXGBEzKRobHBFEJS0fAjgnKSorLh8SRiY//EABkBAQADAQEAAAAAAAAAAAAAAAABAgQDBf/EACMRAQEAAgICAgIDAQAAAAAAAAABAhEDMRIhBEFR0SJhsYH/2gAMAwEAAhEDEQA/APloALoCUiYxMiQFYxLEgkCLkORRsCZTKEggQCQBCZmizCyYMDM1fQwszIrUjzJGIEqLei1bPdDhVWycssU+rv8AQi3Q8ANpDh1NWzyk30UbfLc9FSdLLZU09t4wjb4vUpc4tpowbGpgoyvk7r6Pb6fS5469CUHaS/Z+RaZSosYgASgAAAAAAAAJIAEkEgAmZIsxEpgZkWuUTJJGFIvGJZIkCCQVcgJbKORDZBAAAAAAAAAEEhgXpyM9GnmaWy5tp2R5qUbu38se2lq8uWLjzvo1t4a30It0l7qMadNXjkzKOZuSTtr+5gxWNlK2XM7KUry8r6LkbDhnDHUSc5NrTu2VnbS5vYcEpNJJWscMs5v2648dscS5VXyk/L526fUtHETWlm/ifQcPweEVl5eSIXZ+ldtLX6EecXnFXCwrSbu0o287+ljLXrRmu/drZvnHx6neUuB0l+SPqka3jPZmE43pLJNbNbPzI84Xjr5/Wp5Xbdbp9V1MZsK2HmlKlNWnCWi2uudjwWNGN3HCzVQACyoAAAAAAAASQSAIJAExZkTMJZMDKQ2Q5FGyRLkVAIAAAAAAAAAAAAAB6qFG8U+r+R7uFYWU5Nu9kk/O38QwuHk4Qa6S+dvmdBwfDKK2/lzjlde3TCbr14FWRsaMzwUla68fkeqi7GeteLZ0z004HnwsrmxpoSbMrphcClSJ6po81Ziwl25XtLwn2n9SHvwV9PzLmjg8XTyya66+jPrM9z512toqGJmo2SaT0O3Dl704c2P20oANDOEEgCASQAAAAAASCCQBBIAAAAAAAAAAkAQCSVECpZRLqJNyRhBeaKkDt+zeDjOhTlbW0o+bue+pRypW5tv03+55Ox1f/wAaS2cZTSe2mjPcp3tC67ysvTmccovjdVjg7+hnobkzpKKv0TfwNM+Nyv3Kcnbe0M1zjcWqZx1mFNnCPjyOEp9rVB/1ISX9rR0XCeP06y7r5bcydaLd9N46ZgqpFa+Jyxc5aJK5x2L7WTlLLTjG17XcowX+ZizZ06WvHmfNu1k74iXgrHVRxmIcVK9J3/TPNdeex4uLcAVeo6kqypJRTblC+605rncnj1jd1Tklymo4kGTEUnCU4OzcJSjps7O2hjNTKAAAAABBIAgEkAAABIIJAkAAAAAAJSAglIsoliRCiSVbKuQFnIrCRBDIGZq5s+zvDPaupUcc8KGWUobOebMkvS1zVwZ0XYbHKniXTl7mJg6T/wAau4fdf3EZdenTi15zy6banWoPSlB0VBd+FmmlKyU9N1tc9WHo5Klv0pLXm9tPgeXiVGUKmDnB5W33rrRwy3knbwTNzicK+60tVeN//XZetjhGjmwmOXpgxdHOsqvrzs9DnfwWJc5RjNwilo4q2aXTw+B0avGSVz2QoQlq1rte9r+fUp5aqccdxzOC4DUlCX4huUuWapKSer3v7ullp0PJV4dPC1oVKctLpSje9rvqjufwsYrRfc5/i6V5K9k7aPryZNy2mYajd4mSq0VfaVr20NBjeAZnFxmoWWvdUk9b6N7ctjecNV6LXQ9tCCa2RGOVxqcsJl6aCjwiPtZVYpRzLvKPut9bLme+eHTkk/D5bfU2koqJ4E1eUv06/PX6Fd7pJqx8u43b8Ricu3t6tv8AMzxFpzcm5PeTcvV6kG2MNu6gABAAAAAAAAAQSAIBJAFgSEgIJSLKJIEKJIbKtkiWyGyAQAAAENEgCIMz05uLUou0oyUk+kk7p/FHnkZYMD6MqtKvQjWVs1s0bO8qMly809PFG1w9bPRo1Ho5Qi2uja1+Z814bxmph1JJKUJatO+kuqf82Po+Bp5aShe+SdSN9r9+TXyscfHxrRln5Yy/bXcQnaTkZ8BiU9bmv4vU1t/NbFMBhpvZ2OeUdOPLTo62N00texxlfj1F+09o4qWdrvOzsnpb6mxxFR09JTu3pZI19bhlKte6jFvm1uJPyvbvp0vZ7iFKULp3Vmt9mXo8RjNzVOXuSs3rZ+F+ZzXDOy8qV3+ItC98qatJedzayqQhH8ltveVhZCW96bKtj7rfU1uP4hCnRrTk96coJc5TkrJL+cjzU8PJyco5lHo23Z+FzVdrJf0qcb6us5ekYtP/AHIjGbykVzz/AIuVQANbEAAAQSAIBIAgAAAAAAAGRRJIbIuSLNlWyAQAAAAAACbE5QKkpFgmSKEQZZopJEDLJXTXVM+m0sUln10nGnXj4qUVF/6o/wCpHzOlFtSa/LFtndY+P9KjKk1mpU4pL9dNxWaL80r+cWVznra+Hu6Y8e1KT6NE8ExerjJ95XT8zVfiVJ21Wul9Gn+l+JSNVxqKS56NeKOFjtvTfca4RSrQzN1IyWuanNxa9NmavB8ImrKKpVdJa1Paa32vaXI6DB4iMo26mKWEnF9x6PlYiV1x19x44cNrLfDYaKyrepVklLqo3R6sNwqn7VVXTp50rLLGyiubS6+Jnp0Z9WeyjSsm3q7C1a2fh48dUtdLeWhw3aLGe0q5U+7SWReL/M/t6HQ9oMfkzNPvO8Y+D5v0ONqLmdOLH7ZeXL6UAB2cQgkAQCQBAJIAAAAQSAIBJAFwAAAAAE2FwCQsLkAS2RcWAAiO5Iyt2sm2BaQhBydl/wBeZmjSS974L9xKpbRJJPoTpG2VSjGORa33f6n+xvOCYmVSllUu/S7uvOPK/hp8UcxM9HC8Y6VSMtbbSXWL3/f0O2Gt6y6Uy3rc7bnFYR1Lxt7OtFXSe1SK2s+a8Vsa94lu8ZpxqR0ael7fc7GFKFSKUu8tJRadmnycXyNL2g4W3FzWso/mSs5LpLpLx5lOb4t4/c9z/HXi+ROX1fV/1HDOIWauzpI4i+Wz5dT5rRxLRtcJxSUdL3XnsZrx76aMc9dvocJK262MGIxChCTb2TfojmqHGW7KKlfwtqe2beRutrGVoON3tJqO/qUuFtkXufpxmLxsqs3OXPZfpXQxovxTAyoVZQd7bxf64PZ/Z+KZiizTrXpj3v2pJWIMrVzHYgQAAAAAAAAAABBIAgAAWFibkXAmwuRYkCBYkAAWp03LZf8ABnjSpr3pNvotF8SdG3mJhBvRJvyPcnBbQj9fqWdfktPLQnSNsEMJb33bwWr+OyLSklpFJL6+b5icjFJk6QiUjBN7PozKysSRX2kXzXroWjEhNNXWxZEodZ2QxuaMqUnrDWPjDp6P6o3lVWb2aa1T1OB4bi3RqwqL8r1XWL0kvh9juMbi4LLre6vFR7zkuVl99j0Pj5+WOr9MfNjrLcaHjHZhSbqUPNx5rxj18jUUODyvZya5HW0Ktabad6MUk9MspyT8XovT4npngbxTnZ9KmZ5n0vff4/Azc/xZveF1/X6aOH5F6z9/21XD+GxpK61fiZuOztSiubqU/k7/AGPdhMM+etvE8vF6WZ0o/wD1XyTf2POwn85L+Xo3XharxvB+1otWvOknOOl8ytecfVarxXicZ7Jflfo/3O/qVLZ5p2ywlqrOzSvc4Gcm25aJtt2Stv0PQ+RjN7efx2qNNblZrmZ4zJai/Dy/YzWOu3kBepTa8ihVKASAIBJAAAAAAAAAE2JKi4E3AAEl8PTzSUVz+S5mOxseEU9ZT6Wj8d/sWxm6i3URUVrpaKKNZUvc3eKhZN9WaacdWXymlMatRqtaHoueRIzwZCy7IJIZKEMoXZUDG1ld+Un8H19S5LSas+ZWD5PdfNcmBY7Dss1Oi8uVVacsrvtUjvG/TS6v4HHG47L4jLXjHM0qq9no/wA28fnp/cduDPxzcuXHeLrMRCUk5Ri3dNNZsri+a1vqeLCY3KlTnUqd3RKdKKcV0bWr8zc3lH3ldPnHR+qKYnB06y1tm5SX3PR1je4xeVnTLhrOKaaatutTDWw91KXON2vHrb6GHhsZU81Nu92rXTVm3Z8vL4GynHlytb0PPw+N48+VvX1/1vz+Tvgxk7/Tke0eNyU4winete7ttTVrq/Vt28rnMI7fjvD82HlFq8qVOpUVlbWLv80vmcOmPkY6yivDluVIuCrZndl3LQwyRe5Xl5OxWxMVABVIAABBIAgEkAAAAsSSAIuLgARc6Hh1BRpRb5rO/Xb5WJB14p7c+Tpr+KYnkmajUAi3dTOmWDMkQBEsiYYBZCoAAFKmne6b+QBAsWhJpqS0aaafRrVAAfUcDiVVp06i2nFS05N7r0d0Wnh+cXZ/zcA9HHK62wZYzdY53zQckk8zXJqXddrdAqk5PurLFPeW8vJckQC9/Kk9M/sk1JPXMnF+TVj5S6bi3CW8JOD84uz+hAMnyJ01cCQ0AZWlQmnz/n82IBASRABRYIJAEAAAAABBIA//2Q=="
                alt="Adrian Saville"
              />
            </div>
            <h1 className="montserrat text-lg sm:text-xl md:text-2xl lg:text-3xl ml-3">
              by Adrian Saville
            </h1>
          </div>
        </CardHeader>
        <div className="w-full lg:w-5/12 h-48 sm:h-56 md:h-64 lg:h-auto relative overflow-hidden">
          <img
            className="object-cover w-full h-full"
            src={imageSrc || "/placeholder.svg"}
            alt={`${name} visual representation`}
          />
        </div>
      </div>
    </Card>
  );
}

function KeyMetrics({
  metrics,
}: {
  metrics: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
}) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 md:p-8 lg:p-12">
        <CardTitle className="barlow-bold text-2xl sm:text-3xl font-bold text-center pb-4 sm:pb-6">
          <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
            Key Market Metrics: Reflecting Value and Potential
          </span>
        </CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="montserrat p-4 sm:p-6 bg-gray-800 rounded-md text-center"
            >
              <p className="text-lg sm:text-xl font-bold">{metric.value}</p>
              <p className="text-sm sm:text-base font-semibold mt-2">
                {metric.label === "Market Cap" && (
                  <GradientIcon
                    icon={Coins}
                    gradientId={`gradient-km-${index}`}
                  />
                )}
                {metric.label === "Shares Outstanding" && (
                  <GradientIcon
                    icon={Users}
                    gradientId={`gradient-km-${index}`}
                  />
                )}
                {metric.label === "Shares Float" && (
                  <GradientIcon
                    icon={Users}
                    gradientId={`gradient-km-${index}`}
                  />
                )}
                {metric.label === "P/E" && (
                  <GradientIcon
                    icon={BarChart2}
                    gradientId={`gradient-km-${index}`}
                  />
                )}
                {metric.label === "EV/EBITDA" && (
                  <GradientIcon
                    icon={TrendingUp}
                    gradientId={`gradient-km-${index}`}
                  />
                )}
                {metric.label === "Dividend Rate" && (
                  <GradientIcon
                    icon={Percent}
                    gradientId={`gradient-km-${index}`}
                  />
                )}
                {metric.label}
              </p>
              <p className="text-sm sm:text-base mt-2 text-gray-400">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

function FinancialHealth({
  financials,
}: {
  financials: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
}) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0">
      <CardHeader className="p-4 sm:p-6 md:p-8 lg:p-12">
        <CardTitle className="barlow-bold text-2xl sm:text-3xl font-bold text-center pb-4 sm:pb-6">
          <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
            Financial Health
          </span>
        </CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {financials.map((item, index) => (
            <div
              key={item.label}
              className="montserrat p-4 sm:p-6 bg-gray-800 rounded-md text-center"
            >
              <p className="text-lg sm:text-xl font-bold">{item.value}</p>
              <p className="text-sm sm:text-base font-semibold mt-2">
                {item.label === "Cash Position" && (
                  <GradientIcon
                    icon={Banknote}
                    gradientId={`gradient-fh-${index}`}
                  />
                )}
                {item.label === "Debt to Equity" && (
                  <GradientIcon
                    icon={Scale}
                    gradientId={`gradient-fh-${index}`}
                  />
                )}
                {item.label === "Total Debt" && (
                  <GradientIcon
                    icon={Landmark}
                    gradientId={`gradient-fh-${index}`}
                  />
                )}
                {item.label === "Current Ratio" && (
                  <GradientIcon
                    icon={Divide}
                    gradientId={`gradient-fh-${index}`}
                  />
                )}
                {item.label}
              </p>
              <p className="text-sm sm:text-base mt-2 text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

function StrengthsAndCatalysts({ strengths }: { strengths: Strength[] }) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 md:p-8">
        <CardTitle className="barlow-bold text-2xl sm:text-3xl font-bold text-center">
          <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
            Strengths and Catalysts for Continued Success
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pr-4 pl-4 sm:pr-6 sm:pl-6 md:pl-8 md:pr-8 md:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {strengths.map((strength, index) => (
            <Card
              key={index}
              className="montserrat bg-gray-800 border-0 rounded-lg pt-4 sm:pt-6 shadow-md"
            >
              <CardContent className="flex items-start space-x-3">
                <div className="w-full">
                  <div className="relative">
                    <div className="w-[4px] h-[15px] absolute left-0 top-1.5 bg-purple-400 rounded-full"></div>
                    <CardTitle className="pl-3 text-lg font-semibold text-white">
                      {strength.title}
                    </CardTitle>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    {strength.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalystHealth({
  analystData,
}: {
  analystData: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
}) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-lg sm:shadow-xl md:shadow-2xl shadow-cyan-400/20 sm:shadow-cyan-400/30 md:shadow-cyan-400/40 text-gray-100 border-0 overflow-hidden">
      <div className="flex flex-col">
        <div className="w-full h-[20vh] sm:h-[25vh] md:h-[30vh] relative overflow-hidden">
          <img
            className="object-cover object-bottom w-full h-full"
            src="https://images.pexels.com/photos/7239279/pexels-photo-7239279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Analyst insights visual representation"
          />
        </div>
        <CardHeader className="p-4 sm:p-6 md:p-8 lg:p-10">
          <CardTitle className="barlow-bold text-xl sm:text-2xl md:text-3xl pb-4 sm:pb-6 font-bold text-center">
            <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
              Analyst Insights
            </span>
          </CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {analystData
              .filter((item) => item.label !== "Number of Analysts")
              .map((item, index) => (
                <div
                  key={item.label}
                  className="montserrat p-3 sm:p-4 md:p-5 bg-gray-800 rounded-md text-center"
                >
                  <p className="text-base sm:text-lg md:text-xl font-bold">
                    {item.value}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold mt-2 flex items-center justify-center">
                    {item.label === "Number of Analysts" && (
                      <GradientIcon
                        icon={User}
                        gradientId={`gradient-ah-${index}`}
                        // className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                      />
                    )}
                    {item.label === "Analyst Rating (1-5)" && (
                      <GradientIcon
                        icon={Star}
                        gradientId={`gradient-ah-${index}`}
                        // className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                      />
                    )}
                    {item.label === "Mean Target Price" && (
                      <GradientIcon
                        icon={Banknote}
                        gradientId={`gradient-ah-${index}`}
                        // className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                      />
                    )}
                    {item.label === "Implied +/-" && (
                      <GradientIcon
                        icon={Scale}
                        gradientId={`gradient-ah-${index}`}
                        // className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                      />
                    )}
                    {item.label}
                  </p>
                  <p className="text-sm sm:text-base mt-2 text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
          </div>
        </CardHeader>
      </div>
    </Card>
  );
}

function RisksAnalysis({ points }: { points: Strength[] }) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 md:p-8">
        <CardTitle className="barlow-bold text-2xl sm:text-3xl font-bold text-center">
          <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
            Risks and Mitigations
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pr-4 pl-4 sm:pr-6 sm:pl-6 md:pl-8 md:pr-8 md:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {points.map((point, index) => (
            <Card
              key={index}
              className="montserrat bg-gray-800 border-0 rounded-lg pt-4 sm:pt-6 shadow-md"
            >
              <CardContent className="flex items-start space-x-3">
                <div className="w-full">
                  <div className="relative">
                    <div className="w-[4px] h-[15px] absolute left-0 top-1.5 bg-purple-400 rounded-full"></div>
                    <CardTitle className="pl-3 text-lg font-semibold text-white">
                      {point.title}
                    </CardTitle>
                  </div>
                  <p className="text-sm sm:text-sm text-gray-300 mt-2">
                    {point.description.split("Mitigation:").map((part, i) => (
                      <React.Fragment key={i}>
                        {i === 0 ? (
                          <>{part}</>
                        ) : (
                          <>
                            <br />
                            <span className="font-bold text-white">
                              Mitigation:{" "}
                            </span>
                            {part}
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Conclusion({
  description,
  imageSrc,
  rec,
}: {
  description: string;
  imageSrc: string;
  rec: string;
}) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 h-64 lg:h-auto relative overflow-hidden">
          <img
            className="object-cover w-full h-full"
            src={imageSrc || "/placeholder.svg"}
            alt="Conclusion visual"
          />
        </div>
        <CardHeader className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 items-center justify-center">
          <CardTitle className="barlow-bold text-3xl sm:text-4xl pb-3 font-bold text-center lg:text-right">
            <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
              Conclusion
            </span>
          </CardTitle>
          <p className="montserrat text-base sm:text-lg lg:text-xl text-center text-white">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center mt-4 gap-2">
            <span className="font-bold text-white barlow-bold text-xl sm:text-2xl">
              Recommendation:
            </span>
            <p className="montserrat text-lg sm:text-xl lg:text-2xl">{rec}</p>
          </div>
        </CardHeader>
      </div>
    </Card>
  );
}

// async function getImage(_name: string) {
//   const data = { stockName: _name };
//   const res = await fetch("/api/image", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   const response = await res.json();
//   return response.imageUrl;
// }

function parsePoints(text: string): Strength[] {
  const strengths: Strength[] = [];
  const parts = text.split(/\d+\./).slice(1);

  for (const part of parts) {
    const [title, ...descriptionParts] = part.split(":");
    const description = descriptionParts.join(":").trim();
    if (title && description) {
      strengths.push({
        title: title.trim(),
        description: description.replace(/\.$/, ""),
      });
    }
  }

  return strengths;
}

function parseRisksAndMitigations(text: string): Strength[] {
  const risks: Strength[] = [];
  const parts = text.split(/\d+\./).slice(1);

  for (const part of parts) {
    const [title, ...descriptionParts] = part.split(":");
    const fullDescription = descriptionParts.join(":").trim();
    const [risk, mitigation] = fullDescription.split("Mitigation:");

    if (title && risk) {
      risks.push({
        title: title.trim(),
        description: `${risk.trim()}\nMitigation:${
          mitigation ? mitigation.trim() : "Not provided"
        }`,
      });
    }
  }

  return risks;
}

function LoadingCard() {
  return (
    <Card className="flex w-[80vw] h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0 items-center justify-center">
      <CardContent>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </CardContent>
    </Card>
  );
}

function GradientIcon({
  icon: Icon,
  gradientId,
}: {
  icon: typeof User;
  gradientId: string;
}) {
  return (
    <svg className="w-6 h-6 inline-block mr-2" viewBox="0 0 24 24">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <mask id={`mask-${gradientId}`}>
          <Icon color="white" />
        </mask>
      </defs>
      <rect
        width="24"
        height="24"
        fill={`url(#${gradientId})`}
        mask={`url(#mask-${gradientId})`}
      />
    </svg>
  );
}
