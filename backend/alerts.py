"""
AgroVision AI — Disease Alerts & Heatmap
Logs disease detections to database and provides heatmap data.
"""

from collections import defaultdict
from typing import Optional

from geopy.geocoders import Nominatim
from sqlalchemy.orm import Session

from .models import DiseaseLog

# ─── Geocoder ─────────────────────────────────────────────
geolocator = Nominatim(user_agent="agrovision")


def get_coordinates_from_name(location: str):
    """Convert location name to lat/lng coordinates."""
    try:
        geo = geolocator.geocode(f"{location}, India")
        if geo:
            return geo.latitude, geo.longitude
    except Exception:
        pass
    return None, None


def log_disease(
    db: Session,
    plant: str,
    disease: str,
    confidence: float,
    severity: str,
    location: str,
    user_id: Optional[int] = None,
):
    """Log a disease detection to the database."""

    if disease.lower() == "healthy":
        return

    lat, lng = get_coordinates_from_name(location)

    if lat is None:
        print(f"⚠ Could not find location: {location}")

    log = DiseaseLog(
        user_id=user_id,
        plant=plant,
        disease=disease,
        confidence=confidence,
        severity=severity,
        location=location.lower() if location else "unknown",
        lat=lat,
        lng=lng,
    )
    db.add(log)
    db.commit()

    print(f"✅ Logged: {location} ({lat}, {lng})")


def get_heatmap_data(db: Session) -> dict:
    """Get aggregated heatmap data from database."""

    logs = db.query(DiseaseLog).filter(
        DiseaseLog.lat.isnot(None),
        DiseaseLog.lng.isnot(None),
    ).all()

    heatmap = defaultdict(lambda: {"count": 0, "lat": None, "lng": None})

    for entry in logs:
        if entry.disease.lower() == "healthy":
            continue

        key = entry.location or "unknown"
        heatmap[key]["count"] += 1
        heatmap[key]["lat"] = entry.lat
        heatmap[key]["lng"] = entry.lng

    return dict(heatmap)
