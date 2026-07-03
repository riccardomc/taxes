// Dutch tax rules for the 2026 tax year.
//
// Sources:
// - Box 1 / Box 2 brackets: https://www.belastingdienst.nl (boxen en tarieven)
// - Zelfstandigenaftrek / mkb-winstvrijstelling: https://www.belastingdienst.nl/.../veranderingen-inkomstenbelasting-2026
// - Vennootschapsbelasting / dividendbelasting: https://www.kvk.nl/geldzaken/belastingtarieven-2026/
//
// Update RATES_2026 when new tax-plan figures are published (typically each
// September on Prinsjesdag) — the calculation functions below should not
// need to change.

const RATES_2026 = {
  box1Brackets: [
    { upTo: 38883, rate: 0.3575 },
    { upTo: 78426, rate: 0.3756 },
    { upTo: Infinity, rate: 0.4950 },
  ],
  box2Brackets: [
    { upTo: 68843, rate: 0.245 },
    { upTo: Infinity, rate: 0.31 },
  ],
  corporationTaxBrackets: [
    { upTo: 200000, rate: 0.19 },
    { upTo: Infinity, rate: 0.258 },
  ],
  dividendWithholdingTaxRate: 0.15,
  zelfstandigenaftrek: 1200,
  // Starter's deduction on top of the zelfstandigenaftrek: usable up to 3
  // times within a business's first 5 years.
  startersaftrek: 2123,
  startersaftrekYearLimit: 3,
  mkbWinstvrijstellingRate: 0.1270,
};

// Applies a progressive bracket table to an amount and returns the tax due.
function applyBrackets(amount, brackets) {
  let tax = 0;
  let previousLimit = 0;
  for (const bracket of brackets) {
    if (amount <= previousLimit) break;
    const taxableInBracket = Math.min(amount, bracket.upTo) - previousLimit;
    tax += taxableInBracket * bracket.rate;
    previousLimit = bracket.upTo;
  }
  return tax;
}

function generateIncome(p) {
  return p.rate * p.days * p.months * p.hours * p.weeks;
}

function zelfstandigenaftrek(year, rates = RATES_2026) {
  const startUpDeduction = year < rates.startersaftrekYearLimit + 1 ? rates.startersaftrek : 0;
  return rates.zelfstandigenaftrek + startUpDeduction;
}

function mkbWinstvrijstelling(amount, rates = RATES_2026) {
  return amount * rates.mkbWinstvrijstellingRate;
}

function corporationTax(grossIncome, rates = RATES_2026) {
  return grossIncome - applyBrackets(grossIncome, rates.corporationTaxBrackets);
}

function dividendTax(amount, rates = RATES_2026) {
  return amount * rates.dividendWithholdingTaxRate;
}

function incomeTaxBox2(amount, rates = RATES_2026) {
  return applyBrackets(amount, rates.box2Brackets);
}

function incomeTaxBox1(grossIncome, isZzp, year, rates = RATES_2026) {
  let taxableIncome = grossIncome;
  if (isZzp) {
    taxableIncome -= zelfstandigenaftrek(year, rates);
    taxableIncome -= mkbWinstvrijstelling(taxableIncome, rates);
  }

  const totalTax = applyBrackets(taxableIncome, rates.box1Brackets);
  return grossIncome - totalTax;
}
