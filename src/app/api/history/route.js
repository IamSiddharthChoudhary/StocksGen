import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

function formatValue(value) {
  if (value === 0) return "0";
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(2) + "B";
  } else if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(2) + "M";
  } else {
    return value.toFixed(2);
  }
}

export async function POST(req) {
  try {
    const { symbol } = await req.json();

    if (!symbol) {
      return NextResponse.json(
        { error: "Stock symbol is required" },
        { status: 400 }
      );
    }

    const financials = await yahooFinance.quoteSummary(symbol, {
      modules: [
        "financialData",
        "incomeStatementHistory",
        "defaultKeyStatistics",
      ],
    });

    const incomeStatements =
      financials.incomeStatementHistory?.incomeStatementHistory || [];
    const financialData = financials.financialData || {};
    const keyStats = financials.defaultKeyStatistics || {};

    if (incomeStatements.length === 0) {
      return NextResponse.json(
        { error: "Financial data not available" },
        { status: 404 }
      );
    }

    const name = keyStats.longName || "N/A";

    const years = [2023, 2022, 2021, 2024];
    const stockData = {
      name,
      ticker: symbol,
    };

    for (const year of years) {
      const statement = incomeStatements.find(
        (entry) => new Date(entry.endDate).getFullYear() === year
      );

      if (statement) {
        const yearSuffix = year.toString().slice(2);
        stockData[`revenue${yearSuffix}`] = formatValue(
          statement.totalRevenue || 0
        );
        stockData[`ebit${yearSuffix}`] = formatValue(
          (statement.totalRevenue || 0) -
            (statement.totalOperatingExpenses || 0)
        );
        stockData[`netProfit${yearSuffix}`] = formatValue(
          statement.netIncome || 0
        );
        stockData[`ebitda${yearSuffix}`] = formatValue(
          financialData.ebitda || 0
        );
        stockData[`roi${yearSuffix}`] =
          ((financialData.returnOnEquity || 0) * 100).toFixed(2) + "%";
      }
    }

    Object.keys(stockData).forEach((key) => {
      if (stockData[key] === undefined) {
        stockData[key] = "N/A";
      }
    });

    return NextResponse.json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
