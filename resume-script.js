// Theme Toggle (Text-based, Light default)
const html = document.documentElement;
const themeOptions = document.querySelectorAll('.theme-option');

// Set light mode as default
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    html.classList.add('dark-theme');
}

// Update active theme button
themeOptions.forEach(option => {
    if (option.dataset.theme === currentTheme) {
        option.classList.add('active');
    } else {
        option.classList.remove('active');
    }
});

// Theme toggle handler
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        
        // Update active state
        themeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Apply theme
        if (theme === 'dark') {
            html.classList.add('dark-theme');
        } else {
            html.classList.remove('dark-theme');
        }
        
        localStorage.setItem('theme', theme);
    });
});

// Smooth Scroll Navigation
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
// Blur pool excludes the hero — it should never blur or become transparent
const blurSections = document.querySelectorAll('.section:not(#hero)');

// Handle nav link clicks
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            if (targetId === 'hero') {
                // Overview = scroll to absolute top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Other sections: offset below the sticky hero bar
                const heroEl = document.getElementById('hero');
                const heroH = heroEl ? heroEl.offsetHeight : 0;
                const navEl = document.querySelector('.side-nav');
                // On mobile the nav is sticky at top; on desktop it's a fixed sidebar (no vertical offset needed)
                const mobileNavH = (window.innerWidth <= 768 && navEl) ? navEl.offsetHeight : 0;
                const totalOffset = mobileNavH + heroH + 16;
                const top = targetSection.getBoundingClientRect().top + window.pageYOffset - totalOffset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    });
});

// Blur Effect - Global Variables
let blurIntensity = 35; // Default 35%, will be overridden by Notion

function applyBlurEffect() {
    // Calculate blur amount based on intensity (0-100 scale to 0-10px blur)
    const blurPx = (blurIntensity / 100) * 10;
    document.documentElement.style.setProperty('--blur-amount', `${blurPx}px`);
}

function updateActiveSection() {
    let current = '';
    const heroEl = document.getElementById('hero');
    const heroH = heroEl ? heroEl.offsetHeight : 0;
    const navEl = document.querySelector('.side-nav');
    const mobileNavH = (window.innerWidth <= 768 && navEl) ? navEl.offsetHeight : 0;
    const offset = mobileNavH + heroH + 16;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - offset) {
            current = section.getAttribute('id');
        }
    });
    
    // Update nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
    
    // Apply blur effect — never blurs #hero
    if (blurIntensity > 0 && current && current !== 'hero') {
        blurSections.forEach(section => {
            if (section.getAttribute('id') === current) {
                section.classList.remove('blurred');
            } else {
                section.classList.add('blurred');
            }
        });
    } else {
        blurSections.forEach(section => section.classList.remove('blurred'));
    }
}

window.addEventListener('scroll', updateActiveSection);

// Load Settings from Notion
function loadSettings(settings) {
    console.log('🎯 Loading settings:', settings);
    
    // Update name
    if (settings.name) {
        const navName = document.getElementById('nav-name');
        if (navName) navName.textContent = settings.name;
        
        const footerName = document.getElementById('footer-name');
        if (footerName) footerName.textContent = settings.name;
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = `${settings.name} - Resume`;
    }
    
    // Update subtitle
    if (settings.subtitle) {
        const navSubtitle = document.getElementById('nav-subtitle');
        if (navSubtitle) navSubtitle.textContent = settings.subtitle;
    }
    
    // Update profile photo
    if (settings.profilePhotoUrl) {
        const navPhoto = document.getElementById('nav-profile-photo');
        if (navPhoto) navPhoto.src = settings.profilePhotoUrl;
    }
    
    // Update blur intensity
    if (settings.blurIntensity !== undefined && settings.blurIntensity !== null) {
        blurIntensity = Math.max(0, Math.min(100, settings.blurIntensity));
        applyBlurEffect();
        console.log(`✅ Blur intensity set to: ${blurIntensity}`);
    }
    
    // Apply custom colors
    const root = document.documentElement;
    
    if (settings.sectionHeaderColor) {
        root.style.setProperty('--section-header-color', settings.sectionHeaderColor);
    }
    
    if (settings.jobTitleColor) {
        root.style.setProperty('--job-title-color', settings.jobTitleColor);
    }
    
    if (settings.heroStatsColor) {
        root.style.setProperty('--hero-stats-color', settings.heroStatsColor);
    }
    
    if (settings.borderColor) {
        root.style.setProperty('--border-color', settings.borderColor);
    }
    
    if (settings.dividerColor) {
        root.style.setProperty('--divider-color', settings.dividerColor);
    }
    
    // Update section headers
    const headerMap = {
        'impact-header': settings.impactSectionHeader,
        'profile-header': settings.profileSectionHeader,
        'experience-header': settings.experienceSectionHeader,
        'education-header': settings.educationSectionHeader,
        'social-header': settings.socialSectionHeader,
        'projects-header': settings.projectsSectionHeader
    };
    
    Object.keys(headerMap).forEach(id => {
        const element = document.getElementById(id);
        if (element && headerMap[id]) {
            element.textContent = headerMap[id];
        }
    });
    
    // Update section subheaders
    const subheaderMap = {
        'impact-subheader': settings.impactSectionSubheader,
        'profile-subheader': settings.profileSectionSubheader,
        'experience-subheader': settings.experienceSectionSubheader,
        'education-subheader': settings.educationSectionSubheader,
        'social-subheader': settings.socialSectionSubheader,
        'projects-subheader': settings.projectsSectionSubheader
    };
    
    Object.keys(subheaderMap).forEach(id => {
        const element = document.getElementById(id);
        if (element && subheaderMap[id]) {
            element.textContent = subheaderMap[id];
        }
    });

    // Update left nav link labels
    const navLabelMap = {
        'hero':       settings.navLabelOverview,
        'profile':    settings.navLabelProfile,
        'experience': settings.navLabelExperience,
        'education':  settings.navLabelEducation,
        'social':     settings.navLabelSocial,
        'projects':   settings.navLabelProjects
    };

    navLinks.forEach(link => {
        const targetId = link.getAttribute('href')?.substring(1);
        if (targetId && navLabelMap[targetId]) {
            link.textContent = navLabelMap[targetId];
        }
    });
}

// Load Content from Notion
function loadContent(content) {
    console.log('📦 Loading content:', content);
    
    // Separate content by section type
    const experience = content.filter(item => item.sectionType === 'Experience');
    const education = content.filter(item => item.sectionType === 'Education');
    const certifications = content.filter(item => item.sectionType === 'Certification');
    const social = content.filter(item => item.sectionType === 'Social');
    const projects = content.filter(item => item.sectionType === 'Project');
    
    // Load certifications
    if (certifications.length > 0) {
        loadCertifications(certifications);
    }
    
    // Load experience
    if (experience.length > 0) {
        loadExperience(experience);
    }
    
    // Load education
    if (education.length > 0) {
        loadEducation(education);
    }
    
    // Load social
    if (social.length > 0) {
        loadSocial(social);
    }
    
    // Load projects
    if (projects.length > 0) {
        loadProjects(projects);
    }
}

function loadCertifications(certs) {
    const container = document.getElementById('certifications-container');
    if (!container) return;
    
    container.innerHTML = certs.map(cert => `
        <div class="cert-badge">
            ${cert.imageUrl ? `
                <div class="cert-image-container">
                    <img src="${cert.imageUrl}" alt="${cert.name}" class="cert-image">
                </div>
            ` : ''}
            <div class="cert-details">
                <div class="cert-name">${cert.name}</div>
                ${cert.title ? `<div class="cert-issuer">${cert.title}</div>` : ''}
                ${cert.description ? `
                    <a href="${cert.description}" target="_blank" rel="noopener noreferrer" class="cert-link">
                        View Credential
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" x2="21" y1="14" y2="3"></line>
                        </svg>
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function loadExperience(experiences) {
    const container = document.getElementById('experience-container');
    if (!container) return;
    
    // Group by company
    const companies = {};
    experiences.forEach(exp => {
        if (!companies[exp.name]) {
            companies[exp.name] = [];
        }
        companies[exp.name].push(exp);
    });
    
    container.innerHTML = Object.keys(companies).map(companyName => {
        const roles = companies[companyName];
        const dateRange = roles[0].dateRange || '';
        const description = roles[0].description || '';
        
        return `
            <div class="experience-block">
                <div class="experience-header">
                    <div>
                        <h3 class="company-name">${companyName}</h3>
                        ${description ? `<p class="role-scope">${description}</p>` : ''}
                    </div>
                    <div class="date-range">${dateRange}</div>
                </div>
                ${roles.map(role => `
                    <div class="role-block">
                        <div class="role-header">
                            <h4 class="role-title">${role.title || ''}</h4>
                            ${role.dateRange ? `<span class="role-date">${role.dateRange}</span>` : ''}
                        </div>
                        ${role.bullets ? `
                            <ul class="achievements">
                                ${role.bullets.split('\n').filter(b => b.trim()).map(bullet => `
                                    <li>${bullet.trim()}</li>
                                `).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

function loadEducation(education) {
    const container = document.getElementById('education-container');
    if (!container) return;
    
    container.innerHTML = education.map(edu => `
        <div class="education-item">
            <h3 class="degree">${edu.title || ''}</h3>
            <p class="school">${edu.name}</p>
            ${edu.dateRange ? `<p class="grad-year">${edu.dateRange}</p>` : ''}
        </div>
    `).join('');
}

function loadSocial(social) {
    const container = document.getElementById('social-container');
    if (!container) return;
    
    container.innerHTML = social.map(item => `
        <div class="social-item">
            <div class="item-header">
                <h3 class="item-title">${item.name}</h3>
                ${item.title ? `<p class="item-subtitle">${item.title}</p>` : ''}
            </div>
            ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
            ${item.bullets ? `
                <ul class="achievements">
                    ${item.bullets.split('\n').filter(b => b.trim()).map(bullet => `
                        <li>${bullet.trim()}</li>
                    `).join('')}
                </ul>
            ` : ''}
        </div>
    `).join('');
}

function loadProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = projects.map(project => `
        <div class="project-item">
            <div class="item-header">
                <h3 class="item-title">${project.name}</h3>
                ${project.title ? `<p class="item-subtitle">${project.title}</p>` : ''}
            </div>
            ${project.description ? `<p class="item-description">${project.description}</p>` : ''}
            ${project.bullets ? `
                <ul class="achievements">
                    ${project.bullets.split('\n').filter(b => b.trim()).map(bullet => `
                        <li>${bullet.trim()}</li>
                    `).join('')}
                </ul>
            ` : ''}
            ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.name}" style="max-width: 100%; margin-top: 1rem; border-radius: 2px;">` : ''}
        </div>
    `).join('');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Load data from Notion
    try {
        const response = await fetch('./data.json');
        const data = await response.json();
        
        if (data.settings) {
            loadSettings(data.settings);
        }
        
        if (data.content) {
            loadContent(data.content);
        }
    } catch (error) {
        console.error('Error loading Notion data:', error);
    }
    
    // Set initial active section
    updateActiveSection();
    applyBlurEffect();

    // Mobile collapsible nav
    initMobileNav();
});

function initMobileNav() {
    const isMobile = () => window.innerWidth <= 768;
    const sideNav = document.querySelector('.side-nav');
    const navHeader = document.querySelector('.nav-header');
    if (!sideNav || !navHeader) return;

    // Inject chevron icon into nav header
    if (!navHeader.querySelector('.nav-toggle-icon')) {
        const icon = document.createElement('span');
        icon.className = 'nav-toggle-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '&#9660;'; // ▼
        navHeader.appendChild(icon);
    }

    // Wrap collapsible nav body if not already wrapped
    const navContent = document.querySelector('.nav-content');
    if (navContent && !navContent.querySelector('.nav-collapsible')) {
        const collapsible = document.createElement('div');
        collapsible.className = 'nav-collapsible';
        // Move everything except nav-header into the collapsible wrapper
        Array.from(navContent.children).forEach(child => {
            if (!child.classList.contains('nav-header')) {
                collapsible.appendChild(child);
            }
        });
        navContent.appendChild(collapsible);
    }

    // Toggle on header click (mobile only)
    navHeader.addEventListener('click', () => {
        if (!isMobile()) return;
        sideNav.classList.toggle('nav-open');
    });

    // Close nav when a link is clicked on mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (isMobile()) {
                sideNav.classList.remove('nav-open');
            }
        });
    });
}
