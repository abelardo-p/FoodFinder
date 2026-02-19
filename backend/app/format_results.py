from collections import defaultdict
from krovetzstemmer import Stemmer
import sqlalchemy

ks = Stemmer()

def format_item_results(rows: list[sqlalchemy.engine.Row]):
    """Formats & deduplicates ingredient names/keywords returned by a keyword-search query"""
    ingredients_to_keywords = {}
    # Group ingredients with the same name together
    for row in rows:
        d = row._asdict()
        name = d["name"].lower()
        ing_id = int(d["id"])
        ing_keywords = d["keywords"] or []
        ingredients_to_keywords[name][ing_id] = list(ing_keywords)

    return format_items(ingredients_to_keywords)

def format_items(ingredients_to_keywords: dict[str, dict[int, list[str]]]):
    """For each ingredient name-group: remove name tokens; hide group-common tokens; keep remaining as display keywords."""
    for name, id_to_kwlist in ingredients_to_keywords.items():
        name_tokens = {ks.stem(tok) for tok in name.split()}

        processed = {}
        all_sets = []
        for ing_id, kw_list in id_to_kwlist.items():
            s = set()
            for kw in kw_list:
                kw_s = ks.stem(str(kw).lower())
                if kw_s == name:
                    continue
                if kw_s in name_tokens:
                    continue
                s.add(kw_s)
            processed[ing_id] = s
            all_sets.append(s)

        common = set.intersection(*all_sets) if all_sets else set()

        for ing_id in processed:
            ingredients_to_keywords[name][ing_id] = processed[ing_id] - common

    return ingredients_to_keywords

# Test input:
test_input = {
    "whole wheat bread": {
        101: ["whole wheat", "bread", "wheat", "loaf", "whole", "grain"],
        102: ["whole wheat", "bread", "wheat", "rolls", "whole", "grain"],
        103: ["whole wheat", "bread", "wheat", "bagel", "whole", "grain"],
    },

    "whole wheat flour": {
        201: ["whole wheat", "flour", "wheat", "whole", "grain"],
        202: ["whole wheat", "flour", "wheat", "stone-ground", "whole", "grain"],
        203: ["whole wheat", "flour", "wheat", "white whole wheat", "whole"],
    },

    "whole wheat pasta": {
        301: ["whole wheat", "pasta", "wheat", "whole", "spaghetti"],
        302: ["whole wheat", "pasta", "wheat", "penne", "whole"],
    },

    # example where one item may end up with no display keywords
    "whole wheat tortilla": {
        401: ["whole wheat", "tortilla", "wheat", "whole"],
        402: ["whole wheat", "tortilla", "wheat", "whole", "wrap"],
    }
}

print(format_items(test_input))