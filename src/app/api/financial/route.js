import { exec } from "child_process";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json(
      { error: "Ticker symbol is required" },
      { status: 400 }
    );
  }

  const scriptPath = path.join(
    process.cwd(),
    "src",
    "app",
    "scripts",
    "financial_table.py"
  );

  return new Promise((resolve) => {
    exec(`python3 "${scriptPath}" "${ticker}"`, (error, stdout, stderr) => {
      console.log("STDOUT:", stdout); // Log script output
      console.log("STDERR:", stderr); // Log errors, if any

      if (error) {
        console.error("Execution error:", error);
        return resolve(
          NextResponse.json(
            { error: stderr || "Failed to fetch financial data" },
            { status: 500 }
          )
        );
      }

      try {
        const trimmedOutput = stdout.trim();
        const data = JSON.parse(trimmedOutput);

        const historydata = {};

        for (let a in data) {
          for (let b in data[a]) {
            if (data[a][b].toString().indexOf("%") === -1) {
              if (b == "Net Profit") {
                historydata[`netProfit${a.slice(2)}`] = `${roundOffNumber(
                  data[a][b]
                )}`;
                continue;
              }
              historydata[
                `${b.toLowerCase()}${a.slice(2)}`
              ] = `${roundOffNumber(data[a][b])}`;
            } else
              historydata[`${b.toLowerCase()}${a.slice(2)}`] = `${data[a][b]}`;
          }
        }

        resolve(NextResponse.json(historydata, { status: 200 }));
      } catch (e) {
        console.error("JSON Parse Error:", e.message);
        console.error("Raw output:", stdout);
        resolve(
          NextResponse.json({ error: "Invalid JSON response" }, { status: 500 })
        );
      }
    });
  });
}

function roundOffNumber(num) {
  let rounded = Math.round((num / 1000) * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(1) : rounded;
}
