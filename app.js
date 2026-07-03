// ZZP vs BV comparison tab: charts, inputs, and the glue between them.
// Tax math itself lives in taxes.js.

var parameters = {
  salary: 46000,
  dividend: 0,
  rate: 90,
  years: 5,
  months: 10,
  weeks: 4,
  days: 4,
  hours: 8,
};

$(document).ready(function () {
  var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    title: {
      text: "Assets & Taxes over the years",
    },
    toolTip: {
      shared: true,
    },
    data: [
      { name: "revenue", type: "spline", dataPoints: [], showInLegend: true },
      { name: "zzp net assets", type: "spline", dataPoints: [], showInLegend: true },
      { name: "bv total net assets", type: "spline", dataPoints: [], showInLegend: true },
      { name: "bv personal net assets", type: "spline", dataPoints: [], showInLegend: true },
      { name: "bv net assets", type: "spline", dataPoints: [], showInLegend: true },
      { name: "zzp taxes", type: "spline", dataPoints: [], showInLegend: true },
      { name: "bv taxes", type: "spline", dataPoints: [], showInLegend: true },
    ],
  });

  var chart2 = new CanvasJS.Chart("chartComposition", {
    animationEnabled: true,
    title: {
      text: "Assets & Taxes percentage in one year",
    },
    toolTip: {
      shared: true,
    },
    data: [
      { name: "zzp net assets", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "zzp taxes", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "bv personal net assets", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "bv net assets", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "bv taxes", type: "stackedColumn100", dataPoints: [], showInLegend: true },
    ],
  });

  function calculateComposition(p) {
    var netIncomeDataPoints = [];
    var taxesDataPoints = [];
    var bvNetIncomeDataPoints = [];
    var bvPersonalAssetsDataPoints = [];
    var bvTaxesDataPoints = [];
    var grossIncome = generateIncome(parameters);

    // ZZP
    var netIncome = incomeTaxBox1(grossIncome, true, 1);
    var assets = netIncome;
    var taxes = grossIncome - netIncome;
    netIncomeDataPoints.push({ y: assets, x: 1, label: "ZZP", indexLabel: "#percent%", indexLabelPlacement: "inside" });
    taxesDataPoints.push({ y: taxes, x: 1, label: "ZZP", indexLabel: "#percent%", indexLabelPlacement: "inside" });

    // BV
    // we pay ourselves a fixed salary, which is subtracted from bv profit as expense
    var bvNetProfit = corporationTax(grossIncome) - p.salary;

    // we pay ourselves a dividend as a percentage of net profit
    var grossDividend = bvNetProfit * (p.dividend / 100);

    // Personal Net Profit is salary + dividend - taxes
    var personalNetProfit = incomeTaxBox1(p.salary, false, 1);
    personalNetProfit += grossDividend - (incomeTaxBox2(grossDividend) - dividendTax(grossDividend));
    var bvPersonalAssets = personalNetProfit;

    // Assets left in the BV
    bvNetProfit = bvNetProfit - grossDividend;
    var bvAssets = bvNetProfit;

    // Taxes payed by BV and ourselves
    var bvTaxes = grossIncome - bvNetProfit - personalNetProfit;

    bvPersonalAssetsDataPoints.push({ x: 2, y: bvPersonalAssets, label: "BV", indexLabel: "#percent%", indexLabelPlacement: "inside" });
    bvNetIncomeDataPoints.push({ x: 2, y: bvAssets, label: "BV", indexLabel: "#percent%", indexLabelPlacement: "inside" });
    bvTaxesDataPoints.push({ x: 2, y: bvTaxes, label: "BV", indexLabel: "#percent%", indexLabelPlacement: "inside" });

    chart2.options.data[0].dataPoints = netIncomeDataPoints;
    chart2.options.data[1].dataPoints = taxesDataPoints;
    chart2.options.data[2].dataPoints = bvPersonalAssetsDataPoints;
    chart2.options.data[3].dataPoints = bvNetIncomeDataPoints;
    chart2.options.data[4].dataPoints = bvTaxesDataPoints;
    chart2.render();
  }

  function calculateAssets(p) {
    var revenueDataPoints = [];
    var netIncomeDataPoints = [];
    var taxesDataPoints = [];
    var bvNetIncomeDataPoints = [];
    var bvPersonalAssetsDataPoints = [];
    var bvTotalAssetsDataPoints = [];
    var bvTaxesDataPoints = [];
    var revenue = 0;
    var assets = 0;
    var taxes = 0;
    var bvTaxes = 0;
    var bvAssets = 0;
    var bvPersonalAssets = 0;

    for (var year = 1; year <= p.years; year++) {
      var grossIncome = generateIncome(parameters);
      var date = new Date(2025 + year, 0, 1);

      // ZZP
      var netIncome = incomeTaxBox1(grossIncome, true, year);
      assets += netIncome;
      taxes += grossIncome - netIncome;
      revenue += grossIncome;
      revenueDataPoints.push({ x: date, y: revenue, indexLabel: "{y}€" });
      netIncomeDataPoints.push({ x: date, y: assets });
      taxesDataPoints.push({ x: date, y: taxes });

      // BV
      // we pay ourselves a fixed salary, which is subtracted from bv profit as expense
      var bvNetProfit = corporationTax(grossIncome) - p.salary;

      // we pay ourselves a dividend as a percentage of net profit
      var grossDividend = bvNetProfit * (p.dividend / 100);

      // Personal Net Profit is salary + dividend - taxes
      var personalNetProfit = incomeTaxBox1(p.salary, false, year);
      personalNetProfit += grossDividend - (incomeTaxBox2(grossDividend) - dividendTax(grossDividend));
      bvPersonalAssets += personalNetProfit;

      // Assets left in the BV
      bvNetProfit = bvNetProfit - grossDividend;
      bvAssets += bvNetProfit;

      // Taxes payed by BV and ourselves
      bvTaxes += grossIncome - bvNetProfit - personalNetProfit;

      bvPersonalAssetsDataPoints.push({ x: date, y: bvPersonalAssets });
      bvNetIncomeDataPoints.push({ x: date, y: bvAssets });
      bvTotalAssetsDataPoints.push({ x: date, y: bvPersonalAssets + bvAssets });
      bvTaxesDataPoints.push({ x: date, y: bvTaxes });
    }

    chart.options.data[0].dataPoints = revenueDataPoints;
    chart.options.data[1].dataPoints = netIncomeDataPoints;
    chart.options.data[2].dataPoints = bvTotalAssetsDataPoints;
    chart.options.data[3].dataPoints = bvPersonalAssetsDataPoints;
    chart.options.data[4].dataPoints = bvNetIncomeDataPoints;
    chart.options.data[5].dataPoints = taxesDataPoints;
    chart.options.data[6].dataPoints = bvTaxesDataPoints;
    chart.render();
  }

  calculateAssets(parameters);
  calculateComposition(parameters);

  // update either slider or input on field change
  function update() {
    var v = $(this).val();
    var k = this.id.replace("Range", "").replace("Text", "");
    if (this.id.includes("Range")) {
      $("#" + k + "Text").val(v);
    } else {
      $("#" + k + "Range").val(v);
    }
    parameters[k] = parseInt(v, 10);
    calculateAssets(parameters);
    calculateComposition(parameters);
  }

  for (var key in parameters) {
    $("#" + key + "Text").on("input", update);
    $("#" + key + "Range").on("input", update);
    $("#" + key + "Text").val(parameters[key]);
  }
});
