"use client";
import type React from "react";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type SetStateAction,
  type Dispatch,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  EditedValType,
  TableType,
  StockHistory,
} from "../app/types/StockData";
import {
  Banknote,
  BarChart2,
  Check,
  Coins,
  Copy,
  Divide,
  Landmark,
  Link,
  Percent,
  Scale,
  Share,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { EditableText } from "./editableTest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supaBaseClient";
import { Loader2 } from "@/components/ui/loader";
import SaveButton from "./ui/saveButton";
import Refresh from "./ui/refreshButton";
import { useRouter } from "next/navigation";

interface StockDataDisplayProps {
  data: TableType;
  id: string;
  userId: string;
}

interface Strength {
  title: string;
  description: string;
}

export function StockDataDisplay({ data, id, userId }: StockDataDisplayProps) {
  const [calls, setCalls] = useState(0);
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [dataSave, setDataSave] = useState<TableType>();
  const [isSaving, setIsSaving] = useState(false);
  const [cachedData, setCachedData] = useState<TableType | null>(null);
  const [editedVals, setEditedVals] = useState<EditedValType>({});
  const [companyDescription, setCompanyDescription] = useState<string>("");
  const [hasChanged, setHasChanged] = useState(false);
  const [count, setCount] = useState(0);
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string>(
    "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  );
  const [imageSrc2, setImageSrc2] = useState<string>(
    "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  );
  const [keyMetrics, setKeyMetrics] = useState<
    Array<{
      label: string;
      value: string | number;
      description: string;
      name: string;
    }>
  >([]);
  const [financialHealth, setFinancialHealth] = useState<
    Array<{
      label: string;
      value: string | number;
      description: string;
      name: string;
    }>
  >([]);
  const [strengthsAndCatalysts, setStrengthsAndCatalysts] = useState<
    Strength[]
  >([]);
  const [analystHealth, setAnalystHealth] = useState<
    Array<{
      label: string;
      value: string | number;
      description: string;
      name: string;
    }>
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
    history: true,
  });
  const [history, setHistory] = useState<StockHistory | null>(null);

  useEffect(() => {
    setClient(createSupabaseClient());
  }, []);

  // useEffect(() => {
  //   setTimeout(() => {
  //     defaultSave();
  //   }, 2000);
  // }, [conclusion, data, id, client, companyDescription]);

  useEffect(() => {
    // const divRate = await fetch(
    //   `https://api.nasdaq.com/api/quote/${id}/dividends?assetclass=stocks`
    // );

    if (!cachedData) {
      setCachedData(data);
    }
  }, [data, cachedData]);

  useEffect(() => {
    if (cachedData) {
      const newData: TableType = {
        ...cachedData,
        oneYrDsc: cachedData.oneYrDsc,
        risksAndMitigation: parsePointsToString(risksAndMitigations),
      };
      setDataSave(cachedData);
    }
  }, [cachedData]);

  const fetchCompanyOverview = useCallback(async () => {
    if (cachedData && client) {
      try {
        let { data: companyData, error } = await client
          .from("company")
          .select("description")
          .eq("name", `${userId}-${data.name}`)
          .single();

        if (!companyData) {
          const { data: defaultData, error } = await client
            .from("company")
            .select("description")
            .eq("name", data.name)
            .single();

          companyData = defaultData;
        }

        if (companyData && companyData.description) {
          setCompanyDescription(companyData.description);
        } else {
          const desc = await dsc(
            `Give ${cachedData.name} company's description in 50-70 words`
          );
          setCompanyDescription(desc);
        }
        setImageSrc(cachedData.url1 || "");
      } catch (error) {
        console.error("Error fetching company overview:", error);
        const desc = await dsc(
          `Give ${cachedData.name} company's description in 50-70 words`
        );
        setCompanyDescription(desc);
        setImageSrc(cachedData.url1 || "");
      } finally {
        setLoadingStates((prev) => ({ ...prev, companyOverview: false }));
      }
    }
  }, [cachedData, client, id]);

  const fetchKeyMetrics = useCallback(async () => {
    if (cachedData && client) {
      try {
        let { data: metricsData, error } = await client
          .from("company")
          .select(
            "marketCap,marketCapDsc,sharesOutstanding,sharesOutstandingDsc,float,floatDsc,evEbitda,evEbitdaDsc,peTtm,peTtmDsc,dividendRate,dividendRateDsc"
          )
          .eq("name", `${userId}-${data.name}`)
          .single();

        if (!metricsData) {
          const { data: defalutData, error } = await client
            .from("company")
            .select(
              "marketCap,marketCapDsc,sharesOutstanding,sharesOutstandingDsc,float,floatDsc,evEbitda,evEbitdaDsc,peTtm,peTtmDsc,dividendRate,dividendRateDsc"
            )
            .eq("name", data.name)
            .single();

          metricsData = defalutData;
        }

        const metricsWithDescriptions = [
          {
            label: "Market Cap",
            value:
              "$" +
              roundAndConvert(metricsData?.marketCap || cachedData.marketCap),
            name: "marketCap",
            description: metricsData?.marketCapDsc,
          },
          {
            label: "Shares Outstanding",
            value:
              "$" +
              roundAndConvert(
                metricsData?.sharesOutstanding || cachedData.sharesOutstanding
              ),
            name: "sharesOutstanding",
            description: metricsData?.sharesOutstandingDsc,
          },
          {
            label: "Shares Float",
            value:
              "$" + roundAndConvert(metricsData?.float || cachedData.float),
            name: "float",
            description: metricsData?.floatDsc,
          },
          {
            label: "EV/EBITDA",
            value: (metricsData?.evEbitda || cachedData.evEbitda) + "x",
            name: "evEbitda",
            description: metricsData?.evEbitdaDsc,
          },
          {
            label: "P/E",
            value: (metricsData?.peTtm || cachedData.peTtm) + "x",
            name: "peTtm",
            description: metricsData?.peTtmDsc,
          },
          {
            label: "Dividend Rate",
            value: cachedData.dividendRate + "x",
            name: "dividendRate",
            description: metricsData?.dividendRateDsc,
          },
        ];

        const updatedMetrics = await Promise.all(
          metricsWithDescriptions.map(async (metric) => {
            let description = metric.description || data[metric.name + "Dsc"];
            if (!description) {
              const a = await dsc(
                `Summarize ${metric.label} of ${cachedData.name} in less than 20 words without specifying numbers.`
              );
              data[metric.name + "Dsc"] = a;
              description = a;
            }

            return {
              ...metric,
              description,
            };
          })
        );

        // console.log(updatedMetrics);
        setKeyMetrics(updatedMetrics);
      } catch (error) {
        console.error("Error fetching key metrics:", error);
        setKeyMetrics([]);
      } finally {
        setLoadingStates((prev) => ({ ...prev, keyMetrics: false }));
      }
    }
  }, [cachedData, client]);

  const fetchFinancialHealth = useCallback(async () => {
    if (cachedData && client) {
      try {
        let { data: financialData, error } = await client
          .from("company")
          .select(
            "cashPosition,cashPositionDsc,totalDebt,totalDebtDsc,debtToEquity,debtToEquityDsc,currentRatio,currentRatioDsc"
          )
          .eq("name", `${userId}-${data.name}`)
          .single();

        if (!financialData) {
          const { data: defaultData, error } = await client
            .from("company")
            .select(
              "cashPosition,cashPositionDsc,totalDebt,totalDebtDsc,debtToEquity,debtToEquityDsc,currentRatio,currentRatioDsc"
            )
            .eq("name", data.name)
            .single();
          financialData = defaultData;
        }

        const financialsData = [
          {
            label: "Cash Position",
            value:
              "$" +
              roundAndConvert(
                financialData?.cashPosition || cachedData.cashPosition
              ),
            name: "cashPosition",
            description: financialData?.cashPositionDsc,
          },
          {
            label: "Total Debt",
            value:
              "$" +
              roundAndConvert(financialData?.totalDebt || cachedData.totalDebt),
            name: "totalDebt",
            description: financialData?.totalDebtDsc,
          },
          {
            label: "Debt to Equity",
            value:
              (financialData?.debtToEquity || cachedData.debtToEquity) + "x",
            name: "debtToEquity",
            description: financialData?.debtToEquityDsc,
          },
          {
            label: "Current Ratio",
            value:
              (financialData?.currentRatio || cachedData.currentRatio) + "x",
            name: "currentRatio",
            description: financialData?.currentRatioDsc,
          },
        ];

        const financialsWithDescriptions = await Promise.all(
          financialsData.map(async (item) => {
            let description = item.description;
            if (!description) {
              const a = await dsc(
                `summary of ${item.label} of ${cachedData.name} in 20-30 words without the numbers`
              );
              data[item.name + "Dsc"] = a;
              description = a;
            }

            return {
              ...item,
              description,
            };
          })
        );

        setFinancialHealth(financialsWithDescriptions);
      } catch (error) {
        console.error("Error fetching financial health data:", error);
        const financialsData = [
          {
            label: "Cash Position",
            name: "cashPosition",
            value: "$" + cachedData.cashPosition,
          },
          {
            label: "Total Debt",
            name: "totalDebt",
            value: "$" + cachedData.totalDebt,
          },
          {
            label: "Debt to Equity",
            name: "debtToEquity",
            value: cachedData.debtToEquity + "x",
          },
          {
            label: "Current Ratio",
            name: "currentRatio",
            value: cachedData.currentRatio + "x",
          },
        ];

        const financialsWithDescriptions = await Promise.all(
          financialsData.map(async (item) => {
            const description = await dsc(
              `summary of ${item.label} of ${cachedData.name} in 20-30 words without the numbers`
            );
            data[item.name + "Dsc"] = description;

            return {
              ...item,
              description,
            };
          })
        );

        setFinancialHealth(financialsWithDescriptions);
      } finally {
        setLoadingStates((prev) => ({ ...prev, financialHealth: false }));
      }
    }
  }, [cachedData, client]);

  const fetchStrengthsAndCatalysts = useCallback(async () => {
    if (cachedData && client) {
      try {
        let { data: strengthsData, error } = await client
          .from("company")
          .select("strengthsAndCatalysts")
          .eq("name", `${userId}-${data.name}`)
          .single();

        if (!strengthsData) {
          const { data: defaultData, error: defaultError } = await client
            .from("company")
            .select("strengthsAndCatalysts")
            .eq("name", data.name)
            .single();

          strengthsData = defaultData;
        }

        if (strengthsData && strengthsData.strengthsAndCatalysts) {
          setStrengthsAndCatalysts(
            parsePoints(strengthsData.strengthsAndCatalysts)
          );
        } else {
          const strengthsText = await dsc(
            `Give me growth catalysts of ${cachedData.name} stock, give me 6 points, with headings, and description not more than 40 words`
          );
          setStrengthsAndCatalysts(parsePoints(strengthsText));
        }
      } catch (error) {
        console.error("Error fetching strengths and catalysts:", error);
        const strengthsText = await dsc(
          `Give me growth catalysts of ${cachedData.name} stock, give me 6 points, with headings, and description not more than 40 words`
        );
        setStrengthsAndCatalysts(parsePoints(strengthsText));
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          strengthsAndCatalysts: false,
        }));
      }
    }
  }, [cachedData, client, data.name, userId]);

  const fetchAnalystHealth = useCallback(async () => {
    if (cachedData && client) {
      try {
        let { data: analystData, error } = await client
          .from("company")
          .select(
            "analystRating,analystRatingDsc,numberOfAnalysts,numberOfAnalystsDsc,meanTargetPrice,meanTargetPriceDsc,impliedChange,impliedChangeDsc"
          )
          .eq("name", `${userId}-${data.name}`)
          .single();

        if (!analystData) {
          const { data: defaultData, error } = await client
            .from("company")
            .select(
              "analystRating,analystRatingDsc,numberOfAnalysts,numberOfAnalystsDsc,meanTargetPrice,meanTargetPriceDsc,impliedChange,impliedChangeDsc"
            )
            .eq("name", data.name)
            .single();

          analystData = defaultData;
        }

        console.log(cachedData.impliedChange);
        const analystInfo = [
          {
            label: "Analyst Rating (1-5)",
            value: analystData?.analystRating || cachedData.analystRating,
            name: "analystRating",
            description: analystData?.analystRatingDsc,
          },
          {
            label: "Number of Analysts",
            value: analystData?.numberOfAnalysts || cachedData.numberOfAnalysts,
            name: "numberOfAnalysts",
            description: analystData?.numberOfAnalystsDsc,
          },
          {
            label: "Mean Target Price",
            value:
              "$" +
              roundAndConvert(
                analystData?.meanTargetPrice || cachedData.meanTargetPrice
              ),
            name: "meanTargetPrice",
            description: analystData?.meanTargetPriceDsc,
          },
          {
            label: "Implied +/-",
            value: roundAndConvert(
              analystData?.impliedChange || cachedData.impliedChange
            ),
            name: "impliedChange",
            description: analystData?.impliedChangeDsc,
          },
        ];

        const analystDataWithDescriptions = await Promise.all(
          analystInfo.map(async (item) => {
            let description = item.description;
            if (!description) {
              const a = await dsc(
                `summary of ${item.label} of ${cachedData.name} in 20-30 words without the numbers`
              );
              data[item.name + "Dsc"] = a;
              description = a;
            }

            return {
              ...item,
              description,
            };
          })
        );
        setAnalystHealth(analystDataWithDescriptions);
      } catch (error) {
        console.error("Error fetching analyst health:", error);
        setAnalystHealth([]);
      } finally {
        setLoadingStates((prev) => ({ ...prev, analystHealth: false }));
      }
    }
  }, [cachedData, client]);

  const fetchRisksAndMitigations = useCallback(async () => {
    if (cachedData && client) {
      try {
        let { data: risksData, error } = await client
          .from("company")
          .select("risksAndMitigation")
          .eq("name", `${userId}-${data.name}`)
          .single();

        if (!risksData) {
          const { data: defaultData, error: defaultError } = await client
            .from("company")
            .select("risksAndMitigation")
            .eq("name", data.name)
            .single();

          risksData = defaultData;
        }

        if (risksData && risksData.risksAndMitigation) {
          const parsedRisks = parseRisksAndMitigations(
            risksData.risksAndMitigation
          );
          setRisksAndMitigations(parsedRisks);
          setEditedVals((prev) => ({
            ...prev,
            risksAndMitigation: parsePointsToString(parsedRisks),
          }));
        } else {
          const risksText = await dsc(
            `Give me 6 Risks with explanation and also their mitigations respectively of ${cachedData.name} stock with headings and description of not more than 20 words for each`
          );
          const parsedRisks = parseRisksAndMitigations(risksText);
          setRisksAndMitigations(parsedRisks);
          setEditedVals((prev) => ({
            ...prev,
            risksAndMitigation: parsePointsToString(parsedRisks),
          }));
        }
      } catch (error) {
        console.error("Error fetching risks and mitigations:", error);
        const risksText = await dsc(
          `Give me 6 Risks with explanation and also their mitigations respectively of ${cachedData.name} stock with headings and description of not more than 20 words for each`
        );
        setRisksAndMitigations(parseRisksAndMitigations(risksText));
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          risksAndMitigations: false,
        }));
      }
    }
  }, [cachedData, client, data.name, userId]);

  const fetchConclusion = useCallback(async () => {
    const promptData = {
      ...cachedData,
      url1: "",
      url2: "",
    };

    if (cachedData && client) {
      try {
        let { data: conclusionData, error } = await client
          .from("company")
          .select("conclusion")
          .eq("name", `${userId}-${data.name}`)
          .single();

        if (!conclusionData) {
          const { data: defaultData, error } = await client
            .from("company")
            .select("conclusion")
            .eq("name", data.name)
            .single();

          conclusionData = defaultData;
        }

        if (conclusionData && conclusionData.conclusion) {
          setConclusion(conclusionData.conclusion);
          setImageSrc2(
            data.url2 ||
              "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          );
        } else {
          const conclusionText = await dsc(
            `With this info ${JSON.stringify(
              promptData
            )} give a 70-100 words conclusion which include should we buy it or not?.`
          );
          setConclusion(conclusionText);
          setImageSrc2(
            data.url2 ||
              "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          );
        }
      } catch (error) {
        console.error("Error fetching conclusion:", error);
        const conclusionText = await dsc(
          `With this info ${JSON.stringify(
            promptData
          )} give a 70-100 words conclusion which include should we buy it or not?.`
        );
        setConclusion(conclusionText);
        setImageSrc2(
          data.url2 ||
            "https://images.unsplash.com/photo-1456930266018-fda42f7404a7?q=80&w=1595&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        );
      } finally {
        setLoadingStates((prev) => ({ ...prev, conclusion: false }));
      }
    }
  }, [cachedData, client, data.url2]);

  const fetchHistory = useCallback(async () => {
    if (client && cachedData && !history) {
      try {
        setLoadingStates((prev) => ({ ...prev, history: true }));

        const { data: row, error } = await client
          .from("company")
          .select(
            `
            revenue24,
            ebit24,
            netProfit24,
            ebitda24,
            roi24,
            revenue22,
            ebit22,
            netProfit22,
            ebitda22,
            roi22,
            revenue23,
            ebit23,
            netProfit23,
            ebitda23,
            roi23,
            revenue21,
            ebit21,
            netProfit21,
            ebitda21,
            roi21,
            oneYrDsc`
          )
          .eq("ticker", id)
          .single();

        const response = await fetch(`/api/financial?ticker=${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const hD: StockHistory = await response.json();

        const obj: StockHistory = {
          name: cachedData.name,
          ticker: cachedData.ticker,
          revenue24: row?.revenue24 || hD.revenue24 || "N/A",
          ebit24: row?.ebit24 || hD.ebit24 || "N/A",
          netProfit24: row?.netProfit24 || hD.netProfit24 || "N/A",
          ebitda24: row?.ebitda24 || hD.ebitda24 || "N/A",
          roi24: row?.roi24 || hD.roi24 || "N/A",
          revenue22: row?.revenue22 || hD.revenue22 || "N/A",
          ebit22: row?.ebit22 || hD.ebit22 || "N/A",
          netProfit22: row?.netProfit22 || hD.netProfit22 || "N/A",
          ebitda22: row?.ebitda22 || hD.ebitda22 || "N/A",
          roi22: row?.roi22 || hD.roi22 || "N/A",
          revenue23: row?.revenue23 || hD.revenue23 || "N/A",
          ebit23: row?.ebit23 || hD.ebit23 || "N/A",
          netProfit23: row?.netProfit23 || hD.netProfit23 || "N/A",
          ebitda23: row?.ebitda23 || hD.ebitda23 || "N/A",
          roi23: row?.roi23 || hD.roi23 || "N/A",
          revenue21: row?.revenue21 || hD.revenue21 || "N/A",
          ebit21: row?.ebit21 || hD.ebit21 || "N/A",
          netProfit21: row?.netProfit21 || hD.netProfit21 || "N/A",
          ebitda21: row?.ebitda21 || hD.ebitda21 || "N/A",
          roi21: row?.roi21 || hD.roi21 || "N/A",
          dsc: row?.oneYrDsc || (await getOneYrDsc(cachedData.name)),
        };

        setHistory(obj);
        console.log(obj);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, history: false }));
      }
    }
  }, [cachedData, client, id, history]);

  const getOneYrDsc = async (name: string) => {
    const des = await dsc(
      `Give 2024 stock price summary of ${name} in 40 words`
    );
    setDataSave((prev) => ({ ...prev, oneYrDsc: des }));
    return des;
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function saveEditedContent() {
    setIsSaving(true);
    try {
      console.log(editedVals);

      const updatedData: TableType = {
        ...dataSave,
        ...editedVals,
        ticker: id,
        oneYrDsc: editedVals?.oneYrDsc || history?.dsc || "",
        strengthsAndCatalysts:
          editedVals?.strengthsAndCatalysts ||
          parsePointsToString(strengthsAndCatalysts),
        risksAndMitigation:
          editedVals?.risksAndMitigation ||
          parsePointsToString(risksAndMitigations),
        conclusion: editedVals?.conclusion || conclusion,
        description: editedVals?.description || companyDescription,
      };

      if (client) {
        console.log("Saving updated data:", updatedData);
        const { data: serverData, error } = await client
          .from("company")
          .upsert(updatedData)
          .select();

        if (error) {
          throw error;
        }

        console.log("Server response:", serverData);
        setCachedData(updatedData);
        setDataSave(updatedData);
        setEditedVals({}); // Clear editedVals after successful save
      } else {
        throw new Error("Supabase client is not initialized");
      }
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function savePointsStgh(
    section: string,
    content: string
  ): Promise<void> {
    setIsSaving(true);
    try {
      if (client) {
        const arr = section.split("-");
        const col = arr[0];
        const type = arr[1];
        const index = arr[2];

        const { data: oldData, error } = await client
          .from("company")
          .select("strengthsAndCatalysts")
          .eq("name", data.name)
          .single();

        const oldVal = oldData?.strengthsAndCatalysts;
        let newVal: string;

        if (type === "title") {
          newVal =
            oldVal.slice(0, oldVal.indexOf(index) + 2) +
            content +
            oldVal.slice(oldVal.indexOf(":", oldVal.indexOf(index) + 2));
        } else if (type === "description") {
          if (Number(index) < 6) {
            newVal =
              oldVal.slice(
                0,
                oldVal.indexOf(":", oldVal.indexOf(index) + 2) + 1
              ) +
              content +
              oldVal.slice(oldVal.indexOf((Number(index) + 1).toString()) - 1);
          } else {
            newVal =
              oldVal.slice(
                0,
                oldVal.indexOf(":", oldVal.indexOf(index) + 2) + 1
              ) + content;
          }
        }

        console.log(oldVal, col);
        console.log(newVal);
        const updatedData = {
          ...data,
          ticker: id,
          [col]: newVal,
        };

        if (client) {
          const { data: serverData, error } = await client
            .from("company")
            .upsert(updatedData)
            .eq("name", data.name)
            .select();

          if (error) {
            throw error;
          }

          setCachedData(updatedData);
        }
      }
    } catch (error) {
      console.error("Error saving points:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function savePointsRsk(
    section: string,
    content: string
  ): Promise<void> {
    setIsSaving(true);
    try {
      if (client) {
        const arr = section.split("-");
        const col = arr[0];
        const type = arr[1];
        const index = arr[2];

        const updatedRisks = risksAndMitigations.map((risk, i) => {
          if (i === Number(index) - 1) {
            return { ...risk, [type]: content };
          }
          return risk;
        });

        const newVal = parsePointsToString(updatedRisks);

        setRisksAndMitigations(updatedRisks);
        setEditedVals((prev) => ({ ...prev, risksAndMitigation: newVal }));

        if (client) {
          const { data: serverData, error } = await client
            .from("company")
            .update({ risksAndMitigation: newVal })
            .eq("name", data.name)
            .select();

          if (error) {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Error saving points:", error);
    } finally {
      setIsSaving(false);
    }
  }

  // const defaultSave = async () => {
  //   if (client) {
  //     const { data: prev, error } = await client
  //       .from("company")
  //       .select("*")
  //       .eq("ticker", id)
  //       .single();

  //     if (
  //       !prev &&
  //       companyDescription &&
  //       conclusion &&
  //       strengthsAndCatalysts &&
  //       risksAndMitigations
  //     ) {
  //       const defaultData = {
  //         ...data,
  //         ticker: id,
  //         strengthsAndCatalysts: parsePointsToString(strengthsAndCatalysts),
  //         risksAndMitigation: parsePointsToString(risksAndMitigations),
  //         description: companyDescription,
  //         conclusion: conclusion,
  //       };
  //       console.log(defaultData);
  //       const res = await client?.from("company").insert(defaultData).select();
  //       console.log(res);
  //     }
  //   }
  // };

  const dsc = useCallback(
    async (_prompt: string) => {
      if (calls < 30) {
        const data = { prompt: _prompt };
        try {
          const res = await fetch("/api/prompt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          const response = await res.text();
          const obj = JSON.parse(response);
          setCalls((prevCalls) => prevCalls + 1);
          return obj.response;
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    },
    [calls]
  );

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

  useEffect(() => {
    console.log("editedVals updated:", editedVals);
  }, [editedVals]);

  useEffect(() => {
    console.log("editedVals updated:", editedVals);
  }, [editedVals]);

  if (!cachedData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-0 p-0">
      {isSaving && <LoadingOverlay />}
      <ShareButton userId={userId} id={id} />
      <Refresh
        onClick={async () => {
          if (client) {
            const { error } = await client
              .from("company")
              .delete()
              .eq("name", data.name);
            console.log(error);
          }

          router.refresh();
          setCachedData(null);
        }}
      />

      <div className="absolute right-0 top-0 -mt-8">
        <SaveButton onClick={saveEditedContent} />
      </div>

      <div className="h-full flex flex-col gap-10 p-10 items-center justify-center bg-slate-900">
        {loadingStates.companyOverview ? (
          <LoadingCard />
        ) : (
          <CompanyOverview
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            setEditedVals={setEditedVals}
            editedVals={editedVals}
            saveEditedContent={saveEditedContent}
            name={cachedData?.name || ""}
            description={companyDescription}
            imageSrc={imageSrc}
          />
        )}
        {loadingStates.history ? (
          <LoadingCard />
        ) : (
          <FinancialSnapshot
            ticker={id}
            count={count}
            setCount={setCount}
            cacheData={history}
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            setEditedVals={setEditedVals}
            saveEditedContent={saveEditedContent}
          />
        )}
        {loadingStates.keyMetrics ? (
          <LoadingCard />
        ) : (
          <KeyMetrics
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            setEditedVals={setEditedVals}
            editedVals={editedVals}
            saveEditedContent={saveEditedContent}
            metrics={keyMetrics}
          />
        )}
        {loadingStates.financialHealth ? (
          <LoadingCard />
        ) : (
          <FinancialHealth
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            setEditedVals={setEditedVals}
            editedVals={editedVals}
            saveEditedContent={saveEditedContent}
            financials={financialHealth}
          />
        )}
        {loadingStates.strengthsAndCatalysts ? (
          <LoadingCard />
        ) : (
          <StrengthsAndCatalysts
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            savePoints={savePointsStgh}
            strengths={strengthsAndCatalysts}
          />
        )}
        {loadingStates.analystHealth ? (
          <LoadingCard />
        ) : (
          <AnalystHealth
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            setEditedVals={setEditedVals}
            editedVals={editedVals}
            saveEditedContent={saveEditedContent}
            analystData={analystHealth}
            nOA={data.numberOfAnalysts}
          />
        )}
        {loadingStates.risksAndMitigations ? (
          <LoadingCard />
        ) : (
          <RisksAnalysis
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            savePoints={savePointsRsk}
            points={risksAndMitigations}
          />
        )}
        {loadingStates.conclusion ? (
          <LoadingCard />
        ) : (
          <Conclusion
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            setEditedVals={setEditedVals}
            editedVals={editedVals}
            saveEditedContent={saveEditedContent}
            description={conclusion}
            imageSrc={imageSrc2}
            rec={data.recommendation}
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
  saveEditedContent,
  setEditedVals,
  editedVals,
  hasChanged,
  setHasChanged,
}: {
  name: string;
  description: string;
  imageSrc: string;
  saveEditedContent: () => void;
  editedVals: EditedValType;
  setEditedVals: Dispatch<SetStateAction<EditedValType>>;
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-2xl shadow-cyan-400 text-white border-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <CardHeader className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 justify-center">
          <CardTitle className="barlow-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl pb-3 font-bold text-center lg:text-left">
            <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
              {extractName(name)}
            </span>
          </CardTitle>
          <EditableText
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            initialText={description}
            onSave={(newText) => {
              setEditedVals((prev) => ({ ...prev, description: newText }));
            }}
            className="montserrat text-sm sm:text-base md:text-lg lg:text-xl text-white"
          />
          <div className="mt-4 sm:mt-6 md:mt-10 md:pt-5 flex items-center">
            <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-10 md:w-10 lg:h-10 lg:w-10 bg-white rounded-full overflow-hidden">
              <img
                className="object-cover w-full h-full"
                src="data:image/jpeg;base64,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"
                alt="Adrian Saville"
              />
            </div>
            <h1 className="montserrat text-lg sm:text-xl md:text-xl lg:text-xl ml-3">
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
  hasChanged,
  setHasChanged,
  metrics,
  saveEditedContent,
  setEditedVals,
  editedVals,
}: {
  metrics: Array<{
    label: string;
    value: string | number;
    description: string;
    name: string;
  }>;
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
  saveEditedContent: () => void;
  editedVals: EditedValType;
  setEditedVals: Dispatch<SetStateAction<EditedValType>>;
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
              <EditableText
                hasChanged={hasChanged}
                setHasChanged={setHasChanged}
                initialText={metric.value.toString()}
                onSave={(newText) => {
                  setEditedVals((prev) => ({
                    ...prev,
                    [metric.name]: newText,
                  }));
                }}
                className="text-lg sm:text-xl font-bold"
              />
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
              <EditableText
                hasChanged={hasChanged}
                setHasChanged={setHasChanged}
                initialText={metric.description}
                onSave={(newText) => {
                  setEditedVals((prev) => ({
                    ...prev,
                    [metric.name + "Dsc"]: newText,
                  }));
                }}
                className="text-sm sm:text-base mt-2 text-gray-400"
              />
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

function FinancialHealth({
  hasChanged,
  setHasChanged,
  financials,
  saveEditedContent,
  setEditedVals,
  editedVals,
}: {
  financials: Array<{
    label: string;
    value: string | number;
    description: string;
    name: string;
  }>;
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
  saveEditedContent: () => void;
  editedVals: EditedValType;
  setEditedVals: Dispatch<SetStateAction<EditedValType>>;
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
              <EditableText
                hasChanged={hasChanged}
                setHasChanged={setHasChanged}
                initialText={item.value.toString()}
                onSave={(newText) => {
                  setEditedVals((prev) => ({ ...prev, [item.name]: newText }));
                }}
                className="text-lg sm:text-xl font-bold"
              />
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
              <EditableText
                hasChanged={hasChanged}
                setHasChanged={setHasChanged}
                initialText={item.description}
                onSave={(newText) => {
                  setEditedVals((prev) => ({
                    ...prev,
                    [item.name + "Dsc"]: newText,
                  }));
                }}
                className="text-sm sm:text-base mt-2 text-gray-400"
              />
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

function StrengthsAndCatalysts({
  hasChanged,
  setHasChanged,
  strengths,
  savePoints,
}: {
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
  strengths: Strength[];
  savePoints: (a: string, b: string) => Promise<void>;
}) {
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
                      <EditableText
                        hasChanged={hasChanged}
                        setHasChanged={setHasChanged}
                        initialText={strength.title}
                        onSave={(newText) =>
                          savePoints(
                            `strengthsAndCatalysts-title-${index + 1}`,
                            newText
                          )
                        }
                        className="text-base sm:text-lg font-semibold text-white"
                      />
                    </CardTitle>
                  </div>
                  <EditableText
                    hasChanged={hasChanged}
                    setHasChanged={setHasChanged}
                    initialText={strength.description}
                    onSave={(newText) =>
                      savePoints(
                        `strengthsAndCatalysts-description-${index + 1}`,
                        newText
                      )
                    }
                    className="text-base text-gray-300 mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

function FinancialSnapshot({
  ticker,
  cacheData,
  hasChanged,
  setHasChanged,
  setEditedVals,
  count,
  setCount,
}: {
  ticker: string;
  cacheData: StockHistory | undefined;
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
  saveEditedContent: () => void;
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
  setEditedVals: Dispatch<SetStateAction<EditedValType>>;
}) {
  console.log("balle" + ticker);
  const financialData = [
    {
      year: 2024,
      revenue: cacheData?.revenue24,
      ebit: cacheData?.ebit24,
      netProfit: cacheData?.netProfit24,
      ebiTda: cacheData?.ebitda24,
      roi: cacheData?.roi24,
    },
    {
      year: 2023,
      revenue: cacheData?.revenue23,
      ebit: cacheData?.ebit23,
      netProfit: cacheData?.netProfit23,
      ebiTda: cacheData?.ebitda23,
      roi: cacheData?.roi23,
    },
    {
      year: 2022,
      revenue: cacheData?.revenue22,
      ebit: cacheData?.ebit22,
      netProfit: cacheData?.netProfit22,
      ebiTda: cacheData?.ebitda22,
      roi: cacheData?.roi22,
    },
    {
      year: 2021,
      revenue: cacheData?.revenue21,
      ebit: cacheData?.ebit21,
      netProfit: cacheData?.netProfit21,
      ebiTda: cacheData?.ebitda21,
      roi: cacheData?.roi21,
    },
  ];

  let data = cacheData?.dsc;
  console.log(cacheData);
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 md:p-8">
        <CardTitle className="barlow-bold text-2xl sm:text-3xl font-bold text-center">
          <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
            Financial Snapshot: Stock's Performance
          </span>
        </CardTitle>

        <div className="grid pt-5 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="barlow-bold text-xl sm:text-xl font-bold text-center">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
                1-Year Stock Price
              </span>
            </h2>
            <EditableText
              id={ticker}
              count={count}
              setCount={setCount}
              hasChanged={hasChanged}
              setHasChanged={setHasChanged}
              initialText={cacheData?.dsc}
              onSave={(newText) => {
                setEditedVals((prev) => ({
                  ...prev,
                  oneYrDsc: newText,
                }));
              }}
              className=""
            />
          </div>

          <div className="space-y-4">
            <h2 className="barlow-bold text-xl sm:text-xl font-bold text-center">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
                4-Year Financials
              </span>
            </h2>
            <div className="rounded-lg overflow-x-scroll">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-gray-100 p-2">Year</th>
                    <th className="text-gray-100 p-2">Revenue ($B)</th>
                    <th className="text-gray-100 p-2">EBITDA ($B)</th>
                    <th className="text-gray-100 p-2">EBIT ($B)</th>
                    <th className="text-gray-100 p-2">Net Profit</th>

                    <th className="text-gray-100 p-2">ROI (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.map((row) => (
                    <tr key={row.year} className="border-zinc-800">
                      <td className="text-gray-100 text-center p-2">
                        {row.year.toString()}
                      </td>
                      <td className="text-gray-100 p-2">
                        <EditableText
                          hasChanged={hasChanged}
                          setHasChanged={setHasChanged}
                          initialText={row.revenue}
                          onSave={(newText) => {
                            setEditedVals((prev) => ({
                              ...prev,
                              [`revenue${row.year.toString().slice(2)}`]:
                                newText,
                            }));
                          }}
                          className="text-center"
                        />
                      </td>
                      <td className="text-gray-100 p-2">
                        <EditableText
                          hasChanged={hasChanged}
                          setHasChanged={setHasChanged}
                          initialText={row.ebiTda}
                          onSave={(newText) => {
                            setEditedVals((prev) => ({
                              ...prev,
                              [`ebiTda${row.year.toString().slice(2)}`]:
                                newText,
                            }));
                          }}
                          className="text-center"
                        />
                      </td>
                      <td className="text-gray-100 p-2">
                        <EditableText
                          hasChanged={hasChanged}
                          setHasChanged={setHasChanged}
                          initialText={row.ebit}
                          onSave={(newText) => {
                            setEditedVals((prev) => ({
                              ...prev,
                              [`revenue${row.year.toString().slice(2)}`]:
                                newText,
                            }));
                          }}
                          className="text-center"
                        />
                      </td>
                      <td className="text-gray-100 p-2">
                        <EditableText
                          hasChanged={hasChanged}
                          setHasChanged={setHasChanged}
                          initialText={row.netProfit}
                          onSave={(newText) => {
                            setEditedVals((prev) => ({
                              ...prev,
                              [`netProfit${row.year.toString().slice(2)}`]:
                                newText,
                            }));
                          }}
                          className="text-center"
                        />
                      </td>

                      <td className="text-gray-100 p-2">
                        <EditableText
                          hasChanged={hasChanged}
                          setHasChanged={setHasChanged}
                          initialText={row.roi}
                          onSave={(newText) => {
                            setEditedVals((prev) => ({
                              ...prev,
                              [`roi${row.year.toString().slice(2)}`]: newText,
                            }));
                          }}
                          className="text-center"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function AnalystHealth({
  hasChanged,
  setHasChanged,
  analystData,
  saveEditedContent,
  setEditedVals,
  editedVals,
  nOA,
}: {
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
  analystData: Array<{
    label: string;
    value: string | number;
    description: string;
    name: string;
  }>;
  saveEditedContent: () => void;
  setEditedVals: Dispatch<SetStateAction<EditedValType>>;
  editedVals: EditedValType;
  nOA: number | string;
}) {
  return (
    <Card className="w-full max-w-[80vw] mx-auto bg-zinc-900 shadow-lg sm:shadow-xl md:shadow-2xl shadow-cyan-400/20 sm:shadow-cyan-400/30 md:shadow-cyan-400/40 text-gray-100 border-0 overflow-hidden">
      <div className="flex flex-col">
        <div className="w-full h-[15vh] sm:h-[15vh] md:h-[20vh] relative overflow-hidden">
          <img
            className="object-cover object-bottom w-full h-full"
            src="https://images.pexels.com/photos/7239279/pexels-photo-7239279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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
                  <EditableText
                    hasChanged={hasChanged}
                    setHasChanged={setHasChanged}
                    initialText={item.value.toString()}
                    onSave={(newText) => {
                      setEditedVals((prev) => ({
                        ...prev,
                        [item.name]: newText,
                      }));
                    }}
                    className="text-base sm:text-lg md:text-xl font-bold"
                  />
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

                  <EditableText
                    hasChanged={hasChanged}
                    setHasChanged={setHasChanged}
                    initialText={item.description}
                    onSave={(newText) => {
                      setEditedVals((prev) => ({
                        ...prev,
                        [item.name + "Dsc"]: newText,
                      }));
                    }}
                    className="text-sm sm:text-base mt-2 text-gray-400"
                  />
                  {item.label === "Analyst Rating (1-5)" && (
                    <div className="flex justify-center items-center montserrat font-bold text-base mt-2">
                      <span className="mr-1">Number of analysts:</span>
                      <span>{nOA}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardHeader>
      </div>
    </Card>
  );
}

function RisksAnalysis({
  hasChanged,
  setHasChanged,
  points,
  savePoints,
}: {
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
  points: Strength[];
  savePoints: (a: string, b: string) => void;
}) {
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
                      <EditableText
                        hasChanged={hasChanged}
                        setHasChanged={setHasChanged}
                        initialText={point.title}
                        onSave={(newText) =>
                          savePoints(
                            `risksAndMitigation-${"title"}-${index + 1}`,
                            newText
                          )
                        }
                        className="text-base sm:text-lg font-semibold text-white"
                      />
                    </CardTitle>
                  </div>
                  <EditableText
                    hasChanged={hasChanged}
                    setHasChanged={setHasChanged}
                    initialText={point.description}
                    onSave={(newText) =>
                      savePoints(
                        `risksAndMitigation-${"description"}-${index + 1}`,
                        newText
                      )
                    }
                    className="text-base text-gray-300 mt-2"
                  />
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
  hasChanged,
  setHasChanged,
  imageSrc,
  saveEditedContent,
  rec,
  setEditedVals,
  editedVals,
}: {
  description: string;
  imageSrc: string;
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
  saveEditedContent: () => void;
  editedVals: EditedValType;
  setEditedVals: Dispatch<SetStateAction<EditedValType>>;
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
          <EditableText
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            initialText={description}
            onSave={(newText) => {
              setEditedVals({ ...editedVals, conclusion: newText });
            }}
            className="montserrat text-base sm:text-lg lg:text-xl text-center text-white"
          />
          <div className="flex flex-col sm:flex-row items-center mt-4 gap-2">
            <span className=" text-white barlow text-xl lg:text-2xl">
              Recommendation:
            </span>
            <EditableText
              hasChanged={hasChanged}
              setHasChanged={setHasChanged}
              initialText={rec}
              onSave={(newText) => {
                setEditedVals({ ...editedVals, recommendation: newText });
              }}
              className="barlow-bold text-lg sm:text-xl lg:text-2xl"
            />
          </div>
        </CardHeader>
      </div>
    </Card>
  );
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
        <Loader2 className="w-16 h-16 text-blue-500" />
      </CardContent>
    </Card>
  );
}

export function ShareButton({ id, userId }: { id: string; userId: string }) {
  const [isToastVisible, setIsToastVisible] = useState(false);

  const toggleToast = () => {
    setIsToastVisible(!isToastVisible);
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      <button
        className="text-white transition-all duration-300 hover:scale-110 active:scale-90 bg-black p-4 rounded-full shadow-md shadow-cyan-400"
        onClick={toggleToast}
        aria-label="Share"
      >
        <Share className="text-white w-6 h-6" />
      </button>
      {isToastVisible && (
        <Toast viewLink={`https://stock-gen.vercel.app/viewOnlyPpt/${id}`} />
      )}
    </div>
  );
}

export function Toast({ viewLink }: { viewLink: string }) {
  const [viewCopied, setViewCopied] = useState(false);
  const [editableCopied, setEditableCopied] = useState(false);
  const viewLinkRef = useRef<HTMLParagraphElement>(null);
  const editableLinkRef = useRef<HTMLParagraphElement>(null);

  const copyToClipboard = async (
    text: string,
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="z-[100] absolute top-16 right-0 bg-slate-800 text-white p-4 rounded-lg shadow-lg w-72">
      <h3 className="text-2xl font-semibold mb-3">Share Links</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-slate-700 rounded p-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Link className="w-4 h-4 flex-shrink-0" />
            <p ref={viewLinkRef} className="truncate text-sm">
              {viewLink}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(viewLink, setViewCopied)}
            className="ml-2 p-1 hover:bg-slate-600 rounded transition-colors duration-200"
            aria-label="Copy view link"
          >
            {viewCopied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
        <Loader2 className="text-blue-500" />
        <span className="text-gray-800">Saving...</span>
      </div>
    </div>
  );
}
function roundAndConvert(input: string) {
  const regex = /^-?([\d.]+)([%a-zA-Z]*)$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error("Invalid input format");
  }

  const numberPart = Number.parseFloat(match[1]);
  const unit = match[2];

  const roundedNumber = Math.round(numberPart * 10) / 10;

  if (unit) {
    return `${roundedNumber}${unit}`;
  }

  return `${roundedNumber}`;
}

function parsePointsToString(obj: Strength[]) {
  let str = "";

  obj.map((val, i) => {
    const s =
      (i + 1).toString() + ". " + val.title + ": " + val.description + "\n";
    str += s;
  });

  return str;
}

function extractName(input: string) {
  if (!input) return "";
  const parts = input.split("-");
  return parts.length > 1 ? parts[1].trim() : input.trim();
}
