CREATE OR REPLACE PROCEDURE update_category_views() LANGUAGE PLPGSQL AS $$
DECLARE
  language_code VARCHAR;
BEGIN
  FOR language_code IN SELECT code FROM languages LOOP
    IF language_code IS NULL THEN
      RAISE EXCEPTION 'Language code is NULL';
    END IF;

    RAISE NOTICE 'Constructing materialized view for language code: %', language_code;
    RAISE NOTICE 'Before execute format';

    BEGIN
      EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS "deal_category_view_%s"', language_code);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Materialized view "deal_category_view_%s" does not exist or could not be dropped', language_code;
    END;

    EXECUTE format('CREATE MATERIALIZED VIEW "deal_category_view_%s" AS
      SELECT 
        "dc"."id" AS "id",
        COALESCE("dct"."name", "dc"."name") AS "name",
        "dc"."type",
        "dc"."status",
        "dc"."parentId",
        "dc"."display_order"
      FROM 
        "deal_categories" AS "dc"
        LEFT JOIN "deal_category_translations" AS "dct" ON "dc"."id" = "dct"."categoryId" 
        AND "dct"."languageId" = (
          SELECT 
            "id"
          FROM 
            "languages" 
          WHERE 
            "code" = %L
        )
      ORDER BY 
        "dc"."id"', language_code, language_code);

    RAISE NOTICE 'After execute format';
  END LOOP;
END;
$$;