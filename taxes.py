#!/usr/bin/env python


def zelfstandigenaftrek(year, first_three_years=True):
    # https://business.gov.nl/amendment/private-business-ownership-allowance-reduced/
    start_up_deduction = 2123 if first_three_years else 0
    return 6670 + start_up_deduction


def income_tax_box1(gross_income, zzp=True):
    if zzp:
        taxable_income = gross_income - zelfstandigenaftrek(2021)
    else:
        taxable_income = gross_income
    income_bracket_1 = taxable_income if taxable_income <= 68508 else 68508
    income_bracket_2 = taxable_income - 68508 if taxable_income - 68508 > 0 else 0
    tax_bracket_1 = income_bracket_1 * 0.371
    tax_bracket_2 = income_bracket_2 * 0.495

    total_tax = tax_bracket_1 + tax_bracket_2
    net_income = taxable_income - total_tax

    # return gross_income, taxable_income, net_income, total_tax, total_tax / gross_income * 100
    return net_income


def income_tax_box2(gross_income):
    return gross_income * 0.256


def income_tax_box3(gross_assets, fiscal_partner=True):
    if fiscal_partner:
        taxable_assets = gross_assets - 100000 if gross_assets - 100000 > 0 else 0
    else:
        taxable_assets = gross_assets - 50000 if gross_assets - 50000 > 0 else 0

    total_taxable_assets = taxable_assets
    taxable_assets = taxable_assets if taxable_assets > 0 else 0
    assets_bracket_1 = taxable_assets if taxable_assets <= 50000 else 50000
    profit_bracket_1 = (
        assets_bracket_1 * 0.67 * 0.0003 + assets_bracket_1 * 0.33 * 0.0569
    )

    taxable_assets = (
        taxable_assets - assets_bracket_1
        if taxable_assets - assets_bracket_1 > 0
        else 0
    )
    assets_bracket_2 = taxable_assets if taxable_assets <= 950000 else 950000
    profit_bracket_2 = (
        assets_bracket_2 * 0.21 * 0.0003 + assets_bracket_2 * 0.79 * 0.0569
    )

    taxable_assets = (
        taxable_assets - assets_bracket_2
        if taxable_assets - assets_bracket_2 > 0
        else 0
    )
    assets_bracket_3 = taxable_assets
    profit_bracket_3 = assets_bracket_3 * 0.0 * 0.0003 + assets_bracket_3 * 1 * 0.0569

    total_tax = 0.31 * (profit_bracket_1 + profit_bracket_2 + profit_bracket_3)
    net_assets = gross_assets - total_tax

    # return gross_assets, total_taxable_assets, net_assets, total_tax,  total_tax / gross_assets * 100
    return net_assets


def corporation_tax(gross_income):
    if gross_income < 200000:
        return gross_income * 0.19
    else:
        return gross_income * 0.25


def generate_income(rate, days_a_week, months):
    return 8 * days_a_week * 4 * months * rate


def overview_boxes():
    print("Box 1")
    for i in range(30000, 155000, 5000):
        print("%8.2f\t%8.2f\t%8.2f\t%8.2f\t%8.2f" % (income_tax_box1(i)))

    print("Box 3")
    for i in range(100000, 10010000, 100000):
        print("%8.2f\t%8.2f\t%8.2f\t%8.2f\t%8.2f" % (income_tax_box3(i)))


def dividend_tax(amount):
    return amount * 0.256


def scenario_zzp(initial_assets=0):
    income = generate_income(110, 4, 10)
    net_income = income_tax_box1(income)
    net_assets = income_tax_box3(initial_assets)
    return net_income + net_assets


def scenario_bv(initial_assets=0):
    salary = 67000
    gross_income = generate_income(110, 4, 10)
    bv_net_profit = gross_income - corporation_tax(gross_income) - salary
    personal_net_profit = salary - income_tax_box1(salary, zzp=False)
    personal_net_profit = bv_net_profit - dividend_tax(bv_net_profit)
    net_assets = income_tax_box3(initial_assets)

    return personal_net_profit + net_assets + bv_net_profit


def yearly_expenses():
    expenses = {
        "mortgage": 950,
        "opvang": 700,
        "utilities": 200,
        "vve": 230,
        "food": 500,
    }

    return sum(expenses.values()) * 12


def simulate(
    years=20,
    invested_assets_percentage=0.8,
    invested_assets_return=0.07,
    scenario_function=scenario_zzp,
):

    assets = 0
    for _ in range(years):
        assets = scenario_function(assets) - yearly_expenses()

        current_assets = assets * (1 - invested_assets_percentage)
        invested_assets = assets * invested_assets_percentage
        assets = (
            current_assets + invested_assets + invested_assets * invested_assets_return
        )

        yield assets


for bv, zzp in zip(
    simulate(scenario_function=scenario_bv), simulate(scenario_function=scenario_zzp)
):
    print("%6.2f - %6.2f = %6.2f" % (bv, zzp, bv - zzp))
