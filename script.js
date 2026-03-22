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
});