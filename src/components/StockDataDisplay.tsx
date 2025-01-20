import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StockData } from "../app/types/StockData";
import Loading from "@/components/fancy-dark-loading";
import { Share } from "lucide-react";

interface StockDataDisplayProps {
  data: StockData;
}

interface Strength {
  title: string;
  description: string;
}

export function StockDataDisplay({ data }: StockDataDisplayProps) {
  const [cachedData, setCachedData] = useState<StockData | null>(null);
  const [companyDescription, setCompanyDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>(
    "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  );
  const [imageSrc2, setImageSrc2] = useState<string>(
    "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  );
  const [keyMetrics, setKeyMetrics] = useState<
    Array<{ label: string; value: string | number; description: string }>
  >([]);
  const [financialHealth, setFinancialHealth] = useState<
    Array<{ label: string; value: string | number; description: string }>
  >([]);
  const [strengthsAndCatalysts, setStrengthsAndCatalysts] = useState<
    Strength[]
  >([]);
  const [analystHealth, setAnalystHealth] = useState<
    Array<{ label: string; value: string | number; description: string }>
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
    if (cachedData) {
      if (data.url1) {
        setImageSrc(data.url1);
      } else {
        setImageSrc(
          "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        );
      }
      const desc = await dsc(
        `Give ${cachedData.name} company's description in 50-70 words`
      );
      setCompanyDescription(desc);
      setLoadingStates((prev) => ({ ...prev, companyOverview: false }));
    }
  }, [cachedData]);

  const fetchKeyMetrics = useCallback(async () => {
    if (cachedData) {
      try {
        const promptMap = new Map([
          [
            "Market Cap",
            `Summarize _ market cap of ${cachedData.name} and how it benefits or disadvantaging the perception of the stock and don't specify the numbers (in less than 20 words).`,
          ],
          [
            "Shares Outstanding",
            `Summarize ${cachedData.name}'s shares outstanding value and why it's good or bad and don't specify the numbers(in less than 20 words).`,
          ],
          [
            "Shares Float",
            `Summarize ${cachedData.name} stock's shares float value and why it's good or bad compared to _ peer group and don't specify the numbers (in less than 20 words).`,
          ],
          [
            "EV/EBITDA",
            `Summarize if ${cachedData.name} EV/EBITDA ratio is high or low. Discuss the implications of this and don't specify the numbers (in less than 20 words) `,
          ],
          [
            "P/E",
            `Summarize ${cachedData.name} P/E value and how it compares to ${cachedData.name} peer group and don't specify the numbers. (in less than 20 words) `,
          ],
          [
            "Dividend Rate",
            `Summarize ${cachedData.name} Dividend Yield and how it compares to ${cachedData.name} peer group and don't specify the numbers. (in less than 20 words)`,
          ],
        ]);

        const metricsData = [
          { label: "Market Cap", value: "$" + cachedData.marketCap },
          {
            label: "Shares Outstanding",
            value: cachedData.sharesOutstanding,
          },
          { label: "Shares Float", value: cachedData.float },
          { label: "EV/EBITDA", value: cachedData.evEbitda + "x" },
          { label: "P/E", value: cachedData.peTtm + "x" },
          { label: "Dividend Rate", value: "$" + cachedData.dividendRate },
        ];

        const metricsWithDescriptions = await Promise.all(
          metricsData.map(async (metric) => ({
            ...metric,
            description: await dsc(promptMap.get(metric.label) || ""),
          }))
        );

        setKeyMetrics(metricsWithDescriptions);
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
        { label: "Cash Position", value: "$" + cachedData.cashPosition },
        { label: "Total Debt", value: "$" + cachedData.totalDebt },
        { label: "Debt to Equity", value: cachedData.debtToEquity + "x" },
        { label: "Current Ratio", value: cachedData.currentRatio + "x" },
      ];

      const financialsWithDescriptions = await Promise.all(
        financialsData.map(async (item) => ({
          ...item,
          description: await dsc(
            `summary of ${item.label} of ${cachedData.name} in 20-30 words without the numbers`
          ),
        }))
      );

      setFinancialHealth(financialsWithDescriptions);
      setLoadingStates((prev) => ({ ...prev, financialHealth: false }));
    }
  }, [cachedData]);

  const fetchStrengthsAndCatalysts = useCallback(async () => {
    if (cachedData) {
      const strengthsData = await dsc(
        `Give me growth catalysts of ${cachedData.name} stock, give me 6 points,with headings, and description not more than 40 words`
      );
      console.log(strengthsData);
      setStrengthsAndCatalysts(parsePoints(strengthsData));
      setLoadingStates((prev) => ({ ...prev, strengthsAndCatalysts: false }));
    }
  }, [cachedData]);

  const fetchAnalystHealth = useCallback(async () => {
    if (cachedData) {
      const analystInfo = [
        { label: "Analyst Rating (1-5)", value: cachedData.analystRating },
        { label: "Number of Analysts", value: cachedData.numberOfAnalysts },
        { label: "Mean Target Price", value: "$" + cachedData.meanTargetPrice },
        { label: "Implied +/-", value: cachedData.impliedChange },
      ];

      const analystDataWithDescriptions = await Promise.all(
        analystInfo.map(async (item) => ({
          ...item,
          description: await dsc(
            `summary of ${item.label} of ${cachedData.name} in 20-30 words without the numbers`
          ),
        }))
      );

      setAnalystHealth(analystDataWithDescriptions);
      setLoadingStates((prev) => ({ ...prev, analystHealth: false }));
    }
  }, [cachedData]);

  const fetchRisksAndMitigations = useCallback(async () => {
    if (cachedData) {
      const risksData = await dsc(
        `Give me 6 Risks with explanation and also their mitigations respectively of ${cachedData.name} stock with headings and description of not more than 20 words for each`
      );
      console.log(risksData);
      setRisksAndMitigations(parseRisksAndMitigations(risksData));
      setLoadingStates((prev) => ({ ...prev, risksAndMitigations: false }));
    }
  }, [cachedData]);

  const fetchConclusion = useCallback(async () => {
    if (cachedData) {
      const conclusionData = await dsc(
        `With this info ${JSON.stringify(
          cachedData
        )} give a 70-100 words conclusion which include should we buy it or not?.`
      );

      if (data.url2) setImageSrc2(data.url2);
      setConclusion(conclusionData);
      setLoadingStates((prev) => ({ ...prev, conclusion: false }));
    }
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
    <Card className="flex w-[80vw] h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-white border-0">
      <CardHeader className="flex-1 p-16 justify-center">
        <CardTitle className="barlow-bolds text-5xl pb-3 font-bold text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          {name}
        </CardTitle>
        <CardDescription className="montserrat text-xl text-white">
          {description}
        </CardDescription>
      </CardHeader>
      <CardHeader className="w-5/12 p-0 relative overflow-hidden items-center justify-center">
        <CardDescription className="text-center overflow-hidden h-full w-full text-gray-400">
          <img
            className="object-cover w-full h-full rounded-r-lg"
            src={imageSrc}
            alt={`${name} visual representation`}
          />
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function KeyMetrics({
  metrics,
}: {
  metrics: Array<{
    label: string;
    value: string | number;
    description: string;
  }>;
}) {
  return (
    <Card className="flex w-[80vw] h-[75vh] pt-8 pb-8 bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0 overflow-hidden">
      <CardHeader className="flex-1 p-16 items-center justify-center">
        <CardTitle className="barlow-bold text-3xl font-bold text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Key Market Metrics: Reflecting Value and Potential
        </CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="montserrat p-6 bg-gray-800 rounded-md text-center"
            >
              <h3 className="text-xl font-bold">{metric.value}</h3>
              <p className="text-base font-semibold mt-2">{metric.label}</p>
              <p className="text-xs mt-2 text-gray-400">{metric.description}</p>
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
    description: string;
  }>;
}) {
  return (
    <Card className="flex w-[80vw] h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0">
      <CardHeader className="flex-1 p-16 items-center justify-center">
        <CardTitle className="barlow-bold text-3xl font-bold pb-6 text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Financial Health
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {financials.map((item) => (
            <div
              key={item.label}
              className="montserrat p-6 bg-gray-800 rounded-md text-center"
            >
              <h3 className="text-xl font-bold">{item.value}</h3>
              <p className="text-base font-semibold mt-2">{item.label}</p>
              <p className="text-xs mt-2 text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

function StrengthsAndCatalysts({ strengths }: { strengths: Strength[] }) {
  return (
    <Card className="flex flex-col w-[80vw] overflow-hidden h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0">
      <CardHeader className="flex-1 items-center justify-center">
        <CardTitle className="barlow-bold text-3xl font-bold text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Strengths and Catalysts for Continued Success
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strengths.map((strength, index) => (
            <Card
              key={index}
              className="montserrat bg-gray-800 border-0 rounded-lg pt-6 shadow-md"
            >
              <CardContent className="flex gap-9 items-start space-x-3">
                <div>
                  <div className="w-[4px] h-[15px] mt-1.5 absolute bg-purple-400 rounded-full "></div>
                  <CardTitle className="text-lg pl-3 font-semibold text-white">
                    {strength.title}
                  </CardTitle>
                  <CardDescription className=" text-sm text-gray-300 mt-2">
                    {strength.description}
                  </CardDescription>
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
    description: string;
  }>;
}) {
  return (
    <Card className="flex w-[80vw] h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0">
      <CardHeader className="flex-1 p-16 items-center justify-center">
        <CardTitle className="barlow-bold text-3xl pb-6 font-bold text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Analyst Health
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analystData.map((item) => (
            <div
              key={item.label}
              className="montserrat p-6 bg-gray-800 rounded-md text-center"
            >
              <h3 className="text-xl font-bold">{item.value}</h3>
              <p className="text-base font-semibold mt-2">{item.label}</p>
              <p className="text-xs mt-2 text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

function RisksAnalysis({ points }: { points: Strength[] }) {
  return (
    <Card className="flex flex-col w-[80vw] h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0 overflow-hidden">
      <CardHeader className="flex-1 p-3 items-center justify-center">
        <CardTitle className="barlow-bold text-3xl font-bold text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Risks and Mitigations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
          {points.map((point, index) => (
            <Card
              key={index}
              className="montserrat bg-gray-800 border-0 rounded-lg pt-6 shadow-md"
            >
              <CardContent className="flex items-start space-x-3">
                <div>
                  <div className="w-[4px] h-[15px] mt-1.5 absolute bg-purple-400 rounded-full "></div>
                  <CardTitle className="flex pl-3 gap-2 text-lg font-semibold text-white">
                    {point.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-300 mt-2">
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
                  </CardDescription>
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
    <Card className="flex w-[80vw] h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0">
      <CardHeader className="w-1/3 p-0 relative overflow-hidden items-center justify-center">
        <CardDescription className="text-center overflow-hidden h-full w-full text-gray-400">
          <img
            className="object-cover h-full rounded-l-lg"
            src={imageSrc}
            alt={`${name} visual representation`}
          />
        </CardDescription>
      </CardHeader>
      <CardHeader className="flex-1 p-16 items-center justify-center">
        <CardTitle className="barlow-bold text-right text-4xl pb-3 font-bold text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Conclusion
        </CardTitle>
        <CardDescription className="montserrat text-xl text-center text-white">
          {description}
          <div className="flex items-center justify-center">
            <span className="font-bold text-white barlow-bold text-2xl">
              Recommendation:{" "}
            </span>
            <div className="montserrat text-2xl">{" " + rec}</div>
          </div>
        </CardDescription>
      </CardHeader>
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

async function dsc(_prompt: string) {
  const data = { prompt: _prompt };
  const res = await fetch("/api/prompt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const response = await res.text();
  const obj = JSON.parse(response);
  return obj.response;
}

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
