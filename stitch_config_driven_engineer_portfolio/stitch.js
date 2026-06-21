const fs = require('fs');
const path = require('path');
const vm = require('vm');

function compile() {
// 1. Parse config from portfolio_content_config.txt
const configPath = path.join(__dirname, 'portfolio_content_config.txt');
if (!fs.existsSync(configPath)) {
  console.error('Error: Config file not found:', configPath);
  throw new Error('Config file not found');
}
const configText = fs.readFileSync(configPath, 'utf8');
const processedConfigText = configText.replace(/export\s+const\s+portfolioConfig\s*=/, 'const portfolioConfig =') + '\nportfolioConfig;';
let portfolioConfig;
try {
  portfolioConfig = vm.runInNewContext(processedConfigText);
} catch (e) {
  console.error('Error parsing portfolio_content_config.txt:', e);
  throw e;
}

// 2. Extract WebGL shader code from shader/code.html
const shaderPath = path.join(__dirname, 'shader', 'code.html');
if (!fs.existsSync(shaderPath)) {
  console.error('Error: Shader file not found:', shaderPath);
  throw new Error('Shader file not found');
}
const shaderText = fs.readFileSync(shaderPath, 'utf8');
const shaderMatch = shaderText.match(/<!--\s*STITCH_SHADER_START:ANIMATION_4[\s\S]*?-->([\s\S]*?)<!--\s*STITCH_SHADER_END:ANIMATION_4\s*-->/);
if (!shaderMatch) {
  console.error('Error: Could not extract shader block from shader/code.html');
  throw new Error('Could not extract shader block');
}
const shaderBlock = shaderMatch[1].trim();

// 3. Define helper functions for HTML generation

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getTitleForPage(pageName, name) {
  switch (pageName) {
    case 'home_portfolio':
      return `<title>${name} | Software Engineer Portfolio</title>`;
    case 'projects_portfolio':
      return `<title>Projects | ${name} - Software Engineer</title>`;
    case 'experience_portfolio':
      return `<title>Experience &amp; Education | ${name}</title>`;
    case 'contact_portfolio':
      return `<title>Settings &amp; Contact | ${name} Portfolio</title>`;
    case 'about_portfolio':
      return `<title>About | ${name} Portfolio</title>`;
    default:
      return `<title>${name} Portfolio</title>`;
  }
}

function getDesktopNav(activePage) {
  const pages = [
    { name: 'Home', url: '../home_portfolio/code.html', icon: 'home' },
    { name: 'About', url: '../about_portfolio/code.html', icon: 'person' },
    { name: 'Projects', url: '../projects_portfolio/code.html', icon: 'code' },
    { name: 'Experience', url: '../experience_portfolio/code.html', icon: 'work' },
    { name: 'Blog', url: '../blog_portfolio/code.html', icon: 'article' }
  ];

  // Desktop nav links
  let desktopLinks = '';
  pages.forEach(p => {
    const isActive = p.name === activePage;
    if (isActive) {
      desktopLinks += `  <a class="relative text-primary font-bold font-label-mono text-label-mono transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-full" href="${p.url}">${p.name}</a>\n`;
    } else {
      desktopLinks += `  <a class="relative text-on-surface-variant hover:text-primary font-label-mono text-label-mono transition-colors duration-200" href="${p.url}">${p.name}</a>\n`;
    }
  });

  // Mobile drawer items
  let drawerLinks = '';
  pages.forEach((p, i) => {
    const isActive = p.name === activePage;
    const delay = i * 60;
    if (isActive) {
      drawerLinks += `  <a href="${p.url}" style="transition-delay:${delay}ms" class="drawer-item flex items-center gap-md px-lg py-md rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold font-label-mono text-label-mono">\n`;
      drawerLinks += `    <span class="material-symbols-outlined text-[22px]">${p.icon}</span>\n`;
      drawerLinks += `    <span>${p.name}</span>\n`;
      drawerLinks += `  </a>\n`;
    } else {
      drawerLinks += `  <a href="${p.url}" style="transition-delay:${delay}ms" class="drawer-item flex items-center gap-md px-lg py-md rounded-2xl hover:bg-white/5 text-on-surface-variant hover:text-primary font-label-mono text-label-mono transition-all duration-300">\n`;
      drawerLinks += `    <span class="material-symbols-outlined text-[22px]">${p.icon}</span>\n`;
      drawerLinks += `    <span>${p.name}</span>\n`;
      drawerLinks += `  </a>\n`;
    }
  });

  let html = `
<!-- Desktop nav -->
<nav class="hidden lg:flex gap-6 xl:gap-8 items-center">
${desktopLinks}</nav>
<!-- Mobile hamburger button (hidden as requested, using bottom mobile nav bar) -->
<button id="mobile-menu-btn" class="hidden" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-drawer">
  <span class="material-symbols-outlined text-on-surface">menu</span>
</button>
<!-- Mobile full-screen drawer -->
<div id="mobile-drawer" class="fixed inset-0 z-[200] pointer-events-none" role="dialog" aria-modal="true" aria-label="Navigation menu">
  <!-- Backdrop -->
  <div id="mobile-drawer-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
  <!-- Drawer panel -->
  <div id="mobile-drawer-panel" class="absolute top-0 right-0 h-full w-[280px] max-w-[85vw] bg-surface-container-low border-l border-white/10 shadow-2xl transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col">
    <!-- Drawer header -->
    <div class="flex items-center justify-between px-lg py-md border-b border-white/10">
      <span class="font-display font-bold text-primary text-headline-md-mobile">Navigation</span>
      <button id="mobile-drawer-close" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors active:scale-95" aria-label="Close navigation menu">
        <span class="material-symbols-outlined text-on-surface-variant">close</span>
      </button>
    </div>
    <!-- Drawer links -->
    <nav class="flex flex-col gap-sm px-md py-lg flex-1 overflow-y-auto">
${drawerLinks}    </nav>
    <!-- Drawer footer -->
    <div class="px-lg pb-safe py-md border-t border-white/10">
      <p class="font-label-mono text-[11px] text-on-surface-variant opacity-50">Swipe right to close</p>
    </div>
  </div>
</div>
<style>
  .drawer-item { opacity: 0; transform: translateX(20px); }
  #mobile-drawer.open .drawer-item { opacity: 1; transform: translateX(0); transition: opacity 0.3s ease, transform 0.3s ease; }
  #mobile-drawer.open #mobile-drawer-backdrop { opacity: 1; }
  #mobile-drawer.open #mobile-drawer-panel { transform: translateX(0); }
  #mobile-drawer.open { pointer-events: auto; }
</style>
<script>
(function() {
  const btn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const closeBtn = document.getElementById('mobile-drawer-close');
  if (!btn || !drawer) return;
  function openDrawer() {
    drawer.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', openDrawer);
  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  backdrop && backdrop.addEventListener('click', closeDrawer);
  // Swipe to close
  let startX = 0;
  drawer.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  drawer.addEventListener('touchend', e => { if (e.changedTouches[0].clientX - startX > 60) closeDrawer(); }, { passive: true });
  // Close on escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
})();
<\/script>`;

  return html;
}

function getMobileNav(activePage) {
  const pages = [
    { name: 'Home', url: '../home_portfolio/code.html', icon: 'home' },
    { name: 'About', url: '../about_portfolio/code.html', icon: 'person' },
    { name: 'Projects', url: '../projects_portfolio/code.html', icon: 'code' },
    { name: 'Experience', url: '../experience_portfolio/code.html', icon: 'work' },
    { name: 'Blog', url: '../blog_portfolio/code.html', icon: 'article' }
  ];

  let html = '<nav class="lg:hidden fixed bottom-0 left-0 w-full z-50" style="padding-bottom: env(safe-area-inset-bottom, 0px)">\n';
  html += '  <div class="bg-surface/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-around items-stretch h-[64px]">\n';
  pages.forEach(p => {
    const isActive = p.name === activePage;
    if (isActive) {
      html += `    <a href="${p.url}" class="flex flex-col items-center justify-center gap-[3px] flex-1 relative text-primary" aria-current="page">\n`;
      html += `      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-b-full" data-nav-indicator></div>\n`;
      html += `      <span class="material-symbols-outlined text-[22px] leading-none">${p.icon}</span>\n`;
      html += `      <span class="font-label-mono text-[9px] font-bold tracking-wider uppercase">${p.name}</span>\n`;
      html += `    </a>\n`;
    } else {
      html += `    <a href="${p.url}" class="flex flex-col items-center justify-center gap-[3px] flex-1 text-on-surface-variant hover:text-primary transition-colors duration-200 active:scale-95">\n`;
      html += `      <span class="material-symbols-outlined text-[22px] leading-none">${p.icon}</span>\n`;
      html += `      <span class="font-label-mono text-[9px] tracking-wider uppercase">${p.name}</span>\n`;
      html += `    </a>\n`;
    }
  });
  html += '  </div>\n';
  html += '</nav>';
  return html;
}

function getFeaturedProjectsHtml(projects) {
  const featured = projects.filter(p => p.featured);
  if (featured.length === 0) return '';
  
  let slidesHtml = '';
  let dotsHtml = '';
  
  featured.forEach((p, idx) => {
    let techStackHtml = '';
    if (p.technologies && p.technologies.length > 0) {
      techStackHtml = '<div class="flex flex-wrap gap-2 mb-md">\n';
      p.technologies.forEach(tech => {
        techStackHtml += `  <span class="px-2.5 py-1 bg-white/10 border border-white/5 rounded-md text-[10px] font-label-mono text-white/80">${tech}</span>\n`;
      });
      techStackHtml += '</div>\n';
    }
    
    slidesHtml += `
    <div class="w-full flex-shrink-0 h-[480px] sm:h-[500px] md:h-[550px] relative overflow-hidden group">
      <!-- Image -->
      <img alt="${p.title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${p.image}"/>
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-md sm:p-lg md:p-xl">
        <span class="font-label-mono text-primary bg-primary/10 border border-primary/20 self-start px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs mb-xs sm:mb-sm tracking-wider uppercase">${p.category || 'PROJECT'}</span>
        <h4 class="font-display text-xl sm:text-3xl md:text-[40px] text-white font-bold mb-xs leading-tight line-clamp-2">${p.title}</h4>
        <p class="text-on-surface-variant/90 max-w-lg text-[13px] sm:text-sm md:text-body-md mb-md leading-relaxed line-clamp-3 sm:line-clamp-none">${p.description}</p>
        
        <!-- Tech Stack -->
        ${techStackHtml}
        
        <!-- Actions -->
        <div class="flex gap-sm sm:gap-md mt-sm">
          <a href="${p.liveLink || '#'}" target="_blank" class="bg-primary text-on-primary font-label-mono text-[10px] sm:text-xs px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-sm">open_in_new</span> LIVE DEMO
          </a>
          <a href="${p.githubLink || '#'}" target="_blank" class="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-label-mono text-[10px] sm:text-xs px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-sm">terminal</span> VIEW CODE
          </a>
        </div>
      </div>
    </div>
    `;
    
    dotsHtml += `
    <button class="slider-dot w-2.5 h-2.5 rounded-full bg-white/30 transition-all duration-300 active:scale-90" data-index="${idx}" aria-label="Go to slide ${idx + 1}"></button>
    `;
  });
  
  let html = `
  <div class="relative overflow-hidden w-full rounded-3xl border border-white/10 glass-card">
    <!-- Slider Track -->
    <div id="featured-slider" class="flex transition-transform duration-500 ease-in-out">
      ${slidesHtml}
    </div>
    
    <!-- Left Navigation Arrow -->
    <button id="slider-prev" class="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-card items-center justify-center text-on-surface hover:text-primary active:scale-90 transition-all z-20" aria-label="Previous slide">
      <span class="material-symbols-outlined">chevron_left</span>
    </button>
    
    <!-- Right Navigation Arrow -->
    <button id="slider-next" class="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-card items-center justify-center text-on-surface hover:text-primary active:scale-90 transition-all z-20" aria-label="Next slide">
      <span class="material-symbols-outlined">chevron_right</span>
    </button>

    <!-- Slider Dots Indicator -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
      ${dotsHtml}
    </div>
  </div>

  <script>
  (function() {
    const slider = document.getElementById('featured-slider');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dots = document.querySelectorAll('.slider-dot');
    if (!slider || !prevBtn || !nextBtn || dots.length === 0) return;
    
    let currentIndex = 0;
    const slideCount = dots.length;
    let timer;
    
    function updateSlider(index) {
      currentIndex = (index + slideCount) % slideCount;
      slider.style.transform = \`translateX(-\${currentIndex * 100}%)\`;
      
      // Update dots
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.remove('bg-white/30');
          dot.classList.add('bg-primary', 'w-6');
        } else {
          dot.classList.remove('bg-primary', 'w-6');
          dot.classList.add('bg-white/30');
        }
      });
    }
    
    function startAutoplay() {
      stopAutoplay();
      timer = setInterval(() => updateSlider(currentIndex + 1), 6000);
    }
    
    function stopAutoplay() {
      if (timer) clearInterval(timer);
    }
    
    prevBtn.addEventListener('click', () => {
      updateSlider(currentIndex - 1);
      startAutoplay();
    });
    
    nextBtn.addEventListener('click', () => {
      updateSlider(currentIndex + 1);
      startAutoplay();
    });
    
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'), 10);
        updateSlider(index);
        startAutoplay();
      });
    });
    
    // Swipe support
    let startX = 0;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 50) {
        updateSlider(currentIndex - 1);
        startAutoplay();
      } else if (diff < -50) {
        updateSlider(currentIndex + 1);
        startAutoplay();
      }
    }, { passive: true });

    // Pause autoplay on hover
    const container = slider.parentElement;
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
    
    // Initialize first dot and autoplay
    updateSlider(0);
    startAutoplay();
  })();
  </script>
  `;
  return html;
}

function getFloatingSocialsHtml(socialLinks) {
  let html = '<div class="hidden lg:flex fixed bottom-lg right-lg z-50 flex-col gap-sm">\n';
  const icons = {
    github: 'terminal',
    linkedin: 'work',
    twitter: 'chat',
    leetcode: 'code'
  };
  Object.keys(socialLinks).forEach(key => {
    const icon = icons[key] || 'link';
    html += `  <a class="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95" href="${socialLinks[key]}" target="_blank">\n`;
    html += `    <span class="material-symbols-outlined text-sm">${icon}</span>\n`;
    html += `  </a>\n`;
  });
  html += '</div>';
  return html;
}

function getProjectsGridHtml(projects) {
  let html = '<div class="flex overflow-x-auto gap-lg pb-6 scrollbar-thin scroll-smooth projects-container">\n';
  projects.forEach((p, idx) => {
    const isFeatured = p.featured;
    const categoryLabel = p.category ? p.category.toUpperCase() : 'PROJECT';
    const cat = p.category || '';
    const tech = (p.technologies || []).join(',').toLowerCase();
    const title = p.title ? p.title.toLowerCase() : '';
    
    html += `  <div class="glass-card flex flex-col rounded-xl overflow-hidden group project-card flex-shrink-0 w-[85vw] sm:w-[380px] md:w-[420px]" data-category="${cat.toLowerCase()}" data-tech="${tech}" data-title="${title}">\n`;
    html += `    <div class="relative h-48 overflow-hidden">\n`;
    html += `      <img class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src="${p.image}"/>\n`;
    html += `      <div class="absolute top-4 left-4">\n`;
    if (isFeatured) {
      html += `        <span class="chip bg-primary/20 text-primary backdrop-blur-md">Featured</span>\n`;
    } else {
      html += `        <span class="chip bg-tertiary/20 text-tertiary backdrop-blur-md">${categoryLabel}</span>\n`;
    }
    html += `      </div>\n`;
    html += `    </div>\n`;
    html += `    <div class="p-lg flex flex-col flex-grow">\n`;
    html += `      <h3 class="font-headline-md text-headline-md text-on-surface mb-2">${p.title}</h3>\n`;
    html += `      <p class="text-on-surface-variant font-body-md mb-6 flex-grow">${p.description}</p>\n`;
    html += `      <div class="flex flex-wrap gap-2 mb-6">\n`;
    (p.technologies || []).forEach(tech => {
      html += `        <span class="chip bg-surface-variant text-on-surface-variant">${tech}</span>\n`;
    });
    html += `      </div>\n`;
    html += `      <div class="pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-[10px] font-label-mono text-outline mb-6 hidden recruiter-show-grid">\n`;
    html += `        <div>LATENCY<br><span class="text-primary font-bold text-xs">${p.metrics?.latency || '< 10ms'}</span></div>\n`;
    html += `        <div>FCP<br><span class="text-tertiary font-bold text-xs">${p.metrics?.fcp || '0.40s'}</span></div>\n`;
    html += `        <div>BUNDLE<br><span class="text-white font-bold text-xs">${p.metrics?.bundleSize || '30kB'}</span></div>\n`;
    html += `      </div>\n`;
    html += `      <div class="flex items-center justify-between mt-auto">\n`;
    html += `        <div class="flex gap-4">\n`;
    html += `          <a class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-mono text-label-mono" href="${p.githubLink || '#'}" target="_blank">\n`;
    html += `            <span class="material-symbols-outlined text-lg">code</span>\n`;
    html += `          </a>\n`;
    html += `          <a class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-mono text-label-mono" href="${p.liveLink || '#'}" target="_blank">\n`;
    html += `            <span class="material-symbols-outlined text-lg">open_in_new</span>\n`;
    html += `          </a>\n`;
    html += `        </div>\n`;
    html += `        <button onclick="openSpecs(${idx})" class="bg-primary text-on-primary font-label-mono text-label-mono px-4 py-2 rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(192,193,255,0.2)]">VIEW SPECS</button>\n`;
    html += `      </div>\n`;
    html += `    </div>\n`;
    html += `  </div>\n`;
  });
  html += '</div>';
  return html;
}

function getExperienceHtml(experience) {
  let html = '';
  experience.forEach(exp => {
    html += `  <div class="glass-card p-6 rounded-2xl group">\n`;
    html += `    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">\n`;
    html += `      <div class="flex items-center gap-4">\n`;
    html += `        <div class="w-14 h-14 rounded-lg bg-surface-container overflow-hidden border border-white/5">\n`;
    html += `          <img class="w-full h-full object-cover" src="${exp.logo}"/>\n`;
    html += `        </div>\n`;
    html += `        <div>\n`;
    html += `          <h3 class="font-headline-md text-[20px] text-on-surface">${exp.company}</h3>\n`;
    html += `          <p class="text-primary font-label-mono text-label-mono">${exp.role}</p>\n`;
    html += `        </div>\n`;
    html += `      </div>\n`;
    html += `      <div class="text-right">\n`;
    html += `        <span class="font-label-mono text-label-mono text-on-surface-variant bg-surface-container px-3 py-1 rounded-md">${exp.duration}</span>\n`;
    html += `        <p class="text-xs text-outline mt-1 font-label-mono">${exp.location}</p>\n`;
    html += `      </div>\n`;
    html += `    </div>\n`;
    html += `    <p class="font-body-md text-body-md text-on-surface-variant mb-6 border-l-2 border-primary/30 pl-4 italic">\n`;
    html += `      "${exp.description}"\n`;
    html += `    </p>\n`;
    
    if (exp.achievements && Array.isArray(exp.achievements)) {
      html += `    <ul class="space-y-3 mb-6">\n`;
      exp.achievements.forEach(ach => {
        html += `      <li class="flex items-start gap-3 text-on-surface-variant text-body-md">\n`;
        html += `        <span class="material-symbols-outlined text-primary text-[18px] mt-1">check_circle</span>\n`;
        html += `        <span>${ach}</span>\n`;
        html += `      </li>\n`;
      });
      html += `    </ul>\n`;
    }
    
    html += `    <div class="flex flex-wrap gap-2">\n`;
    (exp.technologies || []).forEach(tech => {
      html += `      <span class="px-2 py-1 rounded bg-secondary-container/30 text-secondary text-[11px] font-label-mono uppercase tracking-wider border border-secondary/20">${tech}</span>\n`;
    });
    html += `    </div>\n`;
    html += `  </div>\n`;
  });
  return html;
}

function getEducationHtml(education) {
  let html = '';
  education.forEach(edu => {
    html += `  <div class="glass-card p-6 rounded-2xl">\n`;
    html += `    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">\n`;
    html += `      <div class="flex items-center gap-4">\n`;
    html += `        <div class="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center border border-white/5">\n`;
    html += `          <span class="material-symbols-outlined text-primary text-[32px]">account_balance</span>\n`;
    html += `        </div>\n`;
    html += `        <div>\n`;
    html += `          <h3 class="font-headline-md text-[20px] text-on-surface">${edu.institution}</h3>\n`;
    html += `          <p class="text-tertiary font-label-mono text-label-mono">${edu.degree}</p>\n`;
    html += `        </div>\n`;
    html += `      </div>\n`;
    html += `      <div class="text-right">\n`;
    html += `        <span class="font-label-mono text-label-mono text-on-surface-variant bg-surface-container px-3 py-1 rounded-md">${edu.duration}</span>\n`;
    html += `      </div>\n`;
    html += `    </div>\n`;
    html += `    <div class="grid grid-cols-2 gap-4 mb-8">\n`;
    html += `      <div class="bg-white/5 rounded-xl p-4 border border-white/5">\n`;
    html += `        <p class="text-outline text-xs font-label-mono uppercase mb-1">Cumulative GPA</p>\n`;
    html += `        <p class="text-headline-md text-primary">${edu.cgpa}</p>\n`;
    html += `      </div>\n`;
    html += `      <div class="bg-white/5 rounded-xl p-4 border border-white/5">\n`;
    html += `        <p class="text-outline text-xs font-label-mono uppercase mb-1">Focus Area</p>\n`;
    html += `        <p class="text-headline-md text-tertiary">${edu.focusArea || 'Systems'}</p>\n`;
    html += `      </div>\n`;
    html += `    </div>\n`;
    if (edu.achievements && edu.achievements.length > 0) {
      html += `    <h4 class="font-label-mono text-label-mono text-on-surface mb-3 uppercase tracking-widest">Key Achievements</h4>\n`;
      html += `    <div class="space-y-3">\n`;
      edu.achievements.forEach(ach => {
        html += `      <div class="flex items-center gap-3 p-3 rounded-lg bg-surface-container/50 border border-white/5">\n`;
        html += `        <span class="material-symbols-outlined text-tertiary">military_tech</span>\n`;
        html += `        <span class="text-body-md text-on-surface-variant">${ach}</span>\n`;
        html += `      </div>\n`;
      });
      html += `    </div>\n`;
    }
    html += `  </div>\n`;
  });
  return html;
}

function getStatsSkillsHtml(stats) {
  let html = '<div class="flex gap-4">\n';
  const problems = stats.find(s => s.label.includes('Problems Solved') || s.label.includes('Solved')) || { value: '500+', label: 'Problems Solved' };
  const certs = stats.find(s => s.label.includes('Certifications')) || { value: '12', label: 'Certifications' };
  
  html += `  <div class="px-6 py-4 rounded-2xl glass-card text-center">\n`;
  html += `    <span class="block text-headline-md text-primary mb-1">${problems.value}</span>\n`;
  html += `    <span class="text-xs font-label-mono text-outline uppercase">${problems.label}</span>\n`;
  html += `  </div>\n`;
  html += `  <div class="px-6 py-4 rounded-2xl glass-card text-center">\n`;
  html += `    <span class="block text-headline-md text-tertiary mb-1">${certs.value}</span>\n`;
  html += `    <span class="text-xs font-label-mono text-outline uppercase">${certs.label}</span>\n`;
  html += `  </div>\n`;
  html += '</div>';
  return html;
}

function getAboutSkillsHtml(skills) {
  let html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-lg">\n';
  const colors = {
    Frontend: { accent: 'primary', icon: 'palette' },
    Backend: { accent: 'tertiary', icon: 'database' },
    Tools: { accent: 'secondary', icon: 'build' }
  };
  skills.forEach((cat, index) => {
    const conf = colors[cat.category] || { accent: 'primary', icon: 'star' };
    const delayStr = index > 0 ? ` style="transition-delay: ${index * 100}ms;"` : '';
    html += `  <div class="flex flex-col gap-lg reveal-on-scroll"${delayStr}>\n`;
    html += `    <div class="flex items-center gap-sm mb-sm">\n`;
    html += `      <span class="material-symbols-outlined text-${conf.accent}" data-icon="${conf.icon}">${conf.icon}</span>\n`;
    html += `      <h3 class="font-headline-md text-headline-md text-${conf.accent}">${cat.category}</h3>\n`;
    html += `    </div>\n`;
    cat.items.forEach(skill => {
      html += `    <div class="glass-card p-lg rounded-xl flex flex-col gap-md">\n`;
      html += `      <div class="flex justify-between items-center">\n`;
      html += `        <span class="font-label-mono text-label-mono text-on-surface">${skill.name}</span>\n`;
      html += `        <span class="text-${conf.accent} font-bold">${skill.level}%</span>\n`;
      html += `      </div>\n`;
      html += `      <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">\n`;
      html += `        <div class="skill-progress-fill h-full bg-${conf.accent}" style="width: ${skill.level}%"></div>\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
    });
    html += `  </div>\n`;
  });
  html += '</div>';
  return html;
}

function getExperienceSkillsHtml(skills) {
  let html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">\n';
  const frontend = skills.find(s => s.category === 'Frontend') || { items: [] };
  html += `  <div class="glass-card p-6 rounded-3xl">\n`;
  html += `    <div class="flex items-center gap-3 mb-8">\n`;
  html += `      <span class="material-symbols-outlined text-primary">terminal</span>\n`;
  html += `      <h3 class="font-headline-md text-[18px]">Frontend</h3>\n`;
  html += `    </div>\n`;
  html += `    <div class="space-y-6">\n`;
  frontend.items.forEach(skill => {
    html += `      <div>\n`;
    html += `        <div class="flex justify-between mb-2">\n`;
    html += `          <span class="text-on-surface font-label-mono text-sm">${skill.name}</span>\n`;
    html += `          <span class="text-primary font-label-mono text-sm">${skill.level}%</span>\n`;
    html += `        </div>\n`;
    html += `        <div class="w-full bg-white/10 h-1 rounded-full overflow-hidden">\n`;
    html += `          <div class="bg-primary h-full w-[${skill.level}%]"></div>\n`;
    html += `        </div>\n`;
    html += `      </div>\n`;
  });
  html += `    </div>\n`;
  html += `  </div>\n`;
  
  const backend = skills.find(s => s.category === 'Backend') || { items: [] };
  const tools = skills.find(s => s.category === 'Tools') || { items: [] };
  const combined = [...backend.items, ...tools.items];
  const mainSkills = combined.slice(0, 4);
  const tagSkills = combined.slice(4);
  
  html += `  <div class="glass-card p-6 rounded-3xl md:col-span-2">\n`;
  html += `    <div class="flex items-center gap-3 mb-8">\n`;
  html += `      <span class="material-symbols-outlined text-tertiary">dns</span>\n`;
  html += `      <h3 class="font-headline-md text-[18px]">Backend &amp; Cloud</h3>\n`;
  html += `    </div>\n`;
  html += `    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">\n`;
  mainSkills.forEach(skill => {
    html += `      <div>\n`;
    html += `        <div class="flex justify-between mb-2">\n`;
    html += `          <span class="text-on-surface font-label-mono text-sm">${skill.name}</span>\n`;
    html += `          <span class="text-tertiary font-label-mono text-sm">${skill.level}%</span>\n`;
    html += `        </div>\n`;
    html += `        <div class="w-full bg-white/10 h-1 rounded-full overflow-hidden">\n`;
    html += `          <div class="bg-tertiary h-full w-[${skill.level}%]"></div>\n`;
    html += `        </div>\n`;
    html += `      </div>\n`;
  });
  html += `    </div>\n`;
  
  if (tagSkills.length > 0) {
    html += `    <div class="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-3">\n`;
    tagSkills.forEach(skill => {
      html += `      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs text-on-surface-variant font-label-mono">\n`;
      html += `        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> ${skill.name}\n`;
      html += `      </div>\n`;
    });
    html += `    </div>\n`;
  }
  html += `  </div>\n`;
  html += '</div>';
  return html;
}

function getSkillsSummaryHtml(skillsSummary) {
  if (!skillsSummary || !Array.isArray(skillsSummary)) return '';
  
  let html = `<section class="mt-xxl">
  <div class="mb-12">
    <h2 class="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Skills Summary</h2>
    <p class="text-on-surface-variant font-body-md">A structured overview of my technical proficiencies and key soft skills.</p>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">`;

  skillsSummary.forEach(cat => {
    const color = cat.color || 'primary';
    const headerIcon = cat.icon || 'translate';
    const category = cat.category || 'Category';
    
    html += `
    <!-- ${category} Card -->
    <div class="glass-card p-6 rounded-3xl flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 mb-6">
          <span class="material-symbols-outlined text-${color}">${headerIcon}</span>
          <h3 class="font-headline-md text-[20px] text-on-surface">${category}</h3>
        </div>
        <div class="flex flex-wrap gap-3">`;

    (cat.items || []).forEach(item => {
      let iconHtml = '';
      if (item.iconType === 'material') {
        iconHtml = `<span class="material-symbols-outlined text-lg text-${color}">${item.icon}</span>`;
      } else {
        iconHtml = `<i class="${item.icon} text-lg"></i>`;
      }
      
      html += `
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container/50 border border-white/10 hover:border-${color}/30 hover:bg-${color}/10 transition-all duration-300 group hover:scale-[1.02] cursor-pointer">
            <div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
              ${iconHtml}
            </div>
            <span class="text-xs font-label-mono text-on-surface-variant group-hover:text-on-surface transition-colors">${item.name}</span>
          </div>`;
    });

    html += `
        </div>
      </div>
    </div>`;
  });

  html += `
  </div>
</section>`;
  return html;
}

function getContactProfileHeaderHtml(personalInfo, skills) {
  const tags = skills.map(s => s.category.toUpperCase());
  
  let html = `<section class="glass-card p-xl rounded-2xl space-y-6 flex flex-col items-center text-center">\n`;
  html += `  <!-- Profile Image Container -->\n`;
  html += `  <div class="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 p-1 bg-surface-container/50 shadow-[0_0_20px_rgba(192,193,255,0.15)] shrink-0">\n`;
  html += `    <img class="w-full h-full object-cover rounded-full" alt="${personalInfo.name}" src="${personalInfo.profilePhoto}"/>\n`;
  html += `  </div>\n`;
  
  html += `  <div class="space-y-2 w-full">\n`;
  html += `    <div class="flex items-center justify-center gap-2">\n`;
  html += `      <h1 class="font-headline-md text-headline-md text-on-surface font-bold">${personalInfo.name}</h1>\n`;
  html += `      <span class="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-label-mono text-[9px] font-bold">VERIFIED</span>\n`;
  html += `    </div>\n`;
  html += `    <p class="text-primary font-label-mono text-xs uppercase tracking-widest font-semibold">${personalInfo.title}</p>\n`;
  html += `  </div>\n`;
  
  html += `  <p class="text-on-surface-variant font-body-md leading-relaxed text-sm max-w-xs">\n`;
  html += `    ${personalInfo.shortBio || personalInfo.introduction}\n`;
  html += `  </p>\n`;

  html += `  <!-- Location & Email Metadata -->\n`;
  html += `  <div class="w-full border-t border-white/5 pt-4 space-y-2 text-xs font-label-mono text-on-surface-variant/80">\n`;
  html += `    <div class="flex items-center justify-center gap-2">\n`;
  html += `      <span class="material-symbols-outlined text-sm text-primary">location_on</span>\n`;
  html += `      <span>${personalInfo.location}</span>\n`;
  html += `    </div>\n`;
  html += `    <div class="flex items-center justify-center gap-2">
      <span class="material-symbols-outlined text-sm text-primary">mail</span>
      <a href="mailto:${personalInfo.email}" class="hover:text-primary transition-colors">${personalInfo.email}</a>
    </div>
  </div>
  
  <!-- CMS Quick Action -->
  <div class="w-full border-t border-white/5 pt-4 flex justify-center">
    <button onclick="const tab = document.getElementById('tab-btn-editor'); if(tab) tab.click();" class="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all font-label-mono text-xs uppercase tracking-wider flex items-center gap-2">
      <span class="material-symbols-outlined text-sm">settings</span> Edit Portfolio
    </button>
  </div>\n`;
  
  html += `  <div class="flex flex-wrap justify-center gap-2 pt-2 w-full border-t border-white/5">\n`;
  tags.forEach(t => {
    html += `    <span class="px-2.5 py-1 bg-surface-container rounded-md text-[10px] font-label-mono text-outline border border-white/5">#${t}</span>\n`;
  });
  html += `  </div>\n`;
  html += `</section>`;
  return html;
}

function getAboutBentoHtml(personalInfo) {
  const years = personalInfo.yearsOfExperience || "Fresher";
  const label = personalInfo.yearsOfExperienceLabel || "Experience";
  const isFresher = years.toLowerCase() === "fresher";
  const sizeClass = isFresher ? "text-[42px] md:text-[48px]" : "text-[80px]";
  const leadingClass = isFresher ? "leading-normal py-4" : "leading-none";
  return `<section class="mb-xxl reveal-on-scroll">
<div class="grid grid-cols-1 md:grid-cols-12 gap-lg">
<div class="md:col-span-8 glass-card p-xl rounded-xl">
<h2 class="font-headline-md text-headline-md text-primary mb-lg">Mission &amp; Expertise</h2>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed space-y-4">
                        ${personalInfo.introduction}
                        <br/><br/>
                        ${personalInfo.shortBio}
                    </p>
</div>
<div class="md:col-span-4 glass-card p-xl rounded-xl flex flex-col justify-center items-center text-center">
<span class="font-display ${sizeClass} font-extrabold text-primary ${leadingClass}">${years}</span>
<span class="font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant">${label}</span>
<div class="w-16 h-1 bg-primary mt-lg"></div>
</div>
</div>
</section>`;
}

function getSocialsGridHtml(socialLinks) {
  let html = '<section class="grid grid-cols-2 gap-4">\n';
  const info = {
    github: { name: 'GitHub', icon: 'terminal' },
    leetcode: { name: 'LeetCode', icon: 'code' },
    linkedin: { name: 'LinkedIn', icon: 'work' },
    twitter: { name: 'Twitter', icon: 'chat' }
  };
  Object.keys(socialLinks).forEach(key => {
    const inf = info[key] || { name: key.toUpperCase(), icon: 'link' };
    html += `  <a class="glass-card p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:translate-y-[-2px] transition-transform group" href="${socialLinks[key]}" target="_blank">\n`;
    html += `    <span class="material-symbols-outlined text-2xl group-hover:text-primary" data-icon="${inf.icon}">${inf.icon}</span>\n`;
    html += `    <span class="font-label-mono text-xs text-on-surface-variant">${inf.name}</span>\n`;
    html += `  </a>\n`;
  });
  html += '</section>';
  return html;
}

function getLocationWidgetHtml(location) {
  return `<section class="glass-card p-lg rounded-xl">
<div class="flex items-center gap-3 mb-4">
<span class="material-symbols-outlined text-primary" data-icon="location_on">location_on</span>
<span class="font-headline-md text-sm">${location}</span>
</div>
<div class="h-32 rounded-lg bg-surface-container overflow-hidden grayscale opacity-50 contrast-125">
<div class="w-full h-full bg-cover bg-center" data-location="${location}" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDcXxNEN7K3j2UkIg_nPdYSNqlAX1_8y1tqCEO4QM3koYO9w_0You46LWy63JDJUDaV0cYObKYRskOs8UkFGxMIZa-5sKdS57aNRamKWnkb40pbGECIPvLkDB6jcrAtGZS6wOd5UnMdFGcJu6EVoZyZvnK6y_Z0Ic7dTHo7G4YelfLHtSUMuLY5Ibfaefe7Xh2ovlMHbZUNrXR8UGP8po1NMWwZCXNOOh-HUOS_u8A4kfrO3kMZLV0iD15Q1eysRtBkEjt4MlRLvjEd')')"></div>
</div>
</section>`;
}

function getStatsGridHtml(stats) {
  let html = '<section class="grid md:grid-cols-4 gap-4" id="stats-grid">\n';
  stats.forEach(stat => {
    let cleanLabel = stat.label;
    if (stat.label.includes('Completed')) cleanLabel = 'Projects';
    else if (stat.label.includes('Solved')) cleanLabel = 'LeetCode Solved';
    else if (stat.label.includes('Certifications')) cleanLabel = 'Certifications';
    else if (stat.label.includes('Internships')) cleanLabel = 'Internships';
    
    html += `  <div class="glass-card p-6 rounded-xl text-center space-y-1">\n`;
    html += `    <p class="text-primary font-display text-2xl font-bold">${stat.value}</p>\n`;
    html += `    <p class="text-[10px] font-label-mono text-on-surface-variant uppercase">${cleanLabel}</p>\n`;
    html += `  </div>\n`;
  });
  html += '</section>';
  return html;
}

function getHomeStatsHtml(stats) {
  let html = '<section class="grid grid-cols-2 md:grid-cols-4 gap-lg mb-xxl">\n';
  stats.forEach(stat => {
    html += `  <div class="glass-card p-lg rounded-2xl flex flex-col items-center text-center">\n`;
    html += `    <span class="font-label-mono text-primary text-[32px] font-bold mb-xs">${stat.value}</span>\n`;
    html += `    <span class="text-on-surface-variant font-body-md text-body-md">${stat.label}</span>\n`;
    html += `  </div>\n`;
  });
  html += '</section>';
  return html;
}

// 4. Process each page template
const directories = ['home_portfolio', 'projects_portfolio', 'experience_portfolio', 'contact_portfolio', 'about_portfolio', 'blog_portfolio'];

directories.forEach(dir => {
  const filePath = path.join(__dirname, dir, 'code.html');
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping directory (no code.html): ${dir}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  let originalHtml = html;
  
  // Mapping page dynamic contents
  const replacements = {
    TITLE: () => getTitleForPage(dir, portfolioConfig.personalInfo.name),
    SHADER: () => shaderBlock,
    HEADER_LOGO: () => {
      const initials = getInitials(portfolioConfig.personalInfo.name);
      return `<div class="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
<span class="font-display text-primary font-bold text-headline-md-mobile">${initials}</span>
</div>
<span class="font-display text-headline-md-mobile font-bold text-primary hidden min-[400px]:inline">DevPortfolio</span>`;
    },
    HEADER_AVATAR: () => {
      const isHome = dir === 'home_portfolio';
      const wrapperClass = isHome ? 'hidden md:block w-10 h-10 rounded-full overflow-hidden border border-white/10' : 'w-10 h-10 rounded-full overflow-hidden border border-white/10';
      const configJson = JSON.stringify(portfolioConfig);

      return `
<div class="flex items-center gap-2 mr-2">
  <span class="font-label-mono text-[10px] text-outline uppercase tracking-wider hidden sm:inline">Recruiter</span>
  <button id="global-recruiter-toggle" class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-surface-variant transition-colors duration-300 focus:outline-none" aria-label="Toggle recruiter view">
    <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-on-surface-variant transition-transform duration-300" id="global-recruiter-thumb" style="transform: translateX(2px)"></span>
  </button>
</div>
<a href="../contact_portfolio/code.html#edit" data-avatar-link="true" class="${wrapperClass} cursor-pointer block hover:scale-105 active:scale-95 transition-transform" title="Admin Settings">
  <img alt="${portfolioConfig.personalInfo.name}" class="w-full h-full object-cover" data-alt="Profile" src="${portfolioConfig.personalInfo.profilePhoto}"/>
</a>
<script>
(function() {
  const config = ${configJson};

  // Override Event Listeners for dynamic scripts loaded via AJAX SPA routing
  const originalAddEventListener = document.addEventListener;
  document.addEventListener = function(type, listener, options) {
    if (type === 'DOMContentLoaded' && document.readyState !== 'loading') {
      setTimeout(listener, 1);
    } else {
      originalAddEventListener.call(this, type, listener, options);
    }
  };

  const originalWindowAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'load' && document.readyState === 'complete') {
      setTimeout(listener, 1);
    } else {
      originalWindowAddEventListener.call(this, type, listener, options);
    }
  };

  // Inject custom CSS classes for recruiter mode and terminal
  if (!document.getElementById('global-recruiter-styles')) {
    const style = document.createElement('style');
    style.id = 'global-recruiter-styles';
    style.innerHTML = \`
      .recruiter-mode .stats-grid-highlight {
        border-color: rgba(192, 193, 255, 0.4) !important;
        box-shadow: 0 0 20px rgba(192, 193, 255, 0.2) !important;
        transform: translateY(-4px) scale(1.02) !important;
      }
      .recruiter-mode .recruiter-show-grid {
        display: grid !important;
      }
      .recruiter-mode .recruiter-highlight-border {
        border-color: var(--color-primary) !important;
      }
      .recruiter-mode .recruiter-glow {
        box-shadow: 0 0 20px rgba(192, 193, 255, 0.2) !important;
      }
      #dev-terminal-console.hidden {
        display: none !important;
      }
      #dev-terminal-output::-webkit-scrollbar {
        width: 4px;
      }
      #dev-terminal-output::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      #dev-terminal-output::-webkit-scrollbar-thumb {
        background: rgba(192, 193, 255, 0.2);
        border-radius: 99px;
      }
    \`;
    document.head.appendChild(style);
  }

  function applyRecruiterView(active) {
    const thumb = document.getElementById('global-recruiter-thumb');
    const toggle = document.getElementById('global-recruiter-toggle');
    const pageToggle = document.getElementById('toggle-recruiter');
    const pageThumb = document.getElementById('toggle-thumb');
    const pageCard = document.getElementById('recruiter-card');

    if (active) {
      document.body.classList.add('recruiter-mode');
      
      // Update global header switch
      if (toggle && thumb) {
        toggle.classList.replace('bg-surface-variant', 'bg-primary');
        thumb.style.transform = 'translateX(18px)';
        thumb.classList.replace('bg-on-surface-variant', 'bg-on-primary');
      }

      // Update page settings switch if it exists
      if (pageToggle && pageThumb) {
        pageToggle.classList.replace('bg-surface-variant', 'bg-primary');
        pageThumb.style.transform = 'translateX(20px)';
        pageThumb.classList.replace('bg-on-surface-variant', 'bg-on-primary');
        if (pageCard) pageCard.classList.add('recruiter-mode-active');
      }

      // Home Page: highlight stats cards
      const statsGrid = document.querySelector('main section.grid-cols-2.md\\\\:grid-cols-4');
      if (statsGrid) {
        statsGrid.querySelectorAll('.glass-card').forEach(card => {
          card.classList.add('stats-grid-highlight');
        });
      }

      // Experience Page: highlight GPA and focus area cards
      const eduStats = document.querySelectorAll('.grid.grid-cols-2.gap-4.mb-8 > .bg-white\\\\/5');
      if (eduStats.length) {
        eduStats.forEach(stat => {
          stat.classList.add('recruiter-highlight-border', 'recruiter-glow');
        });
      }
    } else {
      document.body.classList.remove('recruiter-mode');

      // Update global header switch
      if (toggle && thumb) {
        toggle.classList.replace('bg-primary', 'bg-surface-variant');
        thumb.style.transform = 'translateX(2px)';
        thumb.classList.replace('bg-on-primary', 'bg-on-surface-variant');
      }

      // Update page settings switch if it exists
      if (pageToggle && pageThumb) {
        pageToggle.classList.replace('bg-primary', 'bg-surface-variant');
        pageThumb.style.transform = 'translateX(4px)';
        pageThumb.classList.replace('bg-on-primary', 'bg-on-surface-variant');
        if (pageCard) pageCard.classList.remove('recruiter-mode-active');
      }

      // Remove Home Page Highlights
      const statsGrid = document.querySelector('main section.grid-cols-2.md\\\\:grid-cols-4');
      if (statsGrid) {
        statsGrid.querySelectorAll('.glass-card').forEach(card => {
          card.classList.remove('stats-grid-highlight');
        });
      }

      // Remove Experience highlights
      const eduStats = document.querySelectorAll('.grid.grid-cols-2.gap-4.mb-8 > .bg-white\\\\/5');
      if (eduStats.length) {
        eduStats.forEach(stat => {
          stat.classList.remove('recruiter-highlight-border', 'recruiter-glow');
        });
      }
    }
  }

  // --- TERMINAL CLI EMULATOR ---
  function printLog(outputEl, text, type = '') {
    const log = document.createElement('div');
    if (type === 'cmd') {
      log.innerHTML = \`<span class="text-tertiary">guest@portfolio:~$</span> \${text}\`;
    } else if (type === 'error') {
      log.innerHTML = \`<span class="text-red-400 font-bold">Error:</span> \${text}\`;
    } else {
      log.innerHTML = text;
    }
    outputEl.appendChild(log);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function executeCommand(inputVal) {
    const outputEl = document.getElementById('dev-terminal-output');
    if (!outputEl) return;

    const cmdLine = inputVal.trim();
    printLog(outputEl, cmdLine, 'cmd');

    const args = cmdLine.split(' ');
    const cmd = args[0].toLowerCase();

    if (cmd === 'clear') {
      outputEl.innerHTML = '';
      return;
    }
    
    if (cmd === 'help') {
      printLog(outputEl, 'Available commands:');
      printLog(outputEl, '  <span class="text-primary font-bold">neofetch</span> - Show developer profile summary');
      printLog(outputEl, '  <span class="text-primary font-bold">skills</span>   - List skills and levels');
      printLog(outputEl, '  <span class="text-primary font-bold">projects</span> - Show portfolio projects');
      printLog(outputEl, '  <span class="text-primary font-bold">contact</span>  - Output email and social URLs');
      printLog(outputEl, '  <span class="text-primary font-bold">resume</span>   - Print resume / CV link');
      printLog(outputEl, '  <span class="text-primary font-bold">theme</span>    - Show theme settings status');
      printLog(outputEl, '  <span class="text-primary font-bold">clear</span>    - Flush the terminal logs');
      return;
    }

    if (cmd === 'neofetch') {
      printLog(outputEl, \`
<div class="flex gap-4 items-start py-1 font-mono text-[10px] leading-tight">
  <pre class="text-tertiary font-bold select-none">
  /\\\\_/\\\\  
 ( o.o ) 
  > ^ <  
 /     \\\\ 
 (\\\\  |  /)
  (__|__)
  </pre>
  <div class="space-y-1">
    <div class="text-on-surface font-bold text-xs">\${config.personalInfo.name}</div>
    <div class="text-outline">---------------------</div>
    <div><span class="text-tertiary">OS:</span> PortfolioOS v1.0.0</div>
    <div><span class="text-tertiary">SHELL:</span> Bash v1.2</div>
    <div><span class="text-tertiary">TITLE:</span> \${config.personalInfo.title}</div>
    <div><span class="text-tertiary">EXP:</span> \${config.personalInfo.yearsOfExperience}</div>
    <div><span class="text-tertiary">LOCATION:</span> \${config.personalInfo.location}</div>
    <div><span class="text-tertiary">THEME:</span> Dark Neon</div>
  </div>
</div>
      \`);
      return;
    }

    if (cmd === 'skills') {
      printLog(outputEl, '<span class="text-on-surface font-bold">=== Skills Proficiency Inventory ===</span>');
      (config.skills || []).forEach(cat => {
        printLog(outputEl, \`&nbsp;\`);
        printLog(outputEl, \`<span class="text-tertiary font-bold">\${cat.category}</span>\`);
        (cat.items || []).forEach(item => {
          const barsCount = Math.round(item.level / 5);
          const bars = '█'.repeat(barsCount) + '░'.repeat(20 - barsCount);
          const namePadded = item.name.padEnd(14, '.');
          printLog(outputEl, \`  \${namePadded} [\${bars}] \${item.level}%\`);
        });
      });
      return;
    }

    if (cmd === 'projects') {
      printLog(outputEl, '<span class="text-on-surface font-bold">=== Engineering Projects Showcase ===</span>');
      (config.projects || []).forEach(p => {
        printLog(outputEl, \`&nbsp;\`);
        printLog(outputEl, \`<span class="text-tertiary font-bold">\${p.title}</span> [\${p.category || 'System'}]\`);
        printLog(outputEl, \`  Desc: \${p.description}\`);
        if (p.metrics) {
          printLog(outputEl, \`  Specs: Latency: \${p.metrics.latency || 'N/A'} | FCP: \${p.metrics.fcp || 'N/A'} | Bundle: \${p.metrics.bundleSize || 'N/A'}\`);
        }
      });
      return;
    }

    if (cmd === 'contact') {
      printLog(outputEl, '<span class="text-on-surface font-bold">=== Connection Protocols ===</span>');
      printLog(outputEl, \`  Email:    <a class="text-primary hover:underline" href="mailto:\${config.personalInfo.email}">\${config.personalInfo.email}</a>\`);
      if (config.socialLinks) {
        Object.keys(config.socialLinks).forEach(key => {
          printLog(outputEl, \`  \${key.padEnd(8)}: <a class="text-primary hover:underline" href="\${config.socialLinks[key]}" target="_blank">\${config.socialLinks[key]}</a>\`);
        });
      }
      return;
    }

    if (cmd === 'resume') {
      printLog(outputEl, '<span class="text-on-surface font-bold">=== Resume Connection ===</span>');
      printLog(outputEl, \`  Link: <a class="text-primary hover:underline" href="\${config.personalInfo.resumeUrl}" target="_blank">Google Drive CV Link</a>\`);
      printLog(outputEl, \`  (Type 'open resume' to view or click link)\`);
      return;
    }

    if (cmdLine.toLowerCase() === 'open resume') {
      window.open(config.personalInfo.resumeUrl, '_blank');
      printLog(outputEl, 'Opening resume in new tab...');
      return;
    }

    if (cmd === 'theme') {
      printLog(outputEl, \`System theme is locked to <span class="text-primary font-bold">Dark Mode</span> for optimal visual aesthetics.\`);
      return;
    }

    printLog(outputEl, \`Command not found: \${cmd}. Type <span class="text-primary font-bold">help</span> for assistance.\`, 'error');
  }

  function initTerminal() {
    if (document.getElementById('dev-terminal-console')) return;

    // Create trigger button (floating bottom-left)
    const trigger = document.createElement('button');
    trigger.id = 'dev-terminal-trigger';
    trigger.className = 'fixed bottom-lg left-lg z-50 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg border border-white/10';
    trigger.innerHTML = '<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: \\'FILL\\' 0, \\'wght\\' 500">terminal</span>';
    trigger.title = "Developer CLI Console (Press \` key)";
    document.body.appendChild(trigger);

    // Create console modal
    const consoleDiv = document.createElement('div');
    consoleDiv.id = 'dev-terminal-console';
    consoleDiv.className = 'fixed inset-0 z-[300] flex items-center justify-center hidden p-4';
    consoleDiv.innerHTML = \`
      <div id="dev-terminal-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      <div id="dev-terminal-console-panel" class="relative w-full max-w-2xl h-[400px] bg-black/90 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl p-6 flex flex-col font-mono text-[11px] text-primary z-10">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4 select-none shrink-0">
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            </span>
            <span class="text-on-surface font-bold text-xs">visitor@nanisontyana:~$ developer_cli</span>
          </div>
          <button id="dev-terminal-close" class="text-outline hover:text-white transition-colors flex items-center">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <!-- Output Area -->
        <div id="dev-terminal-output" class="flex-grow overflow-y-auto space-y-2 mb-4 pr-1">
          <div class="text-outline font-bold text-xs select-none">
            Nani Sontyana Developer Command Line Interface (v1.0.0)
          </div>
          <div class="text-outline select-none">
            Type <span class="text-primary font-bold">help</span> to view available operations, or press <span class="text-tertiary font-bold">Esc</span> to dismiss.
          </div>
          <div class="text-outline select-none">----------------------------------------------------</div>
        </div>
        <!-- Input Row -->
        <div class="flex items-center gap-2 border-t border-white/10 pt-3 shrink-0">
          <span class="text-tertiary select-none">guest@portfolio:~$</span>
          <input type="text" id="dev-terminal-input" class="flex-grow bg-transparent border-0 p-0 text-[11px] font-mono text-primary focus:ring-0 focus:outline-none placeholder-primary/20" placeholder="run command..." autocomplete="off" spellcheck="false" autofocus />
        </div>
      </div>
    \`;
    document.body.appendChild(consoleDiv);

    const consolePanel = document.getElementById('dev-terminal-console-panel');
    const terminalInput = document.getElementById('dev-terminal-input');
    const terminalOutput = document.getElementById('dev-terminal-output');
    const closeBtn = document.getElementById('dev-terminal-close');
    const backdrop = document.getElementById('dev-terminal-backdrop');

    function toggleTerminal() {
      const isHidden = consoleDiv.classList.toggle('hidden');
      if (!isHidden) {
        setTimeout(() => {
          terminalInput.focus();
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }, 50);
      }
    }

    trigger.addEventListener('click', toggleTerminal);
    closeBtn.addEventListener('click', toggleTerminal);
    backdrop.addEventListener('click', toggleTerminal);

    window.addEventListener('keydown', (e) => {
      if (e.key === '\`' || e.key === '~') {
        e.preventDefault();
        toggleTerminal();
      } else if (e.key === 'Escape' && !consoleDiv.classList.contains('hidden')) {
        toggleTerminal();
      }
    });

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        if (val.trim()) {
          executeCommand(val);
        }
      }
    });
  }

  // Update nav highlights by toggling classes on existing elements (no innerHTML replacement = no flicker)
  function updateNavHighlights(url) {
    var folders = ['home_portfolio','about_portfolio','projects_portfolio','experience_portfolio','blog_portfolio','contact_portfolio'];
    var activeFolder = '';
    for (var i = 0; i < folders.length; i++) {
      if (url.includes(folders[i])) { activeFolder = folders[i]; break; }
    }
    if (!activeFolder) return;

    // Desktop nav links (inside header, outside mobile drawer)
    var headerEl = document.querySelector('header');
    if (headerEl) {
      var links = headerEl.querySelectorAll('a[href]');
      for (var j = 0; j < links.length; j++) {
        var a = links[j];
        if (a.closest('#mobile-drawer')) continue;
        if (a.getAttribute('data-avatar-link') === 'true') continue;
        var href = a.getAttribute('href') || '';
        var isNavLink = false;
        for (var k = 0; k < folders.length; k++) { if (href.includes(folders[k])) { isNavLink = true; break; } }
        if (!isNavLink) continue;
        if (href.includes(activeFolder)) {
          a.className = 'relative text-primary font-bold font-label-mono text-label-mono transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-full';
        } else {
          a.className = 'relative text-on-surface-variant hover:text-primary font-label-mono text-label-mono transition-colors duration-200';
        }
      }
    }

    // Drawer nav links
    var drawerNav = document.querySelector('#mobile-drawer nav');
    if (drawerNav) {
      var dLinks = drawerNav.querySelectorAll('a[href]');
      for (var d = 0; d < dLinks.length; d++) {
        var da = dLinks[d];
        var dHref = da.getAttribute('href') || '';
        var isDLink = false;
        for (var dk = 0; dk < folders.length; dk++) { if (dHref.includes(folders[dk])) { isDLink = true; break; } }
        if (!isDLink) continue;
        var dDelay = da.style.transitionDelay || '';
        if (dHref.includes(activeFolder)) {
          da.className = 'drawer-item flex items-center gap-md px-lg py-md rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold font-label-mono text-label-mono';
        } else {
          da.className = 'drawer-item flex items-center gap-md px-lg py-md rounded-2xl hover:bg-white/5 text-on-surface-variant hover:text-primary font-label-mono text-label-mono transition-all duration-300';
        }
        if (dDelay) da.style.transitionDelay = dDelay;
      }
    }

    // Bottom nav links (find nav not in header or drawer)
    var allNavs = document.querySelectorAll('nav');
    for (var n = 0; n < allNavs.length; n++) {
      var nav = allNavs[n];
      if (nav.closest('header') || nav.closest('#mobile-drawer')) continue;
      var bLinks = nav.querySelectorAll('a[href]');
      for (var b = 0; b < bLinks.length; b++) {
        var ba = bLinks[b];
        var bHref = ba.getAttribute('href') || '';
        var isBLink = false;
        for (var bk = 0; bk < folders.length; bk++) { if (bHref.includes(folders[bk])) { isBLink = true; break; } }
        if (!isBLink) continue;
        if (bHref.includes(activeFolder)) {
          ba.className = 'flex flex-col items-center justify-center gap-[3px] flex-1 relative text-primary';
          ba.setAttribute('aria-current', 'page');
          if (!ba.querySelector('[data-nav-indicator]')) {
            var ind = document.createElement('div');
            ind.className = 'absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-b-full';
            ind.setAttribute('data-nav-indicator', '');
            ba.insertBefore(ind, ba.firstChild);
          }
          var bTxt = ba.querySelector('span:last-child');
          if (bTxt && !bTxt.classList.contains('font-bold')) bTxt.classList.add('font-bold');
        } else {
          ba.className = 'flex flex-col items-center justify-center gap-[3px] flex-1 text-on-surface-variant hover:text-primary transition-colors duration-200 active:scale-95';
          ba.removeAttribute('aria-current');
          var existInd = ba.querySelector('[data-nav-indicator]');
          if (existInd) existInd.remove();
          var bTxt2 = ba.querySelector('span:last-child');
          if (bTxt2) bTxt2.classList.remove('font-bold');
        }
      }
    }
  }

  // SPA Router for smooth page transitions
  function navigateTo(url) {
    if (window.location.href === url) return;
    history.pushState(null, '', url);
    loadPage(url);
  }

  window.addEventListener('popstate', () => {
    loadPage(window.location.href, true);
  });

  async function loadPage(url, isPopState) {
    const main = document.querySelector('main');
    if (!main) return;

    // Close mobile drawer if open
    const drawer = document.getElementById('mobile-drawer');
    if (drawer && drawer.classList.contains('open')) {
      const closeBtn = document.getElementById('mobile-drawer-close');
      if (closeBtn) {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    // Fade out main content
    main.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
    main.style.opacity = '0';
    main.style.transform = 'translateY(8px)';
    
    await new Promise(r => setTimeout(r, 150));

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed: " + res.status);
      const htmlText = await res.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      // Update title
      document.title = doc.title;

      // Clean up old SPA scripts to prevent memory build-up
      document.querySelectorAll('script[data-spa-script="true"]').forEach(s => s.remove());

      // Swap main container content and classes
      const docMain = doc.querySelector('main');
      if (docMain) {
        main.innerHTML = docMain.innerHTML;
        main.className = docMain.className;
      }

      // Update Navigation highlights (class-based, no innerHTML replacement = no flicker)
      updateNavHighlights(url);

      // Synchronize window.PORTFOLIO_CONFIG
      const configScript = doc.querySelector('script[id^="stitch-config-json"]') || Array.from(doc.querySelectorAll('script')).find(s => (s.textContent || s.innerHTML || '').includes('window.PORTFOLIO_CONFIG =') && !(s.textContent || s.innerHTML || '').includes('configScript'));
      console.log("[SPA Router] configScript found:", !!configScript);
      if (configScript) {
        const scriptText = configScript.textContent || configScript.innerHTML || '';
        console.log("[SPA Router] scriptText snippet:", scriptText.substring(0, 100));
        try {
          const match = scriptText.match(/window\\.PORTFOLIO_CONFIG\\s*=\\s*(\\{[\\s\\S]*?\\});/);
          console.log("[SPA Router] regex match found:", !!match);
          if (match) {
            window.PORTFOLIO_CONFIG = JSON.parse(match[1]);
            console.log("[SPA Router] window.PORTFOLIO_CONFIG synced successfully. blogPosts count:", window.PORTFOLIO_CONFIG?.blogPosts?.length);
          }
        } catch (e) {
          console.error("[SPA Router] Failed to parse config from loaded page script:", e);
        }
      } else {
        console.warn("[SPA Router] configScript not found in fetched document.");
      }

      // Execute scripts in main
      executePageScripts(main);

      // Load only NEW external scripts (CDN libs like Marked.js, Prism.js)
      // Skip inline body scripts to prevent duplicate event listeners
      var bodyScripts = Array.from(doc.querySelectorAll('script')).filter(function(s) {
        var inHeader = s.closest('header');
        var inDrawer = s.closest('#mobile-drawer');
        var inMain = s.closest('main');
        return !inHeader && !inDrawer && !inMain;
      });
      var loadedSrcs = new Set(Array.from(document.querySelectorAll('script[src]')).map(function(s) { return s.src; }));
      bodyScripts.forEach(function(oldScript) {
        var src = oldScript.getAttribute('src');
        if (src) {
          var tmp = document.createElement('a'); tmp.href = src;
          if (!loadedSrcs.has(tmp.href)) {
            var newScript = document.createElement('script');
            newScript.setAttribute('data-spa-script', 'true');
            Array.from(oldScript.attributes).forEach(function(attr) { newScript.setAttribute(attr.name, attr.value); });
            document.body.appendChild(newScript);
            loadedSrcs.add(tmp.href);
          }
        }
      });

      // Scroll to top
      window.scrollTo(0, 0);

      // Trigger popstate routing event hooks if needed (e.g. for blog posts details page hash checks)
      window.dispatchEvent(new Event('hashchange'));

    } catch (err) {
      console.error("SPA routing error, performing fallback full redirect:", err);
      window.location.href = url;
      return;
    }

    // Fade back in with proper transition (double rAF ensures browser paints the faded state first)
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        main.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
      });
    });
  }

  function executePageScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      newScript.setAttribute('data-spa-script', 'true');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  // Intercept relative page anchor clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
    if (href.includes('drive.google.com') || href.toLowerCase().endsWith('.pdf')) return;
    
    if (href.includes('code.html') || href.startsWith('/') || href.startsWith('..')) {
      e.preventDefault();
      navigateTo(link.href);
    }
  });

  // Bind state and click handlers
  document.addEventListener('DOMContentLoaded', () => {
    const isModeActive = localStorage.getItem('recruiterMode') === 'true';
    applyRecruiterView(isModeActive);
    initTerminal();

    // Header Switch Click Handler
    const toggle = document.getElementById('global-recruiter-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const active = localStorage.getItem('recruiterMode') === 'true';
        const newState = !active;
        localStorage.setItem('recruiterMode', newState ? 'true' : 'false');
        applyRecruiterView(newState);
      });
    }

    // Settings Page Switch Click Handler
    const pageToggle = document.getElementById('toggle-recruiter');
    if (pageToggle) {
      pageToggle.addEventListener('click', () => {
        const active = localStorage.getItem('recruiterMode') === 'true';
        const newState = !active;
        localStorage.setItem('recruiterMode', newState ? 'true' : 'false');
        applyRecruiterView(newState);
      });
    }
  });
})();
</script>
      `;
    },
    NAV_DESKTOP: () => {
      let activeTab = 'Home';
      if (dir === 'projects_portfolio') activeTab = 'Projects';
      if (dir === 'experience_portfolio') activeTab = 'Experience';
      if (dir === 'contact_portfolio') activeTab = 'Settings';
      if (dir === 'about_portfolio') activeTab = 'About';
      if (dir === 'blog_portfolio') activeTab = 'Blog';
      return getDesktopNav(activeTab);
    },
    NAV_MOBILE: () => {
      let activeTab = 'Home';
      if (dir === 'projects_portfolio') activeTab = 'Projects';
      if (dir === 'experience_portfolio') activeTab = 'Experience';
      if (dir === 'contact_portfolio') activeTab = 'Settings';
      if (dir === 'about_portfolio') activeTab = 'About';
      if (dir === 'blog_portfolio') activeTab = 'Blog';
      return getMobileNav(activeTab);
    },
    HERO_NAME: () => {
      const parts = portfolioConfig.personalInfo.name.split(' ');
      const first = parts[0];
      const rest = parts.slice(1).join(' ');
      return `<h2 class="font-display text-[48px] md:text-display leading-tight">
                    ${first} <span class="text-primary">${rest}</span>
</h2>`;
    },
    HERO_INTRO: () => {
      return `<p class="font-headline-md text-headline-md text-on-surface-variant max-w-xl mx-auto md:mx-0">
                    ${portfolioConfig.personalInfo.introduction}
                </p>`;
    },
    HERO_PORTRAIT: () => {
      return `<img alt="${portfolioConfig.personalInfo.name} Portrait" class="w-full h-full object-cover" data-alt="Close-up portrait of ${portfolioConfig.personalInfo.name}" src="${portfolioConfig.personalInfo.profilePhoto}"/>`;
    },
    STATS: () => getHomeStatsHtml(portfolioConfig.stats),
    FEATURED_PROJECTS: () => getFeaturedProjectsHtml(portfolioConfig.projects),
    SOCIALS_FLOATING: () => getFloatingSocialsHtml(portfolioConfig.socialLinks),
    STATS_TOTAL: () => {
      const count = portfolioConfig.projects.length;
      return `<span class="font-label-mono text-primary text-label-mono uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">${count} Builds Live</span>`;
    },
    PROJECTS_GRID: () => getProjectsGridHtml(portfolioConfig.projects),
    EXPERIENCE: () => getExperienceHtml(portfolioConfig.experience),
    EDUCATION: () => getEducationHtml(portfolioConfig.education),
    STATS_SKILLS: () => getStatsSkillsHtml(portfolioConfig.stats),
    SKILLS: () => {
      if (dir === 'about_portfolio') {
        return getAboutSkillsHtml(portfolioConfig.skills);
      } else {
        return getExperienceSkillsHtml(portfolioConfig.skills);
      }
    },
    SKILLS_SUMMARY: () => getSkillsSummaryHtml(portfolioConfig.skillsSummary),
    PROFILE_HEADER: () => {
      if (dir === 'about_portfolio') {
        return getAboutBentoHtml(portfolioConfig.personalInfo);
      } else {
        return getContactProfileHeaderHtml(portfolioConfig.personalInfo, portfolioConfig.skills);
      }
    },
    SOCIALS_GRID: () => getSocialsGridHtml(portfolioConfig.socialLinks),
    LOCATION_WIDGET: () => getLocationWidgetHtml(portfolioConfig.personalInfo.location),
    STATS_GRID: () => getStatsGridHtml(portfolioConfig.stats),
    CONFIG_JSON: () => `<script id="stitch-config-json">window.PORTFOLIO_CONFIG = ${JSON.stringify(portfolioConfig)};</script>`,
    ABOUT_INTRO: () => {
      return `<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                    I'm ${portfolioConfig.personalInfo.name}, a ${portfolioConfig.personalInfo.title}. ${portfolioConfig.personalInfo.shortBio}
                </p>`;
    },
    ABOUT_LOCATION: () => {
      return `<div class="flex items-center gap-sm text-primary">
<span class="material-symbols-outlined" data-icon="location_on">location_on</span>
<span class="font-label-mono text-label-mono">${portfolioConfig.personalInfo.location}</span>
</div>`;
    },
    ABOUT_EMAIL: () => {
      return `<div class="flex items-center gap-sm text-on-surface-variant">
<span class="material-symbols-outlined" data-icon="mail">mail</span>
<span class="font-label-mono text-label-mono">${portfolioConfig.personalInfo.email}</span>
</div>`;
    },
    ABOUT_RESUME: () => {
      return `<div class="mt-md">
<a href="${portfolioConfig.personalInfo.resumeUrl || '#'}" class="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold hover:brightness-110 hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] transition-all active:scale-95 inline-block">Download CV</a>
</div>`;
    },
    PROJECTS_GITHUB: () => {
      return `<a class="bg-primary text-on-primary font-label-mono text-label-mono px-8 py-4 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all" href="${portfolioConfig.socialLinks.github || '#'}" target="_blank">
<span class="material-symbols-outlined">terminal</span>
            GITHUB REPOS
          </a>`;
    },
    PROJECTS_RESUME: () => {
      return `<a class="bg-surface-container border border-white/10 text-on-surface font-label-mono text-label-mono px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-all" href="${portfolioConfig.personalInfo.resumeUrl || '#'}" target="_blank">
<span class="material-symbols-outlined">description</span>
            VIEW RESUME
          </a>`;
    }
  };

  // Perform replacements for each marker
  Object.keys(replacements).forEach(marker => {
    const startTag = `<!-- STITCH_${marker}_START -->`;
    const endTag = `<!-- STITCH_${marker}_END -->`;
    
    // Look for matching start and end comments (possibly with nested content)
    const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, 'g');
    
    if (html.match(regex)) {
      try {
        const replacementValue = replacements[marker]();
        html = html.replace(regex, `${startTag}\n${replacementValue}\n${endTag}`);
        console.log(`  - Replaced marker: STITCH_${marker} in ${dir}`);
      } catch (err) {
        console.error(`Error replacing STITCH_${marker} in ${dir}:`, err);
      }
    }
  });

  if (html !== originalHtml) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Successfully compiled page: ${filePath}`);
  } else {
    console.log(`No changes made to: ${filePath}`);
  }
});

console.log('Stitch compiler completed successfully.');
}

module.exports = { compile };

if (require.main === module) {
  try {
    compile();
  } catch (err) {
    console.error('Compilation failed:', err);
    process.exit(1);
  }
}
