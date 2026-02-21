def calculate_fertilizer(crop, acreage):
    """
    Calculate fertilizer requirements (N-P-K) based on crop and area.
    Base values per acre (mock logic for demo).
    """
    crop_data = {
        "Banana": {"DAP": 150, "MOP": 100, "Urea": 200},
        "Rice": {"DAP": 50, "MOP": 30, "Urea": 80},
        "Wheat": {"DAP": 55, "MOP": 25, "Urea": 75},
        "Tomato": {"DAP": 40, "MOP": 60, "Urea": 50},
        "Potato": {"DAP": 80, "MOP": 120, "Urea": 100},
        "Maize": {"DAP": 60, "MOP": 40, "Urea": 90},
    }

    base = crop_data.get(crop, {"DAP": 50, "MOP": 50, "Urea": 50})
    
    return {
        "DAP": round(base["DAP"] * acreage, 1),
        "MOP": round(base["MOP"] * acreage, 1),
        "Urea": round(base["Urea"] * acreage, 1),
        "First_App": "At sowing",
        "Second_App": "Week 4",
        "Third_App": "Flowering stage"
    }
