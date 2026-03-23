const SITE_LINKS = {
  socials: {
    spotify: 'https://open.spotify.com/album/1uCJZxHc8jsFuvQceOzF0v?si=W5bVzh_vSRScAEJGbwQGLw',
    appleMusic: 'https://music.apple.com/us/album/lost-at-sea-single/1875448850',
    bandcamp: 'https://band-gaggle.bandcamp.com/album/lost-at-sea',
    instagram: 'https://www.instagram.com/gaggle_band/',
    tiktok: 'https://www.tiktok.com/@gaggleband',
    youtube: 'https://www.youtube.com/@gaggleband',
  },
  contactEmail: 'band.gaggle@proton.me',
};

async function injectPartial(targetSelector, partialPath) {
  const mount = document.querySelector(targetSelector);
  if (!mount) {
    return;
  }

  const response = await fetch(partialPath);
  if (!response.ok) {
    throw new Error(`Failed to load ${partialPath}`);
  }

  mount.innerHTML = await response.text();
}

function applySharedUrls() {
  document.querySelectorAll('a[data-social]').forEach((link) => {
    const socialKey = link.dataset.social;
    const url = SITE_LINKS.socials[socialKey];
    if (url) {
      link.setAttribute('href', url);
    }
  });

  document.querySelectorAll('a[data-contact-email]').forEach((emailLink) => {
    const email = SITE_LINKS.contactEmail;
    if (!email) {
      return;
    }

    emailLink.setAttribute('href', `mailto:${email}`);
    emailLink.textContent = email;
  });
}

function setActiveMenuLink() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) {
    return;
  }

  document.querySelectorAll('.main-nav a[data-page]').forEach((link) => {
    const isActive = link.dataset.page === currentPage;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function initMenu() {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  const siteHeader = document.querySelector('.site-header');
  const defaultState = document.body.dataset.menuDefault;

  if (!menuButton || !menu || !siteHeader) {
    return;
  }

  const syncMenuSpace = () => {
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
      siteHeader.style.setProperty('--menu-space', `${menu.offsetHeight + 10}px`);
    } else {
      siteHeader.style.setProperty('--menu-space', '0px');
    }
  };

  const closeMenu = () => {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    syncMenuSpace();
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    syncMenuSpace();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  if (defaultState === 'open') {
    menu.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
  } else {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
  
  window.addEventListener('resize', syncMenuSpace);
  syncMenuSpace();
}

function applyEventDateFiltering() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  document.querySelectorAll('.event-item[data-date]').forEach((eventItem) => {
    const dateValue = eventItem.dataset.date;
    if (!dateValue) {
      return;
    }

    const [year, month, day] = dateValue.split('-').map(Number);
    if ([year, month, day].some((n) => Number.isNaN(n))) {
      console.warn('Invalid event date', dateValue, eventItem);
      return;
    }

    const eventDate = new Date(year, month - 1, day);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      eventItem.style.display = 'none';
    } else {
      eventItem.style.display = '';
    }
  });
}

function setupEPKPage() {
  // only run on EPK page
  if (!document.body.dataset.page || document.body.dataset.page !== 'epk') {
    return;
  }

  initEPKCarousel();
  initEPKContactForm();
}

function initEPKCarousel() {
  const carousel = document.querySelector('.epk-photos .carousel-track');
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.children);
  const prev = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  let index = 0;

  function refresh() {
    const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
    carousel.style.transform = `translateX(${-index * (slideWidth + 11)}px)`;
  }

  function setIndex(nextIndex) {
    index = ((nextIndex % slides.length) + slides.length) % slides.length;
    refresh();
  }

  prev?.addEventListener('click', () => setIndex(index - 1));
  next?.addEventListener('click', () => setIndex(index + 1));
  window.addEventListener('resize', refresh);
  setIndex(0);
}

function initEPKContactForm() {
  const form = document.getElementById('epk-contact-form');
  const status = document.getElementById('epk-contact-status');
  if (!form || !status) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('epk-name').value.trim();
    const email = document.getElementById('epk-email').value.trim();
    const message = document.getElementById('epk-message').value.trim();
    const recipient = SITE_LINKS.contactEmail || 'band.gaggle@proton.me';

    if (!name || !email || !message) {
      status.textContent = 'Please complete all fields before sending.';
      return;
    }

    const subject = encodeURIComponent(`EPK contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

    status.textContent = 'Opening your email app…';
    window.location.href = mailtoUrl;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await Promise.all([
      injectPartial('#site-header', 'partials/header.html'),
      injectPartial('#site-footer', 'partials/footer.html'),
    ]);
  } catch (error) {
    console.error(error);
    return;
  }

  applySharedUrls();
  setActiveMenuLink();
  initMenu();
  applyEventDateFiltering();
  setupEPKPage();
});
