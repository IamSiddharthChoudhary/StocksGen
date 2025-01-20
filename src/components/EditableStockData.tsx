"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  SetStateAction,
  Dispatch,
} from "react";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  EditedValType,
  StockData,
  TableType,
} from "../app/types/StockData";
import { Check, Code, Copy, Link, Share } from "lucide-react";
import { EditableText } from "./editableTest";
import { SupabaseClient } from "@supabase/supabase-js";
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
  const [dataSave, setDataSave] = useState<TableType>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [cachedData, setCachedData] = useState<TableType | null>(null);
  const [editedVals, setEditedVals] = useState<EditedValType>({});
  const [companyDescription, setCompanyDescription] = useState<string>("");
  const [hasChanged, setHasChanged] = useState(false);
  const [dividendRate, setDividentRate] = useState("");
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
  });

  useEffect(() => {
    setClient(createSupabaseClient());
  }, []);

  useEffect(() => {
    defaultSave();
  }, [conclusion, data, id, client, companyDescription]);

  useEffect(() => {
    const divRate = await fetch(
      `https://api.nasdaq.com/api/quote/${id}/dividends?assetclass=stocks`
    );

    if (!cachedData) {
      setCachedData(data);
    }
  }, [data, cachedData]);

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
          setRisksAndMitigations(
            parseRisksAndMitigations(risksData.risksAndMitigation)
          );
        } else {
          const risksText = await dsc(
            `Give me 6 Risks with explanation and also their mitigations respectively of ${cachedData.name} stock with headings and description of not more than 20 words for each`
          );
          setRisksAndMitigations(parseRisksAndMitigations(risksText));
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

  async function saveEditedContent() {
    setIsSaving(true);
    try {
      console.log(editedVals.description);
      const updatedData: TableType = {
        ...dataSave,
        ...editedVals,
        ticker: id,
        conclusion: editedVals?.conclusion || conclusion,
        description: editedVals?.description || companyDescription,
        name: `${userId}-${data.name}`,
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

        const { data: oldData, error } = await client
          .from("company")
          .select("risksAndMitigation")
          .eq("name", data.name)
          .single();

        console.log(oldData);
        const oldVal = oldData?.risksAndMitigation;
        console.log(oldVal, col);
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

        console.log(newVal);
        const updatedData = {
          ...data,
          ticker: id,
          risksAndMitigation: newVal,
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

  const defaultSave = async () => {
    if (client) {
      const { data: prev, error } = await client
        .from("company")
        .select("*")
        .eq("ticker", id)
        .single();

      if (
        !prev &&
        companyDescription &&
        conclusion &&
        strengthsAndCatalysts &&
        risksAndMitigations
      ) {
        const defaultData = {
          ...data,
          ticker: id,
          strengthsAndCatalysts: parsePointsToString(strengthsAndCatalysts),
          risksAndMitigation: parsePointsToString(risksAndMitigations),
          description: companyDescription,
          conclusion: conclusion,
        };
        console.log(defaultData);
        const res = await client?.from("company").insert(defaultData).select();
        console.log(res);
      }
    }
  };

  // async function savePoints(section: string, content: string): Promise<void> {
  //   setIsSaving(true);
  //   try {
  //     const [col, type, index] = section.split("-");

  //     const updatedData = {
  //       ...dataSave,
  //       [col]: updateNestedStructure(dataSave[col], index, type, content),
  //     };

  //     if (client) {
  //       const { data: serverData, error } = await client
  //         .from("company")
  //         .upsert({ ticker: id, ...updatedData })
  //         .select();

  //       if (error) {
  //         throw error;
  //       }
  //       setDataSave(updatedData);
  //     }
  //   } catch (error) {
  //     console.error("Error saving points:", error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // }
  // function updateNestedStructure(
  //   d: string,
  //   index: string,
  //   type: string,
  //   content: string
  // ): string {
  //   const lines = d.split("\n");
  //   const targetIndex = lines.findIndex((line) => line.startsWith(`${index}:`));

  //   if (targetIndex === -1) return d;

  //   if (type === "title") {
  //     lines[targetIndex] = `${index}: ${content}`;
  //   } else if (type === "description") {
  //     if (targetIndex + 1 < lines.length) {
  //       lines[targetIndex + 1] = content;
  //     }
  //   }

  //   return lines.join("\n");
  // }

  async function dsc(_prompt: string) {
    if (calls < 30) {
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
      setCalls(calls + 1);
      return obj.response;
    }
  }

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

  if (!cachedData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-0 p-0">
      {isSaving && <LoadingOverlay />}
      <ShareButton userId={userId} id={data.name} />
      <Refresh
        onClick={async () => {
          if (client) {
            const { error } = await client
              .from("company")
              .delete()
              .eq("name", "-" + data.name);
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
    <Card className="flex w-[80vw] h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-white border-0">
      <CardHeader className="flex-1 p-16 justify-center">
        <CardTitle className="barlow-bolds text-5xl pb-3 font-bold text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          {extractName(name)}
        </CardTitle>
        <EditableText
          hasChanged={hasChanged}
          setHasChanged={setHasChanged}
          initialText={description}
          onSave={(newText) => {
            setEditedVals((prev) => ({ ...prev, description: newText }));
          }}
          className="montserrat text-xl text-white"
        />
      </CardHeader>
      <CardHeader className="w-5/12 p-0 relative overflow-hidden items-center justify-center">
        <CardDescription className="text-center overflow-hidden h-full w-full text-gray-400">
          <img
            className="object-cover w-full h-full rounded-r-lg"
            src={imageSrc || "/placeholder.svg"}
            alt={`${name} visual representation`}
          />
        </CardDescription>
      </CardHeader>
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
                className="text-xl font-bold"
              />
              <p className="text-base font-semibold mt-2">{metric.label}</p>
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
                className="text-xs mt-2 text-gray-400"
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
              <EditableText
                hasChanged={hasChanged}
                setHasChanged={setHasChanged}
                initialText={item.value.toString()}
                onSave={(newText) => {
                  setEditedVals((prev) => ({ ...prev, [item.name]: newText }));
                }}
                className="text-xl font-bold"
              />
              <p className="text-base font-semibold mt-2">{item.label}</p>
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
                className="text-xs mt-2 text-gray-400"
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
                      className="text-lg font-semibold text-white"
                    />
                  </CardTitle>
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
                    className="text-sm text-gray-300 mt-2"
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

function AnalystHealth({
  hasChanged,
  setHasChanged,
  analystData,
  saveEditedContent,
  setEditedVals,
  editedVals,
}: {
  analystData: Array<{
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
              <EditableText
                hasChanged={hasChanged}
                setHasChanged={setHasChanged}
                initialText={item.value.toString()}
                onSave={(newText) => {
                  setEditedVals((prev) => ({ ...prev, [item.name]: newText }));
                }}
                className="text-xl font-bold"
              />
              <p className="text-base font-semibold mt-2">{item.label}</p>
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
                className="text-xs mt-2 text-gray-400"
              />
            </div>
          ))}
        </div>
      </CardHeader>
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
                    <EditableText
                      hasChanged={hasChanged}
                      setHasChanged={setHasChanged}
                      initialText={point.title}
                      onSave={(newText) =>
                        savePoints(
                          `risksAndMitigations-title-${index + 1}`,
                          newText
                        )
                      }
                      className="text-lg font-semibold text-white"
                    />
                  </CardTitle>
                  <EditableText
                    hasChanged={hasChanged}
                    setHasChanged={setHasChanged}
                    initialText={point.description}
                    onSave={(newText) =>
                      savePoints(
                        `risksAndMitigations-description-${index + 1}-risk`,
                        newText
                      )
                    }
                    className="text-sm text-gray-300 mt-2"
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
    <Card className="flex w-[80vw] h-[75vh] bg-zinc-900 shadow-2xl shadow-cyan-400 text-gray-100 border-0">
      <CardHeader className="w-1/3 p-0 relative overflow-hidden items-center justify-center">
        <CardDescription className="text-center overflow-hidden h-full w-full text-gray-400">
          <img
            className="object-cover h-full rounded-l-lg"
            src={imageSrc || "/placeholder.svg"}
          />
        </CardDescription>
      </CardHeader>
      <CardHeader className="flex-1 p-16 items-center justify-center">
        <CardTitle className="barlow-bold text-right text-4xl pb-3 font-bold text-white bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Conclusion
        </CardTitle>
        <EditableText
          hasChanged={hasChanged}
          setHasChanged={setHasChanged}
          initialText={description}
          onSave={(newText) => {
            setEditedVals({ ...editedVals, conclusion: newText });
          }}
          className="montserrat text-xl text-center text-white"
        />
        <div className="flex">
          <span className="font-bold text-white barlow-bold text-2xl">
            Recommendation:{" "}
          </span>
          <EditableText
            hasChanged={hasChanged}
            setHasChanged={setHasChanged}
            initialText={rec}
            onSave={(newText) => {
              setEditedVals({ ...editedVals, recommendation: newText });
            }}
            className="montserrat text-2xl"
          />
        </div>
      </CardHeader>
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
        <Toast
          viewLink={`https://stock-gen.vercel.app/viewOnlyPpt/${userId}/${id}`}
        />
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

  const numberPart = parseFloat(match[1]);
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
    let s =
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
