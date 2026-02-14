from typing import Any, Dict, List, Optional, Tuple

METRIC_TO_DAYS = {
    "Day": 1, "Days": 1,
    "Week": 7, "Weeks": 7,
    "Month": 30, "Months": 30,
    "Year": 365, "Years": 365,
}

def to_days(value: Optional[float], metric: Optional[str]) -> Optional[int]:
    if value is None or metric is None:
        return None
    mult = METRIC_TO_DAYS.get(metric)
    if mult is None:
        return None
    return int(round(value * mult))

def first_non_null_triplet(
    obj: Dict[str, Any],
    base_prefix: str,
) -> Tuple[Optional[float], Optional[float], Optional[str], str]:
    """
    Returns (min, max, metric, source_label) choosing BASE first, else DOP.
    """
    bmin = obj.get(f"{base_prefix}_Min")
    bmax = obj.get(f"{base_prefix}_Max")
    bmet = obj.get(f"{base_prefix}_Metric")
    if bmin is not None and bmax is not None and bmet is not None:
        return bmin, bmax, bmet, "BASE"

    dmin = obj.get(f"DOP_{base_prefix}_Min")
    dmax = obj.get(f"DOP_{base_prefix}_Max")
    dmet = obj.get(f"DOP_{base_prefix}_Metric")
    if dmin is not None and dmax is not None and dmet is not None:
        return dmin, dmax, dmet, "DOP"

    return None, None, None, "NONE"

def extract_shelf_life_rows(foodkeeper_item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Produces normalized shelf-life rows for (storage,state).
    """
    fk_id = foodkeeper_item.get("ID")
    rows: List[Dict[str, Any]] = []

    # DEFAULT states
    for storage, prefix in [("PANTRY", "Pantry"), ("FRIDGE", "Refrigerate"), ("FREEZER", "Freeze")]:
        mn, mx, met, src = first_non_null_triplet(foodkeeper_item, prefix)
        mn_days = to_days(mn, met)
        mx_days = to_days(mx, met)
        if mn_days is not None and mx_days is not None:
            rows.append({
                "fk_id": fk_id,
                "storage": storage,
                "state": "DEFAULT",
                "min_days": mn_days,
                "max_days": mx_days,
                "source": src,
            })

    # AFTER_OPENING 
    for storage, prefix in [("PANTRY", "Pantry_After_Opening"), ("FRIDGE", "Refrigerate_After_Opening")]:
        mn, mx, met, src = first_non_null_triplet(foodkeeper_item, prefix)
        mn_days = to_days(mn, met)
        mx_days = to_days(mx, met)
        if mn_days is not None and mx_days is not None:
            rows.append({
                "fk_id": fk_id,
                "storage": storage,
                "state": "AFTER_OPENING",
                "min_days": mn_days,
                "max_days": mx_days,
                "source": src,
            })

    # AFTER_THAWING 
    mn, mx, met, src = first_non_null_triplet(foodkeeper_item, "Refrigerate_After_Thawing")
    mn_days = to_days(mn, met)
    mx_days = to_days(mx, met)
    if mn_days is not None and mx_days is not None:
        rows.append({
            "fk_id": fk_id,
            "storage": "FRIDGE",
            "state": "AFTER_THAWING",
            "min_days": mn_days,
            "max_days": mx_days,
            "source": src,
        })

    return rows
