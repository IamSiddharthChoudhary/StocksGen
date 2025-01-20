import yahooFinance from "yahoo-finance2";
import dotenv from "dotenv";
import { NextResponse } from "next/server";

dotenv.config();

const formatLargeNumber = (num) => {
  if (!num) return "N/A";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toString();
};

export async function POST(req) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json(
        { error: "Ticker symbol is required" },
        { status: 400 }
      );
    }

    const quoteSummary = await yahooFinance.quoteSummary(ticker, {
      modules: [
        "price",
        "summaryProfile",
        "financialData",
        "defaultKeyStatistics",
        "recommendationTrend",
        "summaryDetail",
      ],
    });

    const stockData = {
      name: quoteSummary.price?.longName || "N/A",
      desc: quoteSummary.summaryProfile?.longBusinessSummary || "N/A",
      marketCap: formatLargeNumber(quoteSummary.price?.marketCap),
      sharesOutstanding: formatLargeNumber(
        quoteSummary.defaultKeyStatistics?.sharesOutstanding
      ),
      float: formatLargeNumber(quoteSummary.defaultKeyStatistics?.floatShares),
      evEbitda:
        quoteSummary.defaultKeyStatistics?.enterpriseToEbitda?.toFixed(2) ||
        "N/A",
      peTtm: quoteSummary.summaryDetail?.trailingPE?.toFixed(2) || "N/A",
      dividendRate:
        quoteSummary.summaryDetail?.dividendRate?.toFixed(2) || "N/A",
      cashPosition: formatLargeNumber(quoteSummary.financialData?.totalCash),
      totalDebt: formatLargeNumber(quoteSummary.financialData?.totalDebt),
      debtToEquity:
        quoteSummary.financialData?.debtToEquity?.toFixed(2) || "N/A",
      currentRatio:
        quoteSummary.financialData?.currentRatio?.toFixed(2) || "N/A",
      stghsAndCat: "Requires manual input or additional API",
      analystRating:
        quoteSummary.financialData?.recommendationMean?.toFixed(2) || "N/A",
      numberOfAnalysts:
        quoteSummary.financialData?.numberOfAnalystOpinions?.toString() ||
        "N/A",
      meanTargetPrice:
        quoteSummary.financialData?.targetMeanPrice?.toFixed(2) || "N/A",
      impliedChange:
        quoteSummary.financialData?.targetMeanPrice &&
        quoteSummary.price?.regularMarketPrice
          ? (
              (quoteSummary.financialData.targetMeanPrice /
                quoteSummary.price.regularMarketPrice -
                1) *
              100
            ).toFixed(2) + "%"
          : "N/A",
      risksAndMitigation: "Requires manual input or additional API",
      recommendation:
        quoteSummary.recommendationTrend?.trend &&
        quoteSummary.recommendationTrend.trend[0]?.strongBuy &&
        quoteSummary.recommendationTrend.trend[0]?.sell
          ? quoteSummary.recommendationTrend.trend[0].strongBuy >
            quoteSummary.recommendationTrend.trend[0].sell
            ? "Buy"
            : "Sell"
          : "N/A",
    };

    return NextResponse.json(stockData, { status: 200 });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
