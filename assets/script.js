// assets/script.js - Mermaid GUI v2.0 GitHub Pages

// Theme Management
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    // Get saved theme or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
    
    // Add event listener to theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}

// GitHub API Integration
class GitHubStats {
  constructor() {
    this.repoOwner = 'baris-sinapli';
    this.repoName = 'mermaid-diagram';
    this.init();
  }

  async init() {
    try {
      await Promise.all([
        this.updateStarCount(),
        this.updateDownloadCount(),
        this.updateLatestRelease()
      ]);
    } catch (error) {
      console.warn('Failed to load GitHub stats:', error);
    }
  }

  async updateStarCount() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}`);
      const data = await response.json();
      
      const starsElement = document.getElementById('github-stars');
      if (starsElement && data.stargazers_count !== undefined) {
        starsElement.textContent = this.formatNumber(data.stargazers_count);
      }
    } catch (error) {
      console.warn('Failed to fetch star count:', error);
    }
  }

  async updateDownloadCount() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases`);
      const releases = await response.json();
      
      let totalDownloads = 0;
      releases.forEach(release => {
        release.assets.forEach(asset => {
          totalDownloads += asset.download_count || 0;
        });
      });
      
      const downloadsElement = document.getElementById('download-count');
      if (downloadsElement) {
        downloadsElement.textContent = this.formatNumber(totalDownloads);
      }
    } catch (error) {
      console.warn('Failed to fetch download count:', error);
    }
  }

  async updateLatestRelease() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`);
      const release = await response.json();
      
      // Update version in various places
      const versionElements = document.querySelectorAll('.version');
      versionElements.forEach(element => {
        if (release.tag_name) {
          element.textContent = release.tag_name;
        }
      });

      // Update download links with actual release assets
      this.updateDownloadLinks(release.assets);
    } catch (error) {
      console.warn('Failed to fetch latest release:', error);
    }
  }

  updateDownloadLinks(assets) {
    if (!assets || !assets.length) return;

    // Map common patterns to download links
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
          }
        }
      }
    });
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

// Smooth Scrolling & Navigation
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    // Smooth scrolling for anchor links
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
        }
      });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', () => this.updateActiveNavLink());
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
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
  }
}

// Utility Functions
class Utils {
  static copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
        this.fallbackCopyTextToClipboard(text);
      });
    } else {
      this.fallbackCopyTextToClipboard(text);
    }
  }

  static fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showToast('Copied to clipboard!');
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

  static showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Toast styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? '#22c55e' : '#ef4444',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '1000',
      fontSize: '14px',
      fontWeight: '500',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Performance & Analytics
class Analytics {
  constructor() {
    this.init();
  }

  init() {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    });

    // Track download clicks
    document.querySelectorAll('a[href*="download"], a[href*="releases"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const platform = this.detectPlatform(link.href);
        console.log(`Download clicked: ${platform}`);
        // Here you could send to analytics service
      });
    });

    // Track external links
    document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])').forEach(link => {
      link.addEventListener('click', () => {
        console.log(`External link clicked: ${link.href}`);
      });
    });
  }

  detectPlatform(url) {
    if (url.includes('.msi') || url.includes('.exe')) return 'Windows';
    if (url.includes('.dmg') || url.includes('.pkg')) return 'macOS';
    if (url.includes('.deb')) return 'Linux (deb)';
    if (url.includes('.rpm')) return 'Linux (rpm)';
    if (url.includes('.AppImage')) return 'Linux (AppImage)';
    return 'Unknown';
  }
}

// Error Handling
class ErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('error', (e) => {
      console.error('JavaScript error:', e.error);
      // Don't show error to users, just log it
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      e.preventDefault();
    });
  }
}

// Intersection Observer for Animations
class AnimationManager {
  constructor() {
    this.init();
  }

  init() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe elements that should animate in
    document.querySelectorAll('.feature-card, .download-card, .step').forEach(el => {
      observer.observe(el);
    });
  }
}

// Global functions for HTML onclick handlers
window.copyToClipboard = (text) => Utils.copyToClipboard(text);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new GitHubStats();
  new NavigationManager();
  new Analytics();
  new ErrorHandler();
  new AnimationManager();
  
  console.log('🌊 Mermaid GUI v2.0 website loaded successfully!');
});

// Service Worker for PWA-like behavior (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment if you want to add a service worker
    // navigator.serviceWorker.register('/sw.js');
  });
}