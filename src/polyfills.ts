/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

// Zone.js is loaded externally from CDN in index.html
// These settings help Angular find and use the global Zone instance
(window as any).__Zone_disable_on_property = true;
(window as any).__Zone_disable_timers = false;

// This creates a module alias for applications that try to import zone.js
// It redirects those imports to use the global Zone that was loaded in the HTML
(window as any).module = {
  ...(window as any).module,
  exports: {
    ...(window as any).module?.exports,
    Zone: (window as any).Zone
  }
}; 