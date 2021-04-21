import taxes

from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def simulate():
    return jsonify(
        {
            "scenario_zzp": list(taxes.simulate(scenario_function=taxes.scenario_zzp)),
            "scenario_bv": list(taxes.simulate(scenario_function=taxes.scenario_bv)),
        }
    )
