import pandas as pd
import yfinance as yf
import json
import sys

def fetch_financials(ticker):
    """
    Fetches income statement and balance sheet data for the given stock ticker.
    """
    try:
        stock = yf.Ticker(ticker)
        income_stmt = stock.financials
        balance_sheet = stock.balance_sheet
        return income_stmt, balance_sheet
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None, None

def create_financial_table(ticker, income_stmt, balance_sheet):
    """
    Processes financial data and returns it in JSON format.
    Filters data to include only 2021 and later.
    """
    try:
        if income_stmt is not None and not income_stmt.empty:
            financial_data = pd.DataFrame()

            def convert_to_millions(x):
                try:
                    return float(x) / 1_000_000
                except:
                    return float('nan')

            # Extract Revenue
            for label in ['Total Revenue', 'Revenue']:
                if label in income_stmt.index:
                    financial_data['Revenue'] = income_stmt.loc[label].apply(convert_to_millions)
                    break

            # Extract EBIT
            for label in ['Operating Income', 'EBIT']:
                if label in income_stmt.index:
                    financial_data['EBIT'] = income_stmt.loc[label].apply(convert_to_millions)
                    break

            # Extract Net Profit
            for label in ['Net Income', 'Net Income Common Stockholders']:
                if label in income_stmt.index:
                    financial_data['Net Profit'] = income_stmt.loc[label].apply(convert_to_millions)
                    break

            # Extract EBITDA
            try:
                ebit = income_stmt.loc['Operating Income']
                depreciation = income_stmt.loc.get('Depreciation & Amortization', income_stmt.loc.get('Depreciation And Amortization', None))

                if depreciation is not None:
                    financial_data['EBITDA'] = (ebit + depreciation).apply(convert_to_millions)
            except:
                if 'EBITDA' in income_stmt.index:
                    financial_data['EBITDA'] = income_stmt.loc['EBITDA'].apply(convert_to_millions)
                else:
                    financial_data['EBITDA'] = float('nan')

            # Calculate ROI
            try:
                net_profit = income_stmt.loc['Net Income']
                total_assets = balance_sheet.loc['Total Assets']
                roi = (net_profit / total_assets) * 100
                financial_data['ROI'] = roi.apply(lambda x: f"{x:.2f}%")
            except:
                financial_data['ROI'] = "N/A"

            # Formatting Output
            financial_data.index = financial_data.index.year

            # **Filter Data to Include Only 2021 & After**
            financial_data = financial_data[financial_data.index >= 2021]
            financial_data = financial_data.sort_index(ascending=False)

            # Convert to JSON format
            financial_json = financial_data.to_json(orient="index")

            return financial_json

    except Exception as e:
        print(f"Error creating financial table for {ticker}: {e}")
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python financial_table.py <TICKER>")
        sys.exit(1)

    ticker = sys.argv[1].strip().upper()
    income_stmt, balance_sheet = fetch_financials(ticker)
    
    if income_stmt is not None and balance_sheet is not None:
        financial_json = create_financial_table(ticker, income_stmt, balance_sheet)
      #  print(f"\nFinancial Data for {ticker}:")
        print(financial_json) 