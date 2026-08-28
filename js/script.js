const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const progressBar = document.querySelector('.progress-bar');

if (menuToggle && siteNav) {
	menuToggle.addEventListener('click', () => {
		const isOpen = siteNav.classList.toggle('open');
		menuToggle.setAttribute('aria-expanded', String(isOpen));
		menuToggle.textContent = isOpen ? 'Close' : 'Menu';
	});
	siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
		siteNav.classList.remove('open');
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.textContent = 'Menu';
	}));
}

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
	if (entry.isIntersecting) {
		entry.target.classList.add('visible');
		revealObserver.unobserve(entry.target);
	}
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

if (progressBar) window.addEventListener('scroll', () => {
	const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
	progressBar.style.width = `${scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0}%`;
}, { passive: true });

const bookForm = document.querySelector('.book-form');
if (bookForm) bookForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const status = document.querySelector('.form-status');
	if (status) status.textContent = 'This prototype keeps your entry on the page for now.';
});
