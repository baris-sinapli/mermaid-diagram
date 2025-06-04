(function() {
  console.log('🌊 Mermaid GUI Debug: Script loading started');
  
  window.debugMermaidGUI = {
    checkElements: function() {
      const elements = {
        'theme-toggle': document.getElementById('theme-toggle'),
        'mobile-menu-toggle': document.getElementById('mobile-menu-toggle'),
        'nav-menu': document.getElementById('nav-menu'),
        'loading-indicator': document.getElementById('loading-indicator')
      };
      
      console.log('🔍 Element check:', elements);
      return elements;
    },
    
    checkCSS: function() {
      const styles = getComputedStyle(document.documentElement);
      console.log('🎨 CSS Variables:', {
        background: styles.getPropertyValue('--background'),
        primary: styles.getPropertyValue('--primary'),
        border: styles.getPropertyValue('--border')
      });
    },
    
    forceTheme: function(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      console.log('🎭 Theme forced to:', theme);
    }
  };
  
  // Auto-check on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.debugMermaidGUI.checkElements();
      window.debugMermaidGUI.checkCSS();
    }, 1000);
  });
})();

// Configuration
const CONFIG = {
  github: {
    owner: 'baris-sinapli',
    repo: 'mermaid-diagram'
  },
  api: {
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 10000
  },
  ui: {
    loadingDelay: 500,
    animationDuration: 300,
    scrollThreshold: 100
  }
};

// Utility Functions
class Utils {
  static debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  static throttle(func, wait) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, wait);
      }
    };
  }

  static formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  static async retry(fn, attempts = CONFIG.api.retryAttempts, delay = CONFIG.api.retryDelay) {
    try {
      return await fn();
    } catch (error) {
      if (attempts > 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, attempts - 1, delay * 2);
      }
      throw error;
    }
  }

  static createToast(message, type = 'info', duration = 5000) {
    const toastContainer = this.getOrCreateToastContainer();
    const toast = document.createElement('div');

    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">${this.getToastIcon(type)}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" aria-label="Close">&times;</button>
      </div>
    `;

    // Add styles
    Object.assign(toast.style, {
      position: 'relative',
      background: this.getToastColor(type),
      color: 'white',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      marginBottom: '0.5rem',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease, opacity 0.3s ease',
      opacity: '0'
    });

    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.removeToast(toast));

    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.removeToast(toast), duration);
    }

    return toast;
  }

  static getOrCreateToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: '9999',
        maxWidth: '400px',
        width: '100%'
      });
      document.body.appendChild(container);
    }
    return container;
  }

  static removeToast(toast) {
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  static getToastIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  static getToastColor(type) {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    return colors[type] || colors.info;
  }

  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        this.createToast('Copied to clipboard!', 'success', 2000);
      } else {
        this.fallbackCopyTextToClipboard(text);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      this.createToast('Failed to copy to clipboard', 'error');
    }
  }

  static fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.createToast('Copied to clipboard!', 'success', 2000);
      } else {
        this.createToast('Failed to copy to clipboard', 'error');
      }
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
      this.createToast('Failed to copy to clipboard', 'error');
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// Loading Manager
class LoadingManager {
  constructor() {
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.isLoading = true;
    this.init();
  }

  init() {
    // Hide loading after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.hide();
      }, CONFIG.ui.loadingDelay);
    });
  }

  show() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.remove('hidden');
      this.isLoading = true;
    }
  }

  hide() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add('hidden');
      this.isLoading = false;
    }
  }
}

// Theme Manager
class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.init();
  }

  init() {
    // Get saved theme or detect system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.setTheme(this.currentTheme);

    // Add event listeners
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update meta theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#ffffff';
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
}

// Navigation Manager
class NavigationManager {
  constructor() {
    this.nav = document.getElementById('main-nav');
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    this.navMenu = document.getElementById('nav-menu');
    this.isMenuOpen = false;
    this.lastScrollY = 0;
    this.init();
  }

  init() {
    this.setupSmoothScrolling();
    this.setupScrollEffects();
    this.setupMobileMenu();
    this.setupActiveNavLinks();
  }

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          if (this.isMenuOpen) {
            this.toggleMobileMenu();
          }
        }
      });
    });
  }

  setupScrollEffects() {
    const handleScroll = Utils.throttle(() => {
      const currentScrollY = window.pageYOffset;

      // Add scrolled class to nav
      if (currentScrollY > CONFIG.ui.scrollThreshold) {
        this.nav?.classList.add('scrolled');
      } else {
        this.nav?.classList.remove('scrolled');
      }

      this.lastScrollY = currentScrollY;
    }, 16);

    window.addEventListener('scroll', handleScroll);
  }

  setupMobileMenu() {
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen &&
        !this.navMenu?.contains(e.target) &&
        !this.mobileMenuToggle?.contains(e.target)) {
        this.toggleMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.toggleMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.classList.toggle('active');
    }

    if (this.navMenu) {
      this.navMenu.classList.toggle('mobile-open');
    }

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  setupActiveNavLinks() {
    const updateActiveNavLink = Utils.throttle(() => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

      let current = '';
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.offsetHeight;
        if (sectionTop <= 150 && sectionTop + sectionHeight > 150) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }, 16);

    window.addEventListener('scroll', updateActiveNavLink);
  }
}

// GitHub API Manager
class GitHubAPIManager {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.repoURL = `${this.baseURL}/repos/${CONFIG.github.owner}/${CONFIG.github.repo}`;
    this.cache = new Map();
    this.init();
  }

  async init() {
    try {
      await Promise.allSettled([
        this.updateStarCount(),
        this.updateDownloadCount(),
        this.updateReleaseInfo()
      ]);
    } catch (error) {
      console.warn('Failed to load GitHub data:', error);
      this.showFallbackData();
    }
  }

  async makeRequest(url, cacheKey, ttl = 300000) { // 5 minutes TTL
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async updateStarCount() {
    try {
      const data = await Utils.retry(() =>
        this.makeRequest(this.repoURL, 'repo-info')
      );

      const starsElement = document.getElementById('github-stars');
      if (starsElement && data.stargazers_count !== undefined) {
        this.animateNumber(starsElement, data.stargazers_count);
      }
    } catch (error) {
      console.warn('Failed to fetch star count:', error);
      this.setFallbackValue('github-stars', '⭐');
    }
  }

  async updateDownloadCount() {
    try {
      const releases = await Utils.retry(() =>
        this.makeRequest(`${this.repoURL}/releases`, 'releases')
      );

      let totalDownloads = 0;
      releases.forEach(release => {
        release.assets.forEach(asset => {
          totalDownloads += asset.download_count || 0;
        });
      });

      const downloadsElement = document.getElementById('download-count');
      if (downloadsElement) {
        this.animateNumber(downloadsElement, totalDownloads);
      }
    } catch (error) {
      console.warn('Failed to fetch download count:', error);
      this.setFallbackValue('download-count', '⬇️');
    }
  }

  async updateReleaseInfo() {
    try {
      const release = await Utils.retry(() =>
        this.makeRequest(`${this.repoURL}/releases/latest`, 'latest-release')
      );

      // Update version badge
      const versionBadge = document.getElementById('version-badge');
      if (versionBadge && release.tag_name) {
        versionBadge.textContent = release.tag_name;
      }

      // Update download links
      this.updateDownloadLinks(release.assets);
    } catch (error) {
      console.warn('Failed to fetch latest release:', error);
    }
  }

  updateDownloadLinks(assets) {
    if (!assets || !assets.length) return;

    const platformMap = {
      'windows': /\.(msi|exe)$/i,
      'macos': /\.(dmg|pkg)$/i,
      'linux-deb': /\.deb$/i,
      'linux-rpm': /\.rpm$/i,
      'linux-appimage': /\.AppImage$/i
    };

    assets.forEach(asset => {
      for (const [platform, pattern] of Object.entries(platformMap)) {
        if (pattern.test(asset.name)) {
          const linkElement = document.querySelector(`[data-platform="${platform}"]`);
          if (linkElement) {
            linkElement.href = asset.browser_download_url;
            linkElement.setAttribute('data-size', this.formatFileSize(asset.size));
          }
        }
      }
    });
  }

  animateNumber(element, finalValue) {
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOut);

      element.textContent = Utils.formatNumber(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = Utils.formatNumber(finalValue);
      }
    };

    requestAnimationFrame(animate);
  }

  setFallbackValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  showFallbackData() {
    this.setFallbackValue('github-stars', '⭐');
    this.setFallbackValue('download-count', '⬇️');
  }

  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Animation Manager
class AnimationManager {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupParallaxEffects();
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');

          // Add stagger animation for groups
          if (entry.target.hasAttribute('data-stagger')) {
            this.addStaggerAnimation(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe elements that should animate in
    document.querySelectorAll('[data-animate], .trust-item, .floating-card').forEach(el => {
      observer.observe(el);
    });

    this.observers.set('intersection', observer);
  }

  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    const handleParallax = Utils.throttle(() => {
      const scrollY = window.pageYOffset;

      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;

        // Only apply parallax if element is in viewport
        if (scrollY + windowHeight > elementTop && scrollY < elementTop + elementHeight) {
          const yPos = -(scrollY - elementTop) * speed;
          element.style.transform = `translateY(${yPos}px)`;
        }
      });
    }, 16);

    window.addEventListener('scroll', handleParallax);
  }

  addStaggerAnimation(container) {
    const children = container.children;
    Array.from(children).forEach((child, index) => {
      child.style.animationDelay = `${index * 100}ms`;
      child.classList.add('stagger-animate');
    });
  }
}

// Performance Monitor
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    this.measurePageLoad();
    this.setupPerformanceObserver();
  }

  measurePageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      this.metrics.loadTime = perfData.loadEventEnd - perfData.fetchStart;
      this.metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
      this.metrics.firstPaint = performance.getEntriesByType('paint')[0]?.startTime || 0;

      console.log('Performance Metrics:', this.metrics);

      // Show slow loading warning
      if (this.metrics.loadTime > 5000) {
        Utils.createToast('Page loaded slowly. Check your connection.', 'warning');
      }
    });
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.lcp = entry.startTime;
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }
}

// Error Handler
class ErrorHandler {
  constructor() {
    this.errorCount = 0;
    this.maxErrors = 5;
    this.init();
  }

  init() {
    window.addEventListener('error', (e) => {
      this.handleError(e.error, 'JavaScript Error', e.filename, e.lineno);
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.handleError(e.reason, 'Unhandled Promise Rejection');
      e.preventDefault();
    });
  }

  handleError(error, type, filename = '', lineno = 0) {
    this.errorCount++;

    console.error(`${type}:`, error);

    // Don't spam user with too many error messages
    if (this.errorCount <= this.maxErrors) {
      const message = `An error occurred. Please refresh the page if problems persist.`;
      Utils.createToast(message, 'error', 0);
    }

    // Log error for debugging (could send to analytics in production)
    this.logError(error, type, filename, lineno);
  }

  logError(error, type, filename, lineno) {
    const errorData = {
      message: error.message || error,
      type,
      filename,
      lineno,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // In production, you might want to send this to an error reporting service
    console.log('Error logged:', errorData);
  }
}

// Analytics Manager
class AnalyticsManager {
  constructor() {
    this.events = [];
    this.init();
  }

  init() {
    this.trackPageView();
    this.setupEventTracking();
  }

  trackPageView() {
    this.trackEvent('page_view', {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer
    });
  }

  setupEventTracking() {
    // Track download clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      if (link.href.includes('download') || link.href.includes('releases')) {
        this.trackEvent('download_click', {
          platform: this.detectPlatform(link.href),
          url: link.href
        });
      }

      if (link.href.startsWith('http') && !link.href.includes(window.location.hostname)) {
        this.trackEvent('external_link_click', {
          url: link.href,
          text: link.textContent.trim()
        });
      }
    });

    // Track theme changes
    document.addEventListener('themechange', (e) => {
      this.trackEvent('theme_change', {
        theme: e.detail.theme
      });
    });
  }

  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        session_id: this.getSessionId()
      }
    };

    this.events.push(event);
    console.log('Event tracked:', event);

    // In production, send to analytics service
    // this.sendToAnalytics(event);
  }

  detectPlatform(url) {
    if (url.includes('.msi') || url.includes('.exe')) return 'Windows';
    if (url.includes('.dmg') || url.includes('.pkg')) return 'macOS';
    if (url.includes('.deb')) return 'Linux (deb)';
    if (url.includes('.rpm')) return 'Linux (rpm)';
    if (url.includes('.AppImage')) return 'Linux (AppImage)';
    return 'Unknown';
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
}

// Main Application
class MermaidGUIWebsite {
  constructor() {
    this.modules = {};
    this.init();
  }

  async init() {
    try {
      // Initialize core modules
      this.modules.loading = new LoadingManager();
      this.modules.theme = new ThemeManager();
      this.modules.navigation = new NavigationManager();
      this.modules.animation = new AnimationManager();
      this.modules.performance = new PerformanceMonitor();
      this.modules.error = new ErrorHandler();
      this.modules.analytics = new AnalyticsManager();
      this.modules.faq = new FAQManager();
      this.modules.backToTop = new BackToTopManager();
      this.modules.interactiveDemo = new InteractiveDemoManager();
      this.modules.communityStats = new CommunityStatsManager();
      this.modules.platformDetector = new PlatformDetector();

      // Initialize GitHub API (async)
      this.modules.github = new GitHubAPIManager();

      // Setup global event listeners
      this.setupGlobalEventListeners();

      console.log('🌊 Mermaid GUI v2.0 website initialized successfully!');

    } catch (error) {
      console.error('Failed to initialize website:', error);
      Utils.createToast('Failed to initialize some features. Please refresh the page.', 'error');
    }
  }

  setupGlobalEventListeners() {
    // Copy to clipboard functionality
    window.copyToClipboard = (text) => Utils.copyToClipboard(text);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape key to close modals, menus, etc.
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('escape-pressed'));
      }

      // Ctrl/Cmd + K for search (if implemented)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('search-shortcut'));
      }
    });

    // Online/offline status
    window.addEventListener('online', () => {
      Utils.createToast('Connection restored', 'success', 2000);
    });

    window.addEventListener('offline', () => {
      Utils.createToast('You are offline', 'warning', 3000);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MermaidGUIWebsite();
  });
} else {
  new MermaidGUIWebsite();
}

// FAQ Handler - Add to assets/script.js

class FAQManager {
  constructor() {
    this.init();
  }

  init() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      question.addEventListener('click', () => {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';

        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherQuestion = otherItem.querySelector('.faq-question');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            otherQuestion.setAttribute('aria-expanded', 'false');
            otherAnswer.style.maxHeight = null;
            otherItem.classList.remove('active');
          }
        });

        // Toggle current item
        if (isExpanded) {
          question.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
          item.classList.remove('active');
        } else {
          question.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          item.classList.add('active');
        }
      });
    });
  }
}

// Additional JavaScript Functions - Add to assets/script.js

// Back to Top Button Manager
class BackToTopManager {
  constructor() {
    this.button = document.getElementById('back-to-top');
    this.init();
  }

  init() {
    if (!this.button) return;

    // Show/hide on scroll
    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.pageYOffset > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }, 16));

    // Smooth scroll to top
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// Interactive Demo Manager
class InteractiveDemoManager {
  constructor() {
    this.demoCode = document.getElementById('demo-code');
    this.demoPreview = document.getElementById('demo-preview');
    this.demoTabs = document.querySelectorAll('.demo-tab');
    this.codeTabs = document.querySelectorAll('.code-tab');
    this.templates = {
      flowchart: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Check setup]
    D --> A`,
      sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
      class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog`
    };
    this.init();
  }

  init() {
    // Setup demo tabs
    this.demoTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const demoType = tab.dataset.demo;
        this.switchDemo(demoType);
      });
    });

    // Setup code tabs (npm/yarn)
    this.codeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabType = tab.dataset.tab;
        this.switchCodeTab(tabType);
      });
    });

    // Demo code change (mock functionality)
    if (this.demoCode) {
      this.demoCode.addEventListener('input', Utils.debounce(() => {
        this.updatePreview();
      }, 500));
    }
  }

  switchDemo(demoType) {
    // Update active tab
    this.demoTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.demo === demoType);
    });

    // Update demo code
    if (this.demoCode && this.templates[demoType]) {
      this.demoCode.value = this.templates[demoType];
      this.updatePreview();
    }
  }

  switchCodeTab(tabType) {
    this.codeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabType);
    });

    // Show/hide appropriate code
    const npmCode = document.getElementById('install-npm');
    const yarnCode = document.getElementById('install-yarn');

    if (npmCode && yarnCode) {
      if (tabType === 'npm') {
        npmCode.style.display = 'block';
        yarnCode.style.display = 'none';
      } else {
        npmCode.style.display = 'none';
        yarnCode.style.display = 'block';
      }
    }
  }

  updatePreview() {
    // Mock preview update (in real app, this would render Mermaid)
    if (this.demoPreview) {
      this.demoPreview.innerHTML = `
        <div class="preview-placeholder">
          <div class="placeholder-icon">🎨</div>
          <p>Preview updated!</p>
          <small>Code: ${this.demoCode.value.split('\n').length} lines</small>
        </div>
      `;
    }
  }
}

// Enhanced GitHub API Manager for Community Stats
class CommunityStatsManager extends GitHubAPIManager {
  async init() {
    await super.init();
    await this.updateCommunityStats();
  }

  async updateCommunityStats() {
    try {
      const [repoData, contributors, releases] = await Promise.all([
        this.makeRequest(this.repoURL, 'repo-data'),
        this.makeRequest(`${this.repoURL}/contributors`, 'contributors'),
        this.makeRequest(`${this.repoURL}/releases`, 'releases-data')
      ]);

      // Update community stats
      this.updateCommunityElement('community-stars', repoData.stargazers_count);
      this.updateCommunityElement('community-contributors', contributors.length);
      this.updateCommunityElement('community-issues', repoData.open_issues_count);
      this.updateCommunityElement('community-releases', releases.length);

      // Update footer stats
      this.updateCommunityElement('footer-version', releases[0]?.tag_name || 'v2.0.0');
      this.updateCommunityElement('footer-downloads', await this.getTotalDownloads());

    } catch (error) {
      console.warn('Failed to load community stats:', error);
    }
  }

  updateCommunityElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      if (typeof value === 'number') {
        this.animateNumber(element, value);
      } else {
        element.textContent = value;
      }
    }
  }

  async getTotalDownloads() {
    try {
      const releases = await this.makeRequest(`${this.repoURL}/releases`, 'total-downloads');
      let total = 0;
      releases.forEach(release => {
        release.assets.forEach(asset => {
          total += asset.download_count || 0;
        });
      });
      return total;
    } catch (error) {
      return 0;
    }
  }
}

// Platform Detection for Download Links
class PlatformDetector {
  constructor() {
    this.platform = this.detectPlatform();
    this.init();
  }

  init() {
    this.highlightPlatform();
    this.setupAutoDetection();
  }

  detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('linux')) return 'linux';

    return 'unknown';
  }

  highlightPlatform() {
    // Add visual indicator for user's platform
    const platformCards = document.querySelectorAll('.download-card');
    platformCards.forEach(card => {
      const platformIcon = card.querySelector('.platform-icon');
      if (platformIcon) {
        const cardPlatform = this.getCardPlatform(platformIcon.textContent);
        if (cardPlatform === this.platform) {
          card.classList.add('recommended');

          // Add recommendation badge
          if (!card.querySelector('.platform-badge')) {
            const badge = document.createElement('div');
            badge.className = 'platform-badge';
            badge.textContent = 'Recommended for you';
            card.insertBefore(badge, card.firstChild);
          }
        }
      }
    });
  }

  getCardPlatform(icon) {
    switch (icon) {
      case '🪟': return 'windows';
      case '🍎': return 'macos';
      case '🐧': return 'linux';
      default: return 'unknown';
    }
  }

  setupAutoDetection() {
    // Add platform-specific installation instructions
    const installationNote = document.querySelector('.installation-note');
    if (installationNote && this.platform !== 'unknown') {
      const platformInstructions = this.getPlatformInstructions();
      if (platformInstructions) {
        const instructionElement = document.createElement('div');
        instructionElement.className = 'platform-specific-instructions';
        instructionElement.innerHTML = platformInstructions;
        installationNote.appendChild(instructionElement);
      }
    }
  }

  getPlatformInstructions() {
    const instructions = {
      windows: `
        <h5>🪟 Windows-specific tips:</h5>
        <ul>
          <li>Run PowerShell as Administrator for global npm installs</li>
          <li>Consider using <a href="https://chocolatey.org/" target="_blank">Chocolatey</a> for package management</li>
        </ul>
      `,
      macos: `
        <h5>🍎 macOS-specific tips:</h5>
        <ul>
          <li>Use Homebrew for easy Node.js installation: <code>brew install node</code></li>
          <li>You might need to run <code>sudo npm install -g @mermaid-js/mermaid-cli</code></li>
        </ul>
      `,
      linux: `
        <h5>🐧 Linux-specific tips:</h5>
        <ul>
          <li>Install Node.js via your package manager or NodeSource</li>
          <li>Use <code>sudo npm install -g @mermaid-js/mermaid-cli</code> for global install</li>
        </ul>
      `
    };

    return instructions[this.platform] || null;
  }
}

// Ensure all modules are properly initialized
document.addEventListener('DOMContentLoaded', () => {
  // Double check initialization
  if (typeof MermaidGUIWebsite === 'undefined') {
    console.error('MermaidGUIWebsite not loaded properly');
    // Fallback basic functionality
    initializeFallback();
  }
});

function initializeFallback() {
  // Basic theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // Basic mobile menu
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
      mobileToggle.classList.toggle('active');
    });
  }

  // Basic FAQ functionality
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      
      // Close others
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          const otherQuestion = otherItem.querySelector('.faq-question');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          otherQuestion.setAttribute('aria-expanded', 'false');
          otherAnswer.style.maxHeight = null;
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current
      if (isExpanded) {
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
        item.classList.remove('active');
      } else {
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        item.classList.add('active');
      }
    });
  });

  console.log('Fallback initialization complete');
}