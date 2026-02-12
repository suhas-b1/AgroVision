def get_advisory(plant, disease):

    # Normalize input (VERY IMPORTANT)
    plant = plant.strip()
    disease = disease.strip().lower()

    advisory_map = {

        "Tomato": {
            "healthy": "Your tomato plant is healthy. Maintain proper watering and sunlight.",
            "early_blight": "Remove infected leaves. Apply copper-based fungicide every 7 days.",
            "late_blight": "Apply systemic fungicide immediately. Avoid leaf wetting.",
            "leaf_mold": "Improve air circulation and reduce humidity.",
            "mosaic_virus": "Remove infected plant immediately. Virus cannot be cured.",
            "septoria_leaf_spot": "Remove affected leaves and apply fungicide.",
            "spider_mites": "Use neem oil spray weekly.",
            "target_spot": "Apply recommended fungicide and improve airflow.",
            "yellowleaf__curl_virus": "Remove infected plants and control whiteflies."
        },

        "Potato": {
            "healthy": "Potato plant is healthy. Continue proper care.",
            "early_blight": "Apply fungicide and remove affected leaves.",
            "late_blight": "Urgent treatment needed. Use systemic fungicide."
        },

        "Pepper": {
            "healthy": "Pepper plant is healthy.",
            "bacterial_spot": "Apply copper-based spray. Avoid overhead irrigation."
        }
    }

    # Normalize disease keys from model
    disease = disease.lower()

    if plant in advisory_map:
        if disease in advisory_map[plant]:
            return advisory_map[plant][disease]

    return "Consult local agriculture expert for proper treatment."
