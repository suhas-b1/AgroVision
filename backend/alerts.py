from collections import defaultdict
from geopy.geocoders import Nominatim
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

geolocator = Nominatim(user_agent="agrovision")

_disease_logs = []


# ==========================
# 🌍 GET LAT/LNG FROM NAME
# ==========================
def get_coordinates_from_name(location):
    try:
        geo = geolocator.geocode(location)
        if geo:
            return geo.latitude, geo.longitude
    except:
        pass
    return None, None


# ==========================
# 📸 GET GPS FROM IMAGE
# ==========================
def get_coordinates_from_image(image_path):
    try:
        image = Image.open(image_path)
        exif = image._getexif()

        if not exif:
            return None, None

        gps_info = {}
        for key, value in exif.items():
            tag = TAGS.get(key)
            if tag == "GPSInfo":
                for t in value:
                    gps_tag = GPSTAGS.get(t)
                    gps_info[gps_tag] = value[t]

        if "GPSLatitude" in gps_info and "GPSLongitude" in gps_info:
            lat = gps_info["GPSLatitude"][0][0]
            lng = gps_info["GPSLongitude"][0][0]
            return lat, lng

    except:
        pass

    return None, None


# ==========================
# 🧾 LOG DISEASE
# ==========================
def log_disease(disease, confidence, location, image_path):

    if disease.lower() == "healthy":
        return

    lat, lng = None, None

    # 1️⃣ If location typed
    if location and location != "Unknown":
        lat, lng = get_coordinates_from_name(location)

    # 2️⃣ If no location → try image GPS
    if not lat:
        lat, lng = get_coordinates_from_image(image_path)

    if not lat:
        return  # If still no location, skip logging

    _disease_logs.append({
        "disease": disease,
        "lat": lat,
        "lng": lng
    })


# ==========================
# 🗺️ HEATMAP DATA
# ==========================
def get_heatmap_data():

    heatmap = defaultdict(lambda: {"count": 0, "lat": 0, "lng": 0})

    for entry in _disease_logs:
        key = f"{entry['lat']},{entry['lng']}"

        heatmap[key]["count"] += 1
        heatmap[key]["lat"] = entry["lat"]
        heatmap[key]["lng"] = entry["lng"]

    return heatmap
