// Single-year ZZP vs BV vs Employment comparison. No multi-year forecast —
// this tab answers "for this exact income, which structure keeps the most
// today", so charts and the info panel always reflect one year of income.

var singleYearParameters = {
  salary: 46000,
  dividend: 0,
  rate: 90,
  months: 10,
  weeks: 4,
  days: 4,
  hours: 8,
};

$(document).ready(function () {
  var currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  var chart3 = new CanvasJS.Chart("chartSingleYear", {
    animationEnabled: true,
    title: {
      text: "ZZP vs BV vs Employment (one year)",
    },
    toolTip: {
      shared: true,
    },
    data: [
      { name: "zzp net", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "zzp taxes", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "bv personal net", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "bv retained net", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "bv taxes", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "employment net", type: "stackedColumn100", dataPoints: [], showInLegend: true },
      { name: "employment taxes", type: "stackedColumn100", dataPoints: [], showInLegend: true },
    ],
  });

  function setInfo(idPrefix, yearlyAmount) {
    $("#" + idPrefix + "Yearly").text(currencyFormatter.format(yearlyAmount));
    $("#" + idPrefix + "Monthly").text(currencyFormatter.format(yearlyAmount / 12));
  }

  function calculateSingleYear(p) {
    var grossIncome = generateIncome(p);

    // ZZP
    var zzpNet = incomeTaxBox1(grossIncome, true, 1);
    var zzpTax = grossIncome - zzpNet;

    // BV
    // we pay ourselves a fixed salary, which is subtracted from bv profit as expense
    var bvNetProfit = corporationTax(grossIncome) - p.salary;

    // we pay ourselves a dividend as a percentage of net profit
    var grossDividend = bvNetProfit * (p.dividend / 100);

    // Personal Net is salary + dividend - taxes
    var bvPersonalNet = incomeTaxBox1(p.salary, false, 1);
    bvPersonalNet += grossDividend - (incomeTaxBox2(grossDividend) - dividendTax(grossDividend));

    // Assets left in the BV
    var bvRetainedNet = bvNetProfit - grossDividend;

    // Taxes payed by BV and ourselves
    var bvTax = grossIncome - bvRetainedNet - bvPersonalNet;

    // Employment: the same gross income, taxed as a straight box 1 salary —
    // no zelfstandigenaftrek, mkb-winstvrijstelling, or corporate structure.
    var employmentNet = incomeTaxBox1(grossIncome, false, 1);
    var employmentTax = grossIncome - employmentNet;

    chart3.options.data[0].dataPoints = [{ x: 1, y: zzpNet, label: "ZZP", indexLabel: "#percent%", indexLabelPlacement: "inside" }];
    chart3.options.data[1].dataPoints = [{ x: 1, y: zzpTax, label: "ZZP", indexLabel: "#percent%", indexLabelPlacement: "inside" }];
    chart3.options.data[2].dataPoints = [{ x: 2, y: bvPersonalNet, label: "BV", indexLabel: "#percent%", indexLabelPlacement: "inside" }];
    chart3.options.data[3].dataPoints = [{ x: 2, y: bvRetainedNet, label: "BV", indexLabel: "#percent%", indexLabelPlacement: "inside" }];
    chart3.options.data[4].dataPoints = [{ x: 2, y: bvTax, label: "BV", indexLabel: "#percent%", indexLabelPlacement: "inside" }];
    chart3.options.data[5].dataPoints = [{ x: 3, y: employmentNet, label: "Employment", indexLabel: "#percent%", indexLabelPlacement: "inside" }];
    chart3.options.data[6].dataPoints = [{ x: 3, y: employmentTax, label: "Employment", indexLabel: "#percent%", indexLabelPlacement: "inside" }];
    chart3.render();

    setInfo("syGross", grossIncome);
    setInfo("syZzp", zzpNet);
    setInfo("syBv", bvPersonalNet + bvRetainedNet);
    setInfo("syEmployment", employmentNet);
  }

  calculateSingleYear(singleYearParameters);

  // update either slider or input on field change, namespaced under the
  // "sy" id prefix so this tab's controls don't collide with the forecast tab
  function update() {
    var v = $(this).val();
    var base = this.id.slice(2).replace("Range", "").replace("Text", "");
    var key = base.charAt(0).toLowerCase() + base.slice(1);
    if (this.id.includes("Range")) {
      $("#sy" + base + "Text").val(v);
    } else {
      $("#sy" + base + "Range").val(v);
    }
    singleYearParameters[key] = parseInt(v, 10);
    calculateSingleYear(singleYearParameters);
  }

  for (var key in singleYearParameters) {
    var idKey = key.charAt(0).toUpperCase() + key.slice(1);
    $("#sy" + idKey + "Text").on("input", update);
    $("#sy" + idKey + "Range").on("input", update);
    $("#sy" + idKey + "Text").val(singleYearParameters[key]);
  }
});
