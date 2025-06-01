-- Analysis of Netflix content during COVID-19 pandemic period
-- Timeline: January 30, 2020 - December 31, 2022

-- Get content released during COVID period
SELECT 
    type,
    title,
    country,
    date_added,
    release_year,
    rating,
    duration,
    listed_in as genres
FROM netflix_titles
WHERE date_added BETWEEN '2020-01-30' AND '2022-12-31'
ORDER BY date_added;

-- Count content by country during COVID period
SELECT 
    country,
    COUNT(*) as content_count,
    COUNT(CASE WHEN type = 'Movie' THEN 1 END) as movies,
    COUNT(CASE WHEN type = 'TV Show' THEN 1 END) as tv_shows
FROM netflix_titles
WHERE date_added BETWEEN '2020-01-30' AND '2022-12-31'
    AND country IS NOT NULL
GROUP BY country
ORDER BY content_count DESC;

-- Monthly content additions during COVID
SELECT 
    strftime('%Y-%m', date_added) as month,
    COUNT(*) as total_additions,
    COUNT(CASE WHEN type = 'Movie' THEN 1 END) as movies_added,
    COUNT(CASE WHEN type = 'TV Show' THEN 1 END) as shows_added
FROM netflix_titles
WHERE date_added BETWEEN '2020-01-30' AND '2022-12-31'
GROUP BY strftime('%Y-%m', date_added)
ORDER BY month;

-- Genre trends during COVID
SELECT 
    listed_in as genre,
    COUNT(*) as content_count,
    COUNT(DISTINCT country) as countries,
    AVG(CAST(CASE 
        WHEN duration LIKE '%min%' THEN REPLACE(duration, ' min', '')
        ELSE '0' 
    END AS INTEGER)) as avg_duration_mins
FROM netflix_titles
WHERE date_added BETWEEN '2020-01-30' AND '2022-12-31'
    AND listed_in IS NOT NULL
GROUP BY listed_in
ORDER BY content_count DESC; 