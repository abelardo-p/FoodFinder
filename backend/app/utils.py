import datetime
import numpy as np

# (start time, end time, meal_type id)
MEAL_RANGES = [
    (5, 10, 4),   # breakfast
    (10, 12, 5),  # brunch
    (12, 15, 1),  # lunch
    (15, 18, 3),  # snack
    (18, 24, 2),  # dinner
    (0, 5, 3)     # (late) snack
]

def get_time_of_day():
    hour = datetime.datetime.now().hour
    for start, end, mealtypeid in MEAL_RANGES:
        if start <= hour < end:
            return mealtypeid

def to_float32(vec):
    return np.array(vec, dtype=np.float32)

def dot(vec1, vec2):
    return np.dot(vec1, vec2)

def cos_sim(vec1, vec2):
    dot_product = dot(vec1, vec2)
    vec1_magnitude = np.linalg.norm(vec1)
    vec2_magnitude = np.linalg.norm(vec2)
    if vec1_magnitude == 0.0 or vec2_magnitude == 0.0:
        return 0.0
    return dot_product / (vec1_magnitude * vec2_magnitude)

