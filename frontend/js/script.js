// The Written Leaf — Client-Side Application Script

// --- Helper & State Identification ---
const PROTECTED_PAGES = ['journey.html', 'add-book.html', 'discover.html', 'profile.html', 'lending.html', 'reader.html', 'book.html'];
const PUBLIC_AUTH_PAGES = ['login.html', 'signup.html'];

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('?')[0];
    return filename || 'index.html';
}

function showAuthError(message) {
    const errorBanner = document.getElementById('auth-error');
    if (errorBanner) {
        errorBanner.textContent = message;
        errorBanner.style.display = 'block';
    }
}

function clearAuthError() {
    const errorBanner = document.getElementById('auth-error');
    if (errorBanner) {
        errorBanner.textContent = '';
        errorBanner.style.display = 'none';
    }
}

function bindPasswordVisibility(form) {
    form.querySelectorAll('[data-password-toggle]').forEach(toggle => {
        const input = document.getElementById(toggle.getAttribute('aria-controls'));
        if (!input || !form.contains(input)) return;

        toggle.addEventListener('click', () => {
            const showPassword = input.type === 'password';
            input.type = showPassword ? 'text' : 'password';
            toggle.setAttribute('aria-pressed', String(showPassword));
            toggle.setAttribute(
                'aria-label',
                `${showPassword ? 'Hide' : 'Show'} ${input.name === 'confirm-password' ? 'confirmation password' : 'password'}`
            );
            toggle.textContent = showPassword ? 'Hide' : 'Show';
        });
    });
}

// --- Dynamic Header Navigation ---
function renderNavigation(user, currentPage) {
    const navigationRoot = document.getElementById('app-navigation');

    if (user && navigationRoot) {
        navigationRoot.classList.add('app-navigation');
        const navItems = [
            ['journey.html', 'My Journey', '&#9673;'],
            ['add-book.html', 'Add a Book', '&#10010;'],
            ['discover.html', 'Discover', '&#10022;'],
            ['profile.html', 'My Profile', '&#9675;'],
            ['lending.html', 'Lending', '&#8644;']
        ];
        const links = navItems.map(([href, label, icon]) => {
            const active = href === currentPage
                || (href === 'journey.html' && currentPage === 'book.html')
                || (href === 'discover.html' && currentPage === 'reader.html');
            return `<a href="${href}" aria-label="${label}" ${active ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span><span class="nav-label">${label}</span></a>`;
        }).join('');

        navigationRoot.innerHTML = `
            <button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="app-sidebar">
                <span aria-hidden="true">&#9776;</span><span>Menu</span>
            </button>
            <aside class="app-sidebar" id="app-sidebar" aria-label="Main navigation">
                <a class="brand" href="journey.html" aria-label="The Written Leaf bookshelf">
                    <span class="brand-mark">&#10022;</span><span class="brand-label">The Written Leaf</span>
                </a>
                <nav class="site-nav" aria-label="Main navigation">
                    ${links}
                    <a href="#logout" class="nav-logout" id="logout-btn" aria-label="Log Out"><span class="nav-icon" aria-hidden="true">&#8599;</span><span class="nav-label">Log Out</span></a>
                </nav>
                <button class="sidebar-collapse" type="button" aria-expanded="true" aria-label="Collapse navigation">
                    <span aria-hidden="true">&#8592;</span><span class="sidebar-control-label">Collapse</span>
                </button>
                <p class="sidebar-note">Read slowly. Keep what stays.</p>
            </aside>
            <button class="sidebar-backdrop" type="button" aria-label="Close navigation"></button>
        `;
        document.body.classList.add('has-sidebar');
        document.querySelector('.site-header')?.classList.add('public-header-hidden');

        const sidebarToggle = navigationRoot.querySelector('.sidebar-collapse');
        sidebarToggle.addEventListener('click', () => {
            const expanded = !document.body.classList.toggle('sidebar-collapsed');
            sidebarToggle.setAttribute('aria-expanded', String(expanded));
            sidebarToggle.setAttribute('aria-label', expanded ? 'Collapse navigation' : 'Expand navigation');
        });

        const mobileToggle = navigationRoot.querySelector('.mobile-menu-toggle');
        const closeDrawer = () => {
            navigationRoot.classList.remove('is-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
            mobileToggle.querySelector('span:last-child').textContent = 'Menu';
        };
        mobileToggle.addEventListener('click', () => {
            const isOpen = navigationRoot.classList.toggle('is-open');
            mobileToggle.setAttribute('aria-expanded', String(isOpen));
            mobileToggle.querySelector('span:last-child').textContent = isOpen ? 'Close' : 'Menu';
        });
        navigationRoot.querySelector('.sidebar-backdrop').addEventListener('click', closeDrawer);
        navigationRoot.querySelectorAll('.site-nav a').forEach(link => {
            link.addEventListener('click', event => {
                if (link.id === 'logout-btn') {
                    event.preventDefault();
                    logoutUser();
                    return;
                }
                closeDrawer();
            });
        });
        return;
    }

    document.body.classList.remove('has-sidebar', 'sidebar-collapsed');
    const siteNav = document.getElementById('site-nav');
    if (!siteNav) return;
    siteNav.innerHTML = user
        ? `<a href="journey.html">My Journey</a><a href="add-book.html">Add a book</a><a href="discover.html">Discover</a><a href="profile.html">My Profile</a><a href="lending.html">Lending</a><a href="#logout" class="nav-logout" id="logout-btn">Log out</a>`
        : `<a href="index.html" ${currentPage === 'index.html' ? 'aria-current="page"' : ''}>Home</a><a href="login.html" ${currentPage === 'login.html' ? 'aria-current="page"' : ''}>Sign in</a><a href="signup.html" ${currentPage === 'signup.html' ? 'aria-current="page"' : ''}>Create account</a>`;

    const menuToggle = document.querySelector('.menu-toggle');
    siteNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', event => {
            if (link.id === 'logout-btn') {
                event.preventDefault();
                logoutUser();
                return;
            }
            siteNav.classList.remove('open');
            menuToggle?.setAttribute('aria-expanded', 'false');
            if (menuToggle) menuToggle.textContent = 'Menu';
        });
    });
}

// --- Page Personalization ---
function personalizePages(user) {
    // Personalize greeting on journey.html
    const journeyGreeting = document.getElementById('user-greeting');
    if (journeyGreeting) {
        journeyGreeting.textContent = user.display_name || user.username || 'Reader';
    }

    // Personalize profile.html
    const profileHeading = document.getElementById('profile-heading');
    if (profileHeading) {
        profileHeading.textContent = `${user.display_name || user.username || 'Reader'}'s library`;
    }
    const profileMark = document.querySelector('.profile-mark');
    if (profileMark && (user.display_name || user.username)) {
        profileMark.textContent = (user.display_name || user.username).slice(0, 1).toUpperCase();
    }
}

function setupProfileEditor(user) {
    const dialog = document.getElementById('profile-account-dialog');
    const form = document.getElementById('profile-account-form');
    if (!dialog || !form) return;

    const message = document.getElementById('profile-account-message');
    const summary = document.getElementById('profile-account-summary');
    const displayNameInput = document.getElementById('profile-display-name');
    const usernameInput = document.getElementById('profile-username');
    const bioInput = document.getElementById('profile-bio');

    function updateProfileDisplay(profile) {
        const name = profile.display_name || profile.username || 'Reader';
        const heading = document.getElementById('profile-heading');
        const mark = document.querySelector('.profile-mark');
        if (heading) heading.textContent = `${name}'s library`;
        if (mark) mark.textContent = name.slice(0, 1).toUpperCase();
        if (summary) summary.textContent = `@${profile.username} · ${profile.email}`;
    }

    updateProfileDisplay(user);
    document.getElementById('profile-edit-account').addEventListener('click', () => {
        displayNameInput.value = user.display_name || '';
        usernameInput.value = user.username || '';
        bioInput.value = user.bio || '';
        message.textContent = '';
        dialog.showModal();
    });
    dialog.querySelector('[data-account-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-account-cancel]').addEventListener('click', () => dialog.close());

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const updates = {
            display_name: displayNameInput.value.trim(),
            username: usernameInput.value.trim(),
            bio: bioInput.value.trim()
        };
        if (!updates.display_name) {
            message.textContent = "Display name can't be empty.";
            displayNameInput.focus();
            return;
        }
        if (!/^[A-Za-z0-9_]{3,30}$/.test(updates.username)) {
            message.textContent = 'Username must be 3-30 letters, numbers or underscores.';
            usernameInput.focus();
            return;
        }
        submitButton.disabled = true;
        message.textContent = 'Saving your profile...';
        try {
            const result = await api('/api/me', { method: 'PUT', body: updates });
            Object.assign(user, result);
            updateProfileDisplay(user);
            dialog.close();
        } catch (error) {
            if (error.status === 401) {
                window.location.assign('login.html?next=profile.html');
                return;
            }
            console.error('Profile update error:', error);
            message.textContent = error.message || 'Could not save your profile. Please try again.';
        } finally {
            submitButton.disabled = false;
        }
    });
}

// --- Authentication Guard ---
async function enforceAuth() {
    const currentPage = getCurrentPage();
    const isProtected = PROTECTED_PAGES.includes(currentPage);
    const isAuthPage = PUBLIC_AUTH_PAGES.includes(currentPage);

    const user = await getMe();

    if (isProtected && !user) {
        const nextPage = `${currentPage}${['reader.html', 'book.html'].includes(currentPage) ? window.location.search : ''}`;
        window.location.replace(`login.html?next=${encodeURIComponent(nextPage)}`);
        return null;
    }

    if (isAuthPage && user) {
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next') || 'journey.html';
        window.location.replace(next);
        return user;
    }

    renderNavigation(user, currentPage);

    if (user) {
        personalizePages(user);
    }

    return user;
}

// Re-check authentication on page show (handles browser Back/Forward cache - bfcache)
window.addEventListener('pageshow', (event) => {
    const currentPage = getCurrentPage();
    if (PROTECTED_PAGES.includes(currentPage)) {
        getMe().then(user => {
            if (!user) {
                const nextPage = `${currentPage}${['reader.html', 'book.html'].includes(currentPage) ? window.location.search : ''}`;
                window.location.replace(`login.html?next=${encodeURIComponent(nextPage)}`);
            }
        });
    }
});

// --- UI Controls (Menu Drawer, Scroll Bar, Scroll Reveal) ---
const progressBar = document.querySelector('.progress-bar');
const publicMenuToggle = document.querySelector('.menu-toggle');
const publicSiteNav = document.querySelector('.site-header .site-nav');

if (publicMenuToggle && publicSiteNav) {
    publicMenuToggle.addEventListener('click', () => {
        const isOpen = publicSiteNav.classList.toggle('open');
        publicMenuToggle.setAttribute('aria-expanded', String(isOpen));
        publicMenuToggle.textContent = isOpen ? 'Close' : 'Menu';
    });
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

if (progressBar) {
    window.addEventListener('scroll', () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = `${scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0}%`;
    }, { passive: true });
}

// --- Login Form Handler ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    bindPasswordVisibility(loginForm);
    loginForm.addEventListener('input', clearAuthError);
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearAuthError();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('login-btn');

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            showAuthError('Please enter both your email address and password.');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
        }

        try {
            await api('/api/login', {
                method: 'POST',
                body: { identifier: email, password: password }
            });

            // Redirect to intended page or default to journey.html
            const params = new URLSearchParams(window.location.search);
            const next = params.get('next') || 'journey.html';
            window.location.replace(next);
        } catch (err) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Sign in <span aria-hidden="true">&rarr;</span>';
            }
            const msg = (err.message && err.message !== 'Failed to fetch')
                ? err.message
                : 'Could not connect to the server. Make sure the app is running and try again.';
            showAuthError(msg);
        }
    });
}

// --- Sign-up Form Handler ---
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    bindPasswordVisibility(signupForm);
    signupForm.addEventListener('input', clearAuthError);
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearAuthError();

        const name = (document.getElementById('name')?.value || '').trim();
        const username = (document.getElementById('username')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim().toLowerCase();
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirm-password')?.value || '';
        const submitBtn = document.getElementById('signup-btn');

        if (!name || !email || !password) {
            showAuthError('Please fill in your name, email address, and password.');
            return;
        }

        if (password.length < 8) {
            showAuthError('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            showAuthError('Passwords do not match. Please re-enter your password.');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';
        }

        try {
            await api('/api/signup', {
                method: 'POST',
                body: {
                    name: name,
                    display_name: name,
                    username: username || undefined,
                    email: email,
                    password: password
                }
            });

            // Redirect to intended page or journey.html
            const params = new URLSearchParams(window.location.search);
            const next = params.get('next') || 'journey.html';
            window.location.replace(next);
        } catch (err) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Create account <span>&#8599;</span>';
            }
            const msg = (err.message && err.message !== 'Failed to fetch')
                ? err.message
                : 'Could not connect to the server. Make sure the app is running and try again.';
            showAuthError(msg);
        }
    });
}

function setupCoverPickers(root, initialCovers = {}) {
    const pickers = Array.from(root.querySelectorAll('[data-cover-picker]')).map(picker => {
        const key = picker.dataset.coverKey;
        const input = picker.querySelector('.cover-picker-input');
        const preview = picker.querySelector('.cover-picker-preview img');
        const placeholder = picker.querySelector('.cover-picker-preview span');
        const removeButton = picker.querySelector('.cover-remove-button');
        const message = picker.querySelector('.cover-picker-message');
        let file = null;
        let url = initialCovers[key] || null;
        let objectUrl = null;

        function renderPreview() {
            const source = objectUrl || url;
            preview.hidden = !source;
            placeholder.hidden = Boolean(source);
            removeButton.disabled = !source;
            if (source) preview.src = source;
            else preview.removeAttribute('src');
        }

        input.addEventListener('change', () => {
            const selected = input.files[0];
            if (message) message.textContent = '';
            if (selected && selected.size > 5 * 1024 * 1024) {
                input.value = '';
                if (message) message.textContent = 'Choose an image that is 5 MB or smaller.';
                return;
            }
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            file = selected || null;
            objectUrl = file ? URL.createObjectURL(file) : null;
            url = file ? null : url;
            renderPreview();
        });

        removeButton.addEventListener('click', () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            file = null;
            objectUrl = null;
            url = null;
            input.value = '';
            if (message) message.textContent = '';
            renderPreview();
        });

        renderPreview();
        return {
            key,
            getFile: () => file,
            getUrl: () => url,
            setUrl(value) {
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                file = null;
                objectUrl = null;
                url = value;
                input.value = '';
                renderPreview();
            },
            reset(value) {
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                file = null;
                objectUrl = null;
                url = value || null;
                input.value = '';
                if (message) message.textContent = '';
                renderPreview();
            }
        };
    });

    return {
        reset(covers = {}) {
            pickers.forEach(picker => picker.reset(covers[picker.key]));
        },
        async getValues() {
            const results = await Promise.all(pickers.map(async picker => {
                if (!picker.getFile()) return [picker.key, picker.getUrl()];
                const formData = new FormData();
                formData.append('image', picker.getFile());
                const result = await api('/api/uploads/covers', { method: 'POST', body: formData });
                picker.setUrl(result.url);
                return [picker.key, result.url];
            }));
            return Object.fromEntries(results);
        }
    };
}

function deriveReadingStatus(endDate) {
    return endDate ? 'Finished' : 'Currently Reading';
}

function bindReadingStatusPreview(endDateInput, statusOutput) {
    const update = () => {
        statusOutput.textContent = deriveReadingStatus(endDateInput.value);
    };
    endDateInput.addEventListener('input', update);
    endDateInput.addEventListener('change', update);
    update();
    return update;
}

// --- Add Book Form Handler ---
const bookForm = document.querySelector('.book-form');
if (bookForm) {
    const statusEl = bookForm.querySelector('.form-status');
    const submitBtn = bookForm.querySelector('button[type="submit"]');
    const coverPickers = setupCoverPickers(bookForm);
    const createdEntryLink = document.getElementById('created-entry-link');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const visibilityInput = document.getElementById('visibility');
    const lendingInput = document.getElementById('available-for-lending');
    bindReadingStatusPreview(
        endDateInput,
        document.getElementById('reading-status-preview')
    );

    function validateReadingDates() {
        const invalidRange = startDateInput.value && endDateInput.value
            && endDateInput.value < startDateInput.value;
        endDateInput.setCustomValidity(invalidRange ? 'End date cannot be before start date.' : '');
        if (invalidRange) {
            statusEl.textContent = 'End date cannot be before start date.';
        } else if (statusEl.textContent === 'End date cannot be before start date.') {
            statusEl.textContent = '';
        }
    }

    function updateLendingAvailability() {
        const isPrivate = visibilityInput.value === 'private';
        lendingInput.disabled = isPrivate;
        if (isPrivate) lendingInput.checked = false;
    }

    startDateInput.addEventListener('input', validateReadingDates);
    startDateInput.addEventListener('change', validateReadingDates);
    endDateInput.addEventListener('input', validateReadingDates);
    endDateInput.addEventListener('change', validateReadingDates);
    visibilityInput.addEventListener('change', updateLendingAvailability);
    validateReadingDates();
    updateLendingAvailability();

    bookForm.addEventListener('submit', async event => {
        event.preventDefault();
        statusEl.textContent = '';
        createdEntryLink.hidden = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving your entry...';

        try {
            const coverValues = await coverPickers.getValues();
            const result = await api('/api/books', {
                method: 'POST',
                body: {
                    title: document.getElementById('title').value.trim(),
                    author: document.getElementById('author').value.trim(),
                    start_date: document.getElementById('start-date').value || null,
                    end_date: document.getElementById('end-date').value || null,
                    reflection: document.getElementById('reflection').value.trim() || null,
                    visibility: document.getElementById('visibility').value,
                    available_for_lending: document.getElementById('available-for-lending').checked,
                    ...coverValues
                }
            });
            statusEl.textContent = 'Your book has been saved and added to your journey.';
            createdEntryLink.href = `book.html?id=${encodeURIComponent(result.entry_id)}`;
            createdEntryLink.textContent = 'View this entry';
            createdEntryLink.hidden = false;
            submitBtn.textContent = 'Entry saved';
        } catch (error) {
            if (error.status === 401) {
                window.location.assign('login.html?next=add-book.html');
                return;
            }
            console.error('Add book error:', error);
            if (error.message === 'Failed to fetch') {
                statusEl.textContent = 'Could not connect to the server. Your book was not saved. Check your connection and try again.';
            } else if (error.message === 'Request failed') {
                statusEl.textContent = 'The server could not save your book. Please try again.';
            } else {
                statusEl.textContent = error.message || 'Could not save your book. Please try again.';
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Keep this entry';
        }
    });
}

// --- Discover Page Books Loader ---
async function loadDiscoverBooks(user) {
    const track = document.getElementById('discover-grid');
    if (!track) return;
    const searchInput = document.getElementById('discover-search');
    const availableInput = document.getElementById('discover-available-only');
    const resultCount = document.getElementById('discover-result-count');
    const pagination = document.getElementById('discover-pagination');
    const previousButton = document.getElementById('discover-previous');
    const nextButton = document.getElementById('discover-next');
    const pageLabel = document.getElementById('discover-page-label');
    const dialog = document.getElementById('discover-detail-dialog');
    const booksById = new Map();
    const pageSize = 12;
    let page = 0;
    let hasNextPage = false;
    let loadTimer;
    let loading = false;
    let requestSequence = 0;

    function setCover(image, fallback, url, title) {
        image.hidden = true;
        fallback.hidden = false;
        fallback.textContent = title || 'The Written Leaf';
        image.onload = null;
        image.onerror = null;
        if (!url) return;

        try {
            const coverUrl = new URL(url, window.location.href);
            if (!['http:', 'https:'].includes(coverUrl.protocol)) return;
            image.alt = `Cover of ${title || 'book'}`;
            image.onload = () => {
                image.hidden = false;
                fallback.hidden = true;
            };
            image.onerror = () => {
                image.hidden = true;
                fallback.hidden = false;
            };
            image.src = coverUrl.href;
        } catch {
            image.hidden = true;
        }
    }

    function syncLikes(book) {
        const liked = Boolean(book.liked_by_me);
        track.querySelectorAll(`[data-entry-id="${book.entry_id}"] .discover-like`).forEach(button => {
            button.setAttribute('aria-pressed', String(liked));
            button.setAttribute('aria-label', liked ? 'Unlike this book' : 'Like this book');
            button.classList.toggle('is-liked', liked);
            button.querySelector('.discover-heart').textContent = liked ? '\u2665' : '\u2661';
            button.querySelector('.like-state').textContent = liked ? 'Liked' : 'Like';
            button.querySelector('.like-count').textContent = String(book.like_count);
        });
        const detailLike = document.getElementById('discover-detail-like');
        if (dialog.dataset.entryId === String(book.entry_id)) {
            detailLike.setAttribute('aria-pressed', String(liked));
            detailLike.setAttribute('aria-label', liked ? 'Unlike this book' : 'Like this book');
            detailLike.classList.toggle('is-liked', liked);
            detailLike.querySelector('.discover-heart').textContent = liked ? '\u2665' : '\u2661';
            detailLike.querySelector('.like-state').textContent = liked ? 'Liked' : 'Like';
            detailLike.querySelector('.like-count').textContent = String(book.like_count);
        }
    }

    function renderCard(book) {
        booksById.set(String(book.entry_id), book);
        const card = document.createElement('article');
        card.className = 'discover-card';
        card.dataset.entryId = String(book.entry_id);

        const open = document.createElement('a');
        open.className = 'discover-card-open';
        open.href = `book.html?id=${encodeURIComponent(book.entry_id)}`;
        open.setAttribute('aria-label', `View ${book.title || 'book'} details`);

        const cover = document.createElement('div');
        cover.className = 'discover-cover has-fallback';
        cover.setAttribute('role', 'img');
        cover.setAttribute('aria-label', `Cover of ${book.title || 'book'}`);
        const image = document.createElement('img');
        image.className = 'discover-cover-image';
        image.loading = 'lazy';
        const fallback = document.createElement('span');
        fallback.className = 'discover-cover-fallback';
        setCover(image, fallback, book.front_cover, book.title);
        fallback.textContent = '\u2767';
        cover.append(image, fallback);

        const details = document.createElement('div');
        details.className = 'discover-card-details';
        const title = document.createElement('h2');
        title.textContent = book.title || 'Untitled book';
        details.append(title);
        open.append(cover, details);

        const reader = document.createElement('a');
        reader.className = 'discover-reader';
        reader.href = `reader.html?username=${encodeURIComponent(book.username || '')}`;
        reader.textContent = `@${book.username || 'reader'}`;

        const actions = document.createElement('div');
        actions.className = 'discover-card-actions';
        const likeButton = document.createElement('button');
        likeButton.className = `discover-like${book.liked_by_me ? ' is-liked' : ''}`;
        likeButton.type = 'button';
        likeButton.dataset.discoverAction = 'like';
        likeButton.dataset.entryId = String(book.entry_id);
        likeButton.setAttribute('aria-pressed', String(Boolean(book.liked_by_me)));
        likeButton.setAttribute('aria-label', book.liked_by_me ? 'Unlike this book' : 'Like this book');
        likeButton.innerHTML = `<span class="discover-heart" aria-hidden="true">${book.liked_by_me ? '&#9829;' : '&#9825;'}</span><span class="like-state">${book.liked_by_me ? 'Liked' : 'Like'}</span><span class="like-count"></span>`;
        likeButton.querySelector('.like-count').textContent = String(Number(book.like_count) || 0);
        actions.appendChild(likeButton);

        if (book.available_for_lending && Number(book.user_id) !== Number(user.user_id)) {
            if (book.request_status) {
                const requestLink = document.createElement('a');
                requestLink.className = 'discover-borrow request-sent';
                requestLink.href = 'lending.html';
                requestLink.textContent = `Request ${book.request_status} · View in Lending`;
                actions.appendChild(requestLink);
            } else {
                const borrowButton = document.createElement('button');
                borrowButton.className = 'discover-borrow';
                borrowButton.type = 'button';
                borrowButton.dataset.discoverAction = 'borrow';
                borrowButton.dataset.entryId = String(book.entry_id);
                borrowButton.textContent = 'Request to borrow';
                actions.appendChild(borrowButton);
            }
        }

        const quickViewButton = document.createElement('button');
        quickViewButton.className = 'discover-quick-view';
        quickViewButton.type = 'button';
        quickViewButton.dataset.discoverAction = 'detail';
        quickViewButton.dataset.entryId = String(book.entry_id);
        quickViewButton.textContent = 'Quick view';
        actions.appendChild(quickViewButton);

        const status = document.createElement('p');
        status.className = 'discover-action-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        card.append(open, reader, actions, status);
        track.appendChild(card);
    }

    function openDetails(book) {
        dialog.dataset.entryId = String(book.entry_id);
        document.getElementById('discover-detail-title').textContent = book.title || 'Untitled book';
        document.getElementById('discover-detail-author').textContent = book.author || 'Unknown author';
        const readerLink = document.getElementById('discover-detail-reader');
        readerLink.href = `reader.html?username=${encodeURIComponent(book.username || '')}`;
        readerLink.textContent = `@${book.username || 'reader'}`;
        setCover(
            document.getElementById('discover-detail-front-image'),
            document.getElementById('discover-detail-front-fallback'),
            book.front_cover,
            book.title
        );
        const backWrap = document.getElementById('discover-detail-back-wrap');
        backWrap.hidden = !book.back_cover;
        if (book.back_cover) {
            setCover(
                document.getElementById('discover-detail-back-image'),
                document.getElementById('discover-detail-back-fallback'),
                book.back_cover,
                `${book.title || 'Book'} back cover`
            );
        }

        const dates = document.getElementById('discover-detail-dates');
        dates.hidden = !book.start_date && !book.end_date;
        document.getElementById('discover-detail-start').textContent = book.start_date || 'Not shared';
        document.getElementById('discover-detail-end').textContent = book.end_date || 'Not finished';
        const reflection = document.getElementById('discover-detail-reflection-wrap');
        reflection.hidden = !String(book.reflection || '').trim();
        document.getElementById('discover-detail-reflection').textContent = book.reflection || '';

        const likeButton = document.getElementById('discover-detail-like');
        likeButton.dataset.discoverAction = 'like';
        likeButton.dataset.entryId = String(book.entry_id);
        const borrowButton = document.getElementById('discover-detail-borrow');
        borrowButton.dataset.discoverAction = 'borrow';
        borrowButton.dataset.entryId = String(book.entry_id);
        borrowButton.hidden = !book.available_for_lending
            || Number(book.user_id) === Number(user.user_id)
            || Boolean(book.request_status);
        const requestLink = document.getElementById('discover-detail-request-link');
        requestLink.hidden = !book.request_status;
        if (book.request_status) {
            requestLink.textContent = `Request ${book.request_status} · View in Lending`;
        }
        document.getElementById('discover-detail-status').textContent = book.request_status
            ? `Your request status is ${book.request_status}.`
            : '';
        syncLikes(book);
        dialog.showModal();
    }

    async function loadBooks(targetPage = 0) {
        if (targetPage !== 0 && loading) return;
        const currentRequest = ++requestSequence;
        loading = true;
        page = targetPage;
        previousButton.disabled = true;
        nextButton.disabled = true;
        track.setAttribute('aria-busy', 'true');
        booksById.clear();
        track.replaceChildren();
        resultCount.textContent = '';
        pagination.hidden = true;
        const loadingMessage = document.createElement('p');
        loadingMessage.className = 'discover-status';
        loadingMessage.textContent = 'Gathering books for the shelf...';
        track.appendChild(loadingMessage);

        const params = new URLSearchParams({
            limit: String(pageSize),
            offset: String(page * pageSize),
            q: searchInput.value.trim()
        });
        if (availableInput.checked) params.set('available', '1');

        try {
            const books = await api(`/api/discover?${params}`);
            if (currentRequest !== requestSequence) return;
            if (!Array.isArray(books)) throw new Error('The server returned an unexpected book list.');
            track.replaceChildren();
            books.forEach(book => {
                book.request_status = book.request_status || null;
                renderCard(book);
            });
            const visibleCount = track.querySelectorAll('.discover-card').length;
            resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'book' : 'books'} on this page`;
            if (visibleCount === 0) {
                const empty = document.createElement('p');
                empty.className = 'discover-status';
                empty.textContent = searchInput.value.trim() || availableInput.checked
                    ? 'No books match those choices. Try another search or filter.'
                    : 'No public books to discover yet. Check back as readers share their shelves.';
                track.appendChild(empty);
            }
            hasNextPage = books.length === pageSize;
            previousButton.disabled = page === 0;
            nextButton.disabled = !hasNextPage;
            pageLabel.textContent = `Page ${page + 1}`;
            pagination.hidden = page === 0 && !hasNextPage;
        } catch (error) {
            if (currentRequest !== requestSequence) return;
            console.error('Discover error:', error);
            if (error.status === 401) {
                window.location.assign('login.html?next=discover.html');
            } else {
                track.replaceChildren();
                const message = document.createElement('p');
                message.className = 'discover-status discover-error';
                message.textContent = 'Could not load books. Please check the server and try again.';
                track.appendChild(message);
                pagination.hidden = true;
            }
        } finally {
            if (currentRequest === requestSequence) {
                loading = false;
                track.setAttribute('aria-busy', 'false');
            }
        }
    }

    async function handleDiscoverAction(event) {
        const target = event.target.closest('[data-discover-action]');
        if (!target || (!track.contains(target) && !dialog.contains(target))) return;
        const action = target.dataset.discoverAction;
        const book = booksById.get(target.dataset.entryId);
        if (!book) return;
        if (action === 'detail') {
            event.preventDefault();
            openDetails(book);
            return;
        }
        if (target.disabled) return;

        const card = track.querySelector(`.discover-card[data-entry-id="${book.entry_id}"]`);
        const status = dialog.contains(target)
            ? document.getElementById('discover-detail-status')
            : card && card.querySelector('.discover-action-status');
        target.disabled = true;
        if (status) status.textContent = '';
        try {
            if (action === 'like') {
                const result = await api(`/api/books/${book.entry_id}/like`, { method: 'POST' });
                if (typeof result.liked !== 'boolean' || !Number.isFinite(Number(result.like_count))) {
                    throw new Error('The server returned an unexpected like response.');
                }
                book.liked_by_me = result.liked;
                book.like_count = Number(result.like_count);
                syncLikes(book);
                target.classList.add('like-feedback');
                window.setTimeout(() => target.classList.remove('like-feedback'), 450);
            } else if (action === 'borrow') {
                const result = await api('/api/lending', {
                    method: 'POST',
                    body: { entry_id: Number(book.entry_id) }
                });
                if (!['pending', 'accepted'].includes(result.status)) {
                    throw new Error('The server returned an unexpected lending request status.');
                }
                book.request_status = result.status;
                if (card) renderCardReplacement(card, book);
                document.getElementById('discover-detail-borrow').hidden = true;
                const requestLink = document.getElementById('discover-detail-request-link');
                requestLink.textContent = `Request ${book.request_status} · View in Lending`;
                requestLink.hidden = false;
                if (status) status.textContent = `Your request was sent. Status: ${book.request_status}.`;
            }
        } catch (error) {
            if (error.status === 401) {
                window.location.assign('login.html?next=discover.html');
                return;
            }
            console.error(`Discover ${action} error:`, error);
            if (status) status.textContent = error.message || 'Could not complete this action. Please try again.';
        } finally {
            target.disabled = false;
        }
    }

    track.addEventListener('click', handleDiscoverAction);
    dialog.addEventListener('click', handleDiscoverAction);

    function renderCardReplacement(card, book) {
        const replacement = document.createElement('a');
        replacement.className = 'discover-borrow request-sent';
        replacement.href = 'lending.html';
        replacement.textContent = `Request ${book.request_status} · View in Lending`;
        card.querySelector('[data-discover-action="borrow"]')?.replaceWith(replacement);
    }

    dialog.querySelector('.discover-dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    previousButton.addEventListener('click', () => loadBooks(page - 1));
    nextButton.addEventListener('click', () => loadBooks(page + 1));
    searchInput.addEventListener('input', () => {
        window.clearTimeout(loadTimer);
        loadTimer = window.setTimeout(() => loadBooks(), 250);
    });
    availableInput.addEventListener('change', () => loadBooks());
    loadBooks();
}

async function loadReaderProfile() {
    const page = document.getElementById('reader-profile');
    if (!page) return;

    const status = document.getElementById('reader-profile-status');
    const username = new URLSearchParams(window.location.search).get('username');
    if (!username) {
        status.textContent = 'This reader profile could not be found.';
        return;
    }

    try {
        const reader = await api(`/api/users/${encodeURIComponent(username)}`);
        document.getElementById('reader-profile-name').textContent = reader.display_name || reader.username;
        document.getElementById('reader-profile-username').textContent = `@${reader.username}`;
        document.getElementById('reader-profile-bio').textContent = reader.bio || 'This reader has not added a bio yet.';
        document.getElementById('reader-profile-count').textContent =
            `${reader.public_entry_count} public ${reader.public_entry_count === 1 ? 'book' : 'books'}`;
        status.hidden = true;
        page.hidden = false;
    } catch (error) {
        if (error.status === 401) {
            const nextPage = `reader.html?username=${encodeURIComponent(username)}`;
            window.location.assign(`login.html?next=${encodeURIComponent(nextPage)}`);
            return;
        }
        console.error('Reader profile error:', error);
        status.textContent = error.status === 404
            ? 'This reader profile could not be found.'
            : 'Could not load this reader profile. Please try again.';
    }
}

// --- Profile Library & Incoming Lending Requests ---
async function loadProfileBooks() {
    const shelf = document.getElementById('profile-books');
    const count = document.getElementById('library-count');
    if (!shelf) return;

    const dialog = document.getElementById('profile-edit-dialog');
    const editForm = document.getElementById('profile-edit-form');
    const editMessage = document.getElementById('profile-edit-message');
    let books = [];
    let activeBook = null;

    function renderBooks() {
        if (count) count.textContent = String(books.length);
        if (books.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'profile-status';
            empty.textContent = 'Your bookshelf is waiting for its first book.';
            shelf.replaceChildren(empty);
            return;
        }

        shelf.replaceChildren();
        books.forEach(book => {
            const card = document.createElement('article');
            card.className = 'profile-book-card';
            card.dataset.entryId = String(book.entry_id);
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-haspopup', 'dialog');
            card.setAttribute('aria-label', `Edit ${book.title || 'book'} by ${book.author || 'unknown author'}`);

            const cover = document.createElement('div');
            cover.className = 'profile-book-cover has-fallback';
            const fallback = document.createElement('span');
            fallback.className = 'profile-cover-fallback';
            fallback.textContent = book.title || 'Untitled book';
            cover.appendChild(fallback);

            if (typeof book.front_cover === 'string' && book.front_cover.trim()) {
                try {
                    const coverUrl = new URL(book.front_cover, window.location.href);
                    if (coverUrl.protocol === 'http:' || coverUrl.protocol === 'https:') {
                        const image = document.createElement('img');
                        image.src = coverUrl.href;
                        image.alt = `Cover of ${book.title || 'book'}`;
                        image.loading = 'lazy';
                        image.addEventListener('load', () => cover.classList.remove('has-fallback'), { once: true });
                        image.addEventListener('error', () => image.remove(), { once: true });
                        cover.appendChild(image);
                    }
                } catch {
                    cover.classList.add('has-fallback');
                }
            }

            const visibility = document.createElement('p');
            visibility.className = `profile-book-visibility profile-book-visibility-${book.visibility === 'private' ? 'private' : 'public'}`;
            const dot = document.createElement('span');
            dot.className = 'profile-book-visibility-dot';
            dot.setAttribute('aria-hidden', 'true');
            visibility.append(dot, document.createTextNode(book.visibility === 'private' ? 'Private' : 'Public'));

            card.append(cover, visibility);
            shelf.appendChild(card);
        });
    }

    function openEditor(book) {
        activeBook = book;
        document.getElementById('profile-edit-title').value = book.title || '';
        document.getElementById('profile-edit-author').value = book.author || '';
        document.getElementById('profile-edit-cover').value = book.front_cover || '';
        document.getElementById('profile-edit-start').value = book.start_date || '';
        document.getElementById('profile-edit-end').value = book.end_date || '';
        document.getElementById('profile-edit-visibility').value = book.visibility || 'private';
        document.getElementById('profile-edit-reflection').value = book.reflection || '';
        document.getElementById('profile-edit-lending').checked = Boolean(book.available_for_lending);
        editMessage.textContent = '';
        dialog.showModal();
    }

    shelf.setAttribute('aria-busy', 'true');
    shelf.addEventListener('click', event => {
        const card = event.target.closest('.profile-book-card');
        if (!card) return;
        const book = books.find(entry => entry.entry_id === Number(card.dataset.entryId));
        if (book) openEditor(book);
    });
    shelf.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const card = event.target.closest('.profile-book-card');
        if (!card) return;
        event.preventDefault();
        const book = books.find(entry => entry.entry_id === Number(card.dataset.entryId));
        if (book) openEditor(book);
    });

    dialog.querySelector('[data-profile-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-profile-cancel]').addEventListener('click', () => dialog.close());
    editForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!activeBook) return;

        const submitButton = editForm.querySelector('button[type="submit"]');
        const visibility = document.getElementById('profile-edit-visibility').value;
        const updatedBook = {
            title: document.getElementById('profile-edit-title').value.trim(),
            author: document.getElementById('profile-edit-author').value.trim(),
            front_cover: document.getElementById('profile-edit-cover').value.trim() || null,
            back_cover: activeBook.back_cover || null,
            start_date: document.getElementById('profile-edit-start').value || null,
            end_date: document.getElementById('profile-edit-end').value || null,
            reflection: document.getElementById('profile-edit-reflection').value.trim() || null,
            visibility,
            available_for_lending: document.getElementById('profile-edit-lending').checked && visibility === 'public'
        };

        if (!updatedBook.title || !updatedBook.author) {
            editMessage.textContent = 'Title and author are required.';
            return;
        }
        if (updatedBook.start_date && updatedBook.end_date && updatedBook.end_date < updatedBook.start_date) {
            editMessage.textContent = 'Finished date cannot be before the start date.';
            return;
        }

        submitButton.disabled = true;
        editMessage.textContent = 'Saving your changes...';
        try {
            await api(`/api/books/${activeBook.entry_id}`, { method: 'PUT', body: updatedBook });
            books = books.map(book => book.entry_id === activeBook.entry_id
                ? { ...book, ...updatedBook }
                : book
            );
            renderBooks();
            dialog.close();
            shelf.focus();
        } catch (error) {
            if (error.status === 401) {
                window.location.assign('login.html?next=profile.html');
                return;
            }
            console.error('Profile book update error:', error);
            editMessage.textContent = error.message || 'Could not save your changes. Please try again.';
        } finally {
            submitButton.disabled = false;
        }
    });

    try {
        books = await api('/api/books');
        if (!Array.isArray(books)) {
            throw new Error('The server returned an unexpected book list.');
        }

        renderBooks();
    } catch (error) {
        console.error('Profile books error:', error);
        if (error.status === 401) {
            window.location.assign('login.html?next=profile.html');
            return;
        }
        if (count) count.textContent = '—';
        const message = document.createElement('p');
        message.className = 'profile-status profile-error';
        message.textContent = 'Could not load your bookshelf. Please try again.';
        shelf.replaceChildren(message);
    } finally {
        shelf.setAttribute('aria-busy', 'false');
    }
}

// --- Lending Page Availability & Requests ---
async function loadOwnedLendingBooks() {
    const list = document.getElementById('owned-lending-books');
    if (!list) return;

    list.setAttribute('aria-busy', 'true');
    try {
        const books = await api('/api/books');
        if (!Array.isArray(books)) {
            throw new Error('The server returned an unexpected book list.');
        }

        if (books.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'lending-status';
            empty.textContent = 'Add a book to your reading journey before offering one to lend.';
            list.replaceChildren(empty);
            return;
        }

        list.replaceChildren();
        books.forEach(book => {
            const card = document.createElement('article');
            card.className = 'owned-lending-book';

            const details = document.createElement('div');
            details.className = 'owned-lending-details';
            const title = document.createElement('h3');
            title.textContent = book.title || 'Untitled book';
            const author = document.createElement('p');
            author.textContent = book.author || 'Unknown author';
            const visibility = document.createElement('span');
            visibility.className = `lending-visibility lending-visibility-${book.visibility}`;
            visibility.textContent = book.visibility === 'public' ? 'Public book' : 'Private book';
            details.append(title, author, visibility);

            const controls = document.createElement('div');
            controls.className = 'owned-lending-controls';
            const state = document.createElement('span');
            state.className = 'lending-availability-state';
            state.textContent = book.visibility !== 'public'
                ? 'Make public to offer'
                : book.available_for_lending ? 'Available to borrow' : 'Not available';

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'lending-availability-toggle';
            toggle.dataset.entryId = String(book.entry_id);
            toggle.dataset.available = String(Boolean(book.available_for_lending));
            toggle.textContent = book.available_for_lending ? 'Make unavailable' : 'Make available';
            if (book.visibility !== 'public') {
                toggle.disabled = true;
                toggle.title = 'Private books cannot be offered for lending. Make this book public first.';
            }
            controls.append(state, toggle);

            const message = document.createElement('p');
            message.className = 'lending-book-message';
            message.setAttribute('aria-live', 'polite');
            card.append(details, controls, message);
            list.appendChild(card);
        });
    } catch (error) {
        console.error('Lending availability error:', error);
        if (error.status === 401) {
            window.location.assign('login.html?next=lending.html');
            return;
        }
        const message = document.createElement('p');
        message.className = 'lending-status lending-error';
        message.textContent = 'Could not load your books. Please try again.';
        list.replaceChildren(message);
    } finally {
        list.setAttribute('aria-busy', 'false');
    }
}

function renderLendingRequestList(list, count, requests, direction) {
    if (count) count.textContent = String(requests.length);
    if (requests.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'lending-status';
        empty.textContent = direction === 'incoming'
            ? 'No one has requested to borrow your books yet.'
            : 'You have not requested to borrow a book yet.';
        list.replaceChildren(empty);
        return;
    }

    list.replaceChildren();
    requests.forEach(request => {
        const card = document.createElement('article');
        card.className = 'incoming-request';

        const book = document.createElement('div');
        book.className = 'incoming-request-book';
        const title = document.createElement('h3');
        title.textContent = request.title || 'Untitled book';
        const author = document.createElement('p');
        author.textContent = request.author || 'Unknown author';
        book.append(title, author);

        const reader = document.createElement('p');
        reader.className = 'incoming-request-reader';
        reader.textContent = direction === 'incoming'
            ? `Requested by ${request.borrower_name || request.borrower_username || 'A reader'} (@${request.borrower_username || 'reader'})`
            : `Owner: ${request.owner_name || request.owner_username || 'Reader'} (@${request.owner_username || 'reader'})`;

        const response = document.createElement('div');
        response.className = 'incoming-request-response';
        const status = document.createElement('span');
        status.className = `request-status request-status-${request.status}`;
        status.textContent = request.status;
        response.appendChild(status);

        let actions = [];
        if (direction === 'incoming' && request.status === 'pending') actions = ['accept', 'decline'];
        if (direction === 'incoming' && request.status === 'accepted') actions = ['complete'];
        if (direction === 'outgoing' && ['pending', 'accepted'].includes(request.status)) actions = ['cancel'];
        if (actions.length) {
            const buttons = document.createElement('div');
            buttons.className = 'request-actions';
            actions.forEach(action => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `request-action request-action-${action}`;
                button.dataset.requestId = String(request.request_id);
                button.dataset.action = action;
                button.textContent = action === 'complete' ? 'Mark returned' : action[0].toUpperCase() + action.slice(1);
                buttons.appendChild(button);
            });
            response.appendChild(buttons);
        }

        const message = document.createElement('p');
        message.className = 'request-message';
        message.setAttribute('aria-live', 'polite');
        card.append(book, reader, response, message);
        list.appendChild(card);
    });
}

async function loadLendingRequests() {
    const incomingList = document.getElementById('incoming-requests');
    const outgoingList = document.getElementById('outgoing-requests');
    if (!incomingList || !outgoingList) return;

    incomingList.setAttribute('aria-busy', 'true');
    outgoingList.setAttribute('aria-busy', 'true');
    try {
        const lending = await api('/api/lending');
        if (!lending || !Array.isArray(lending.incoming) || !Array.isArray(lending.outgoing)) {
            throw new Error('The server returned an unexpected lending response.');
        }
        renderLendingRequestList(incomingList, document.getElementById('incoming-count'), lending.incoming, 'incoming');
        renderLendingRequestList(outgoingList, document.getElementById('outgoing-count'), lending.outgoing, 'outgoing');
    } catch (error) {
        console.error('Lending requests error:', error);
        if (error.status === 401) {
            window.location.assign('login.html?next=lending.html');
            return;
        }
        [incomingList, outgoingList].forEach(list => {
            const message = document.createElement('p');
            message.className = 'lending-status lending-error';
            message.textContent = 'Could not load requests. Please try again.';
            list.replaceChildren(message);
        });
    } finally {
        incomingList.setAttribute('aria-busy', 'false');
        outgoingList.setAttribute('aria-busy', 'false');
    }
}

function bindLendingActions() {
    const books = document.getElementById('owned-lending-books');
    const requests = document.querySelector('.lending-request-groups');

    if (books) {
        books.addEventListener('click', async event => {
            const button = event.target.closest('button.lending-availability-toggle');
            if (!button || !books.contains(button) || button.disabled) return;
            const card = button.closest('.owned-lending-book');
            const message = card.querySelector('.lending-book-message');
            button.disabled = true;
            message.textContent = '';

            try {
                const entry = await api(`/api/books/${button.dataset.entryId}`);
                const available = button.dataset.available !== 'true';
                await api(`/api/books/${button.dataset.entryId}`, {
                    method: 'PUT',
                    body: {
                        title: entry.title,
                        author: entry.author,
                        front_cover: entry.front_cover,
                        back_cover: entry.back_cover,
                        start_date: entry.start_date,
                        end_date: entry.end_date,
                        reflection: entry.reflection,
                        visibility: entry.visibility,
                        available_for_lending: available
                    }
                });
                await loadOwnedLendingBooks();
            } catch (error) {
                if (error.status === 401) {
                    window.location.assign('login.html?next=lending.html');
                    return;
                }
                console.error('Lending availability update error:', error);
                message.textContent = error.message || 'Could not update availability. Please try again.';
                button.disabled = false;
            }
        });
    }

    if (requests) {
        requests.addEventListener('click', async event => {
            const button = event.target.closest('button[data-action][data-request-id]');
            if (!button || !requests.contains(button) || button.disabled) return;
            const card = button.closest('.incoming-request');
            const message = card.querySelector('.request-message');
            button.disabled = true;
            message.textContent = '';

            try {
                await api(`/api/lending/${button.dataset.requestId}`, {
                    method: 'PATCH',
                    body: { action: button.dataset.action }
                });
                await loadLendingRequests();
            } catch (error) {
                if (error.status === 401) {
                    window.location.assign('login.html?next=lending.html');
                    return;
                }
                console.error('Lending request update error:', error);
                message.textContent = error.message || 'Could not update this request. Please try again.';
                button.disabled = false;
            }
        });
    }
}

// --- Journey Page Dynamic Books Loader ---
async function loadJourneyBooks() {
    const shelf = document.getElementById('book-shelf');
    if (!shelf) return;
    const message = document.getElementById('journey-message');
    const count = document.getElementById('journey-book-count');
    const empty = document.getElementById('journey-empty');
    const emptyTitle = document.getElementById('journey-empty-title');
    const emptyCopy = document.getElementById('journey-empty-copy');
    const filters = document.querySelectorAll('[data-visibility-filter]');
    const searchInput = document.getElementById('journey-search');
    let books = [];
    let activeFilter = 'all';

    function renderBooks() {
        const searchTerm = searchInput.value.trim().toLocaleLowerCase();
        const visibleBooks = books.filter(book => {
            const matchesVisibility = activeFilter === 'all' || book.visibility === activeFilter;
            const matchesSearch = `${book.title} ${book.author}`.toLocaleLowerCase().includes(searchTerm);
            return matchesVisibility && matchesSearch;
        });
        shelf.replaceChildren();
        count.textContent = `${books.length} ${books.length === 1 ? 'book' : 'books'} in your collection`;

        if (books.length === 0 || visibleBooks.length === 0) {
            empty.hidden = false;
            if (books.length === 0) {
                emptyTitle.textContent = 'Your bookshelf is waiting.';
                emptyCopy.textContent = 'Add the first book you would like to remember.';
                empty.querySelector('.button').hidden = false;
            } else if (searchTerm) {
                emptyTitle.textContent = 'No books found.';
                emptyCopy.textContent = 'Try a different title or author, or choose another visibility filter.';
                empty.querySelector('.button').hidden = true;
            } else {
                emptyTitle.textContent = `No ${activeFilter} books just yet.`;
                emptyCopy.textContent = 'Choose another shelf or add a book to your journey.';
                empty.querySelector('.button').hidden = false;
            }
            message.textContent = '';
            message.hidden = true;
            return;
        }

        empty.hidden = true;
        message.textContent = '';
        message.hidden = true;

        visibleBooks.forEach(book => {
            const card = document.createElement('a');
            card.className = 'journey-book';
            card.href = `book.html?id=${encodeURIComponent(book.entry_id)}`;
            card.setAttribute('aria-label', `View ${book.title} by ${book.author}`);

            const cover = document.createElement('div');
            cover.className = 'journey-cover has-no-cover';
            cover.setAttribute('role', 'img');
            cover.setAttribute('aria-label', `Cover of ${book.title || 'book'}`);

            const fallback = document.createElement('span');
            fallback.className = 'journey-cover-fallback';
            fallback.textContent = book.title || 'Untitled book';
            cover.appendChild(fallback);

            if (book.front_cover) {
                try {
                    const coverUrl = new URL(book.front_cover, window.location.href);
                    if (coverUrl.protocol === 'http:' || coverUrl.protocol === 'https:') {
                        const image = document.createElement('img');
                        image.className = 'journey-cover-image';
                        image.alt = `Cover of ${book.title || 'book'}`;
                        image.loading = 'lazy';
                        image.src = coverUrl.href;
                        image.addEventListener('load', () => cover.classList.remove('has-no-cover'), { once: true });
                        image.addEventListener('error', () => {
                            image.remove();
                            cover.classList.add('has-no-cover');
                        }, { once: true });
                        cover.appendChild(image);
                    }
                } catch { cover.classList.add('has-no-cover'); }
            }

            const cardDetails = document.createElement('div');
            cardDetails.className = 'journey-book-details';
            const title = document.createElement('h3');
            title.textContent = book.title || 'Untitled book';
            const author = document.createElement('p');
            author.className = 'journey-book-author';
            author.textContent = book.author || 'Unknown author';

            const visibility = document.createElement('span');
            visibility.className = `entry-visibility entry-visibility-${book.visibility === 'public' ? 'public' : 'private'}`;
            visibility.textContent = book.visibility === 'public' ? 'Public' : 'Private';
            const readingStatus = document.createElement('span');
            readingStatus.className = 'journey-reading-status';
            readingStatus.textContent = deriveReadingStatus(book.end_date);
            cardDetails.append(title, author, visibility);
            cardDetails.appendChild(readingStatus);
            card.append(cover, cardDetails);
            shelf.appendChild(card);
        });
    }

    filters.forEach(button => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.visibilityFilter;
            filters.forEach(filter => {
                const selected = filter === button;
                filter.classList.toggle('is-active', selected);
                filter.setAttribute('aria-pressed', String(selected));
            });
            renderBooks();
        });
    });
    searchInput.addEventListener('input', renderBooks);

    try {
        const result = await api('/api/books');
        if (!Array.isArray(result)) throw new Error('The server returned an invalid book list.');
        books = result;
        renderBooks();
    } catch (error) {
        if (error.status === 401) {
            window.location.assign('login.html?next=journey.html');
            return;
        }
        empty.hidden = true;
        count.textContent = '';
        shelf.replaceChildren();
        message.textContent = error.message || 'Could not load your books. Please refresh the page to try again.';
        message.hidden = false;
    }
}

function formatBookDate(value) {
    if (!value) return 'Not recorded';
    const [year, month, day] = value.split('-').map(Number);
    const dateValue = new Date(year, month - 1, day);
    return Number.isNaN(dateValue.getTime())
        ? value
        : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(dateValue);
}

async function loadBookDetail(user) {
    const detail = document.getElementById('book-detail');
    if (!detail) return;

    const status = document.getElementById('book-detail-status');
    const editForm = document.getElementById('book-detail-edit');
    const actionMessage = document.getElementById('book-detail-action-message');
    const editMessage = document.getElementById('book-detail-edit-message');
    const editEndDate = document.getElementById('edit-end-date');
    const editStatusPreview = document.getElementById('edit-reading-status-preview');
    const updateEditStatus = bindReadingStatusPreview(editEndDate, editStatusPreview);
    const entryId = Number(new URLSearchParams(window.location.search).get('id'));
    const coverPickers = setupCoverPickers(editForm);
    let book;

    function renderCover(imageId, fallbackId, url, title) {
        const image = document.getElementById(imageId);
        const fallback = document.getElementById(fallbackId);
        let safeUrl = null;
        if (url) {
            try {
                const candidate = new URL(url, window.location.href);
                if (candidate.protocol === 'http:' || candidate.protocol === 'https:') safeUrl = candidate.href;
            } catch {}
        }
        fallback.textContent = title || 'Cover not available';
        image.alt = title ? `Cover of ${title}` : '';
        image.hidden = !safeUrl;
        fallback.hidden = Boolean(safeUrl);
        if (safeUrl) {
            image.onload = () => {
                image.hidden = false;
                fallback.hidden = true;
            };
            image.onerror = () => {
                image.hidden = true;
                fallback.hidden = false;
            };
            image.src = safeUrl;
        } else {
            image.removeAttribute('src');
        }
    }

    function renderBook() {
        const isOwner = Number(book.user_id) === Number(user.user_id);
        detail.hidden = false;
        editForm.hidden = true;
        document.title = `${book.title} | The Written Leaf`;
        const backLink = document.getElementById('book-detail-back');
        backLink.href = isOwner ? 'journey.html' : 'discover.html';
        backLink.textContent = isOwner ? 'Back to My Journey' : 'Back to Discover';
        document.getElementById('book-detail-origin').textContent =
            isOwner ? 'A page from your journey' : 'A book shared by a reader';
        const readerLink = document.getElementById('book-detail-reader');
        readerLink.href = `reader.html?username=${encodeURIComponent(book.username || '')}`;
        readerLink.textContent = `@${book.username || 'reader'}`;
        readerLink.hidden = !book.username;
        document.getElementById('book-edit-button').hidden = !isOwner;
        document.getElementById('book-delete-button').hidden = !isOwner;
        document.getElementById('book-detail-title').textContent = book.title;
        document.getElementById('book-detail-author').textContent = book.author;
        document.getElementById('book-detail-start').textContent = formatBookDate(book.start_date);
        document.getElementById('book-detail-end').textContent = formatBookDate(book.end_date);
        document.getElementById('book-detail-reading-status').textContent = deriveReadingStatus(book.end_date);
        document.getElementById('book-detail-lending').textContent =
            book.available_for_lending ? 'Available' : 'Not available';
        const visibility = document.getElementById('book-detail-visibility');
        visibility.className = `entry-visibility entry-visibility-${book.visibility}`;
        visibility.textContent = book.visibility === 'public' ? 'Public' : 'Private';
        document.getElementById('book-detail-reflection').textContent =
            book.reflection || 'No reading reflection has been added to this entry yet.';
        renderCover('book-front-image', 'book-front-fallback', book.front_cover, book.title);
        document.getElementById('book-back-cover').hidden = !book.back_cover;
        renderCover('book-back-image', 'book-back-fallback', book.back_cover, `${book.title} back cover`);
        status.textContent = '';
        actionMessage.textContent = '';
    }

    function startEditing() {
        document.getElementById('edit-title').value = book.title || '';
        document.getElementById('edit-author').value = book.author || '';
        document.getElementById('edit-start-date').value = book.start_date || '';
        editEndDate.value = book.end_date || '';
        updateEditStatus();
        document.getElementById('edit-reflection').value = book.reflection || '';
        document.getElementById('edit-visibility').value = book.visibility || 'private';
        document.getElementById('edit-available-for-lending').checked = Boolean(book.available_for_lending);
        coverPickers.reset({ front_cover: book.front_cover, back_cover: book.back_cover });
        editMessage.textContent = '';
        detail.hidden = true;
        editForm.hidden = false;
    }

    if (!Number.isInteger(entryId) || entryId < 1) {
        status.textContent = 'This book could not be found.';
        return;
    }

    document.getElementById('book-edit-button').addEventListener('click', startEditing);
    document.getElementById('book-edit-cancel').addEventListener('click', () => {
        coverPickers.reset({ front_cover: book.front_cover, back_cover: book.back_cover });
        editForm.hidden = true;
        detail.hidden = false;
    });
    document.getElementById('book-delete-button').addEventListener('click', async () => {
        if (!window.confirm(`Delete "${book.title}" from your journey? This cannot be undone.`)) return;
        actionMessage.textContent = 'Deleting this entry...';
        try {
            await api(`/api/books/${entryId}`, { method: 'DELETE' });
            window.location.assign('journey.html');
        } catch (error) {
            if (error.status === 401) {
                const nextPage = `book.html?id=${entryId}`;
                window.location.assign(`login.html?next=${encodeURIComponent(nextPage)}`);
                return;
            }
            console.error('Book delete error:', error);
            actionMessage.textContent = error.message || 'Could not delete this entry. Please try again.';
        }
    });
    editForm.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = editForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        editMessage.textContent = 'Saving your changes...';
        try {
            const coverValues = await coverPickers.getValues();
            await api(`/api/books/${entryId}`, {
                method: 'PUT',
                body: {
                    title: document.getElementById('edit-title').value.trim(),
                    author: document.getElementById('edit-author').value.trim(),
                    start_date: document.getElementById('edit-start-date').value || null,
                    end_date: document.getElementById('edit-end-date').value || null,
                    reflection: document.getElementById('edit-reflection').value.trim() || null,
                    visibility: document.getElementById('edit-visibility').value,
                    available_for_lending: document.getElementById('edit-available-for-lending').checked,
                    ...coverValues
                }
            });
            book = await api(`/api/books/${entryId}`);
            renderBook();
        } catch (error) {
            if (error.status === 401) {
                const nextPage = `book.html?id=${entryId}`;
                window.location.assign(`login.html?next=${encodeURIComponent(nextPage)}`);
                return;
            }
            console.error('Book update error:', error);
            editMessage.textContent = error.message || 'Could not save your changes. Please try again.';
        } finally {
            submitButton.disabled = false;
        }
    });

    try {
        book = await api(`/api/books/${entryId}`);
        renderBook();
    } catch (error) {
        if (error.status === 401) {
            window.location.assign('login.html?next=book.html');
            return;
        }
        console.error('Book detail error:', error);
        status.textContent = error.status === 404
            ? 'This book could not be found or is not available to your account.'
            : 'Could not load this book. Please try again.';
    }
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
    enforceAuth().then((user) => {
        if (user) {
            loadDiscoverBooks(user);
            loadReaderProfile();
            loadJourneyBooks();
            loadBookDetail(user);
            setupProfileEditor(user);
            loadProfileBooks();
            if (document.getElementById('owned-lending-books')) {
                bindLendingActions();
                loadOwnedLendingBooks();
                loadLendingRequests();
            }
        }
    });
});
