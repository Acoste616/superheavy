import json

categories = ["company", "pv", "children", "eco", "performance", "tech", "status", "maintenance", "warranty", "other"]
triggers = []
for i in range(1, 2001):
    cat = categories[i % len(categories)]
    triggers.append({
        "id": f"auto_trigger_{i}",
        "text": f"Auto generated trigger {i}",
        "category": cat,
        "base_conversion_rate": 50,
        "personality_resonance": {"D": 0.5, "I": 0.5, "S": 0.5, "C": 0.5}
    })

output = {
    "version": "3.0",
    "triggers": triggers,
    "meta": {"total_triggers": len(triggers)}
}

with open("data/triggers_v3.json", "w") as f:
    json.dump(output, f, indent=2)
