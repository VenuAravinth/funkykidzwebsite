// Body measurements for each size label used on products. These are standard Indian kidswear
// ranges — check them against your own garments and adjust before relying on them.
export type SizeChartRow = { size: string; age: string; heightCm: string; chestCm: string; waistCm: string };

export const KIDS_SIZE_CHART: SizeChartRow[] = [
  { size: "0-3M", age: "0–3 months", heightCm: "56–62", chestCm: "40–42", waistCm: "40–42" },
  { size: "3-6M", age: "3–6 months", heightCm: "62–68", chestCm: "42–44", waistCm: "42–44" },
  { size: "6-9M", age: "6–9 months", heightCm: "68–74", chestCm: "44–46", waistCm: "44–45" },
  { size: "9-12M", age: "9–12 months", heightCm: "74–80", chestCm: "46–47", waistCm: "45–46" },
  { size: "1-2Y", age: "1–2 years", heightCm: "80–92", chestCm: "47–50", waistCm: "46–48" },
  { size: "2-3Y", age: "2–3 years", heightCm: "92–98", chestCm: "50–52", waistCm: "48–50" },
  { size: "3-4Y", age: "3–4 years", heightCm: "98–104", chestCm: "52–54", waistCm: "50–51" },
  { size: "4-5Y", age: "4–5 years", heightCm: "104–110", chestCm: "54–56", waistCm: "51–52" },
  { size: "5-6Y", age: "5–6 years", heightCm: "110–116", chestCm: "56–58", waistCm: "52–53" },
  { size: "6-7Y", age: "6–7 years", heightCm: "116–122", chestCm: "58–61", waistCm: "53–55" },
  { size: "7-8Y", age: "7–8 years", heightCm: "122–128", chestCm: "61–64", waistCm: "55–57" },
  { size: "8-10Y", age: "8–10 years", heightCm: "128–140", chestCm: "64–70", waistCm: "57–60" },
  { size: "10-12Y", age: "10–12 years", heightCm: "140–152", chestCm: "70–76", waistCm: "60–63" },
  { size: "12-13Y", age: "12–13 years", heightCm: "152–158", chestCm: "76–80", waistCm: "63–65" },
  { size: "13-14Y", age: "13–14 years", heightCm: "158–164", chestCm: "80–84", waistCm: "65–67" },
  { size: "14-15Y", age: "14–15 years", heightCm: "164–170", chestCm: "84–88", waistCm: "67–70" },
];
