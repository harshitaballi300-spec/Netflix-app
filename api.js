const API_KEY = "5b1cde8f10347808f2711c63333085dc";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const endpoints = {
    trending: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
    topRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
    action: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
    comedy: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
};

export { API_KEY, BASE_URL, IMAGE_URL, endpoints };
