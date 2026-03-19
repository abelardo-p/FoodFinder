CREATE OR REPLACE FUNCTION filter_candidates(
    pantry_ingredients jsonb,
    itemids bigint[],
    meal_type int,
    match_thresh numeric,
    restrictions bigint[]
)
RETURNS TABLE (
    recipeid int,
    perc_matching float,
    expired_boost numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH recipe_matches AS (
        SELECT ri.recipeid, 
            COUNT(*) FILTER (WHERE ri.ingredientid = ANY(itemids))::float / COUNT(*) 
        AS perc_matching
        FROM recipeingredients ri
        GROUP BY ri.recipeid
    ),
    filtered AS (
        SELECT rm.recipeid, rm.perc_matching
        FROM recipe_matches rm
        JOIN recipemealtype rmt
            ON rm.recipeid = rmt.recipeid
        WHERE rmt.mealtypeid = meal_type
          AND rm.perc_matching >= match_thresh
          AND (
                SELECT COALESCE(ARRAY_AGG(DISTINCT rrt.healthlabelid), '{}')
                FROM reciperestrictiontype rrt
                WHERE rrt.recipeid = rm.recipeid
              ) @> restrictions
          -- exclude expired ingredients
          AND NOT EXISTS (
              SELECT 1
              FROM recipeingredients ri
              WHERE ri.recipeid = rm.recipeid
                AND (pantry_ingredients->ri.ingredientid::text->>'hard_expire')::date < CURRENT_DATE
          )
    )

    -- boost recipes with ingredients close to expiring
    SELECT 
        f.recipeid,
        f.perc_matching,
        COALESCE(
            SUM(1.0 /
                CASE 
                    WHEN (pantry_ingredients->ri.ingredientid::text->>'hard_expire')::date - CURRENT_DATE = 0 
                        THEN 0.5
                    ELSE (pantry_ingredients->ri.ingredientid::text->>'hard_expire')::date - CURRENT_DATE
                END
            )
            FILTER (WHERE CURRENT_DATE >= (pantry_ingredients->ri.ingredientid::text->>'near_expire')::date),
            0
        ) AS expired_boost
    FROM filtered f
    JOIN recipeingredients ri
        ON f.recipeid = ri.recipeid
    GROUP BY f.recipeid, f.perc_matching;

END;
$$;

