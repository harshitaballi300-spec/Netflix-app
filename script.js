import { API_KEY, IMAGE_URL, endpoints } from './api.js';

// --- Global Functions ---
const checkAuth = () => {
    const user = localStorage.getItem('isLoggedIn');
    const path = window.location.pathname;

    // Protect home page
    if (!user && path.includes('home.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Redirect if already logged in
    if (user && (path.includes('login.html') || path.includes('register.html'))) {
        window.location.href = 'home.html';
        return;
    }
};

// --- Page Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Universal Password Toggle
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function () {
            // Find input in the same container
            const input = this.parentElement.querySelector('input');
            if (input) {
                const isPassword = input.getAttribute('type') === 'password';
                input.setAttribute('type', isPassword ? 'text' : 'password');

                // Toggle FontAwesome classes
                if (isPassword) {
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                } else {
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                }
            }
        });
    });

    // Login Page Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;

            const storedUser = localStorage.getItem(`user_${email}`);
            if (storedUser && storedUser === pass) {
                localStorage.setItem('isLoggedIn', email);
                window.location.href = 'home.html';
            } else if (!storedUser && email && pass.length >= 4) {
                localStorage.setItem(`user_${email}`, pass);
                localStorage.setItem('isLoggedIn', email);
                window.location.href = 'home.html';
            } else {
                alert("Invalid email or password.");
            }
        });
    }

    // Register Page Logic
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const pass = document.getElementById('regPassword').value;

            if (email && pass.length >= 4) {
                localStorage.setItem(`user_${email}`, pass);
                alert("Account created successfully! Please sign in to continue.");
                window.location.href = 'login.html';
            } else {
                alert("Please enter a valid email and a password (min 4 chars).");
            }
        });
    }

    // Home Page Logic
    const homeBody = document.getElementById('homeBody');
    if (homeBody) {
        const user = localStorage.getItem('isLoggedIn');
        const userNameDisplay = document.getElementById('userName');
        if (userNameDisplay && user) {
            userNameDisplay.innerText = user.split('@')[0];
        }

        fetchMovies();
        setupNavbarScroll();
        setupLogout();
        setupSearch();
    }
});

// --- Home Page Helper Functions ---
const fetchMovies = async () => {
    try {
        const fetchResults = await Promise.all([
            fetch(endpoints.trending).then(res => res.json()),
            fetch(endpoints.topRated).then(res => res.json()),
            fetch(endpoints.action).then(res => res.json()),
            fetch(endpoints.comedy).then(res => res.json())
        ]);

        const [trending, topRated, action, comedy] = fetchResults;

        renderMovies('trendingMovies', trending.results || []);
        renderMovies('topRatedMovies', topRated.results || []);
        renderMovies('actionMovies', action.results || []);
        renderMovies('comedyMovies', comedy.results || []);

        if (trending.results && trending.results.length > 0) {
            const heroMovie = trending.results[0];
            const hero = document.getElementById('hero');
            const title = document.getElementById('heroTitle');
            const desc = document.getElementById('heroDesc');

            if (hero && title && desc) {
                hero.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`;
                title.innerText = heroMovie.title || heroMovie.name;
                desc.innerText = heroMovie.overview ?
                    (heroMovie.overview.length > 150 ? heroMovie.overview.substring(0, 150) + "..." : heroMovie.overview) :
                    "Enjoy this amazing title now on Netflix.";
            }
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        setupStaticFallbacks();
    }
};

const setupStaticFallbacks = () => {
    const mockData = [
        { id: 1, title: 'Netflix Original', poster_path: null, vote_average: 9.0, release_date: '2024-01-01' },
        { id: 2, title: 'Streaming Hits', poster_path: null, vote_average: 8.5, release_date: '2023-12-15' },
    ];
    renderMovies('trendingMovies', mockData);
    renderMovies('topRatedMovies', mockData);
    renderMovies('actionMovies', mockData);
    renderMovies('comedyMovies', mockData);
};

const renderMovies = (containerId, movies) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!movies || movies.length === 0) {
        container.innerHTML = '<div class="row-error">No movies found. Please check your internet connection or API key.</div>';
        return;
    }

    container.innerHTML = movies.map(movie => {
        const imagePath = movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : `${IMAGE_URL}${movie.backdrop_path}`;
        const fallbackImage = 'https://via.placeholder.com/342x513?text=' + encodeURIComponent(movie.title || movie.name);

        return `
            <div class="movie-card">
                <img class="movie-poster" src="${imagePath}" 
                     alt="${movie.title || movie.name}" 
                     loading="lazy"
                     onerror="this.src='${fallbackImage}'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title || movie.name}</h3>
                    <div class="movie-meta">
                        <span class="rating">★ ${movie.vote_average.toFixed(1)}</span>
                        <span>${movie.release_date ? movie.release_date.split('-')[0] : (movie.first_air_date ? movie.first_air_date.split('-')[0] : '')}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

const setupNavbarScroll = () => {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
};

const setupLogout = () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        });
    }
};

const setupSearch = () => {
    const searchBar = document.getElementById('searchBar');
    if (!searchBar) return;

    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.movie-card');

        cards.forEach(card => {
            const title = card.querySelector('.movie-title').innerText.toLowerCase();
            if (title.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
};
