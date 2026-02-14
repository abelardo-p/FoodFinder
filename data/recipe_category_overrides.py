""" If a recipe title contains any of these keywords, they can automatically be tagged in one of these
    categories below"""

OVERRIDES = {
    "dessert": (
        "cake","cupcake","brownie","cookie","pie","tart","cheesecake",
        "ice cream","gelato","sorbet","pudding","mousse","custard",
        "frosting","icing","fudge","toffee","macaron","macaroon","blondie"
    ),
    "breakfast": (
        "pancake","waffle","omelet","omelette","frittata",
        "breakfast burrito","breakfast sandwich","granola",
        "oatmeal","porridge","french toast","hash browns",
        "crepe","muffin"
    ),
    "side": (
        "coleslaw", "slaw", "dip", "sauce", "roasted potatoes",
        "garlic bread","dinner rolls","cornbread","stuffing",
        "rice pilaf","pasta salad","potato salad","side salad",
        "roasted vegetables","grilled vegetables","glazed carrots"
    ),
    "lunch": (
        "sandwich","wrap","panini","grilled cheese","melt",
        "quesadilla","taco","soup","chowder","burger"
    ),
    "dinner": (
        "pasta","spaghetti","linguini","curry","stir fry",
        "roast chicken","steak","salmon","casserole",
        "lasagna","risotto","ramen","shepherd"
    )
}

CATEGORY_DESCRIPTIONS = {
    "breakfast": "morning meals typically eaten for breakfast like",
    "lunch": "midday meals typically eaten for lunch like",
    "dinner": "main evening meals typically eaten for dinner like",
    "dessert": "sweet desserts and treats like",
    "side": "accompanying side dishes served alongside a main course like"
}