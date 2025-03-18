/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

// Make sure Zone is explicitly defined as a global
// This fixes the NG0908 error when Angular tries to access Zone
if (typeof (window as any).Zone !== 'undefined') {
  // Ensure Zone is available globally
  (window as any).global = window;
  (window as any).global.Zone = (window as any).Zone;
  
  // These settings help Angular find and use the global Zone instance
  (window as any).__Zone_disable_on_property = true;
  (window as any).__Zone_disable_timers = false;
  
  // Create special exports for Angular's NgZone
  (window as any).__NgZoneNoopZone__ = {
    run: function(fn: Function) { return fn(); },
    runGuarded: function(fn: Function) { return fn(); }
  };
  
  // Provide a module.exports.Zone for ESM imports
  (window as any).module = {
    ...(window as any).module,
    exports: {
      ...(window as any).module?.exports,
      Zone: (window as any).Zone,
      __Zone_symbol_prefix: (window as any).Zone.__Zone_symbol_prefix,
      __Zone_symbol_addEventListener: (window as any).Zone.__Zone_symbol_addEventListener
    }
  };
  
  // For ESM imports
  if (!(window as any).exports) {
    (window as any).exports = {};
  }
  (window as any).exports.Zone = (window as any).Zone;
} else {
  console.error('Zone.js was not loaded correctly. Make sure the CDN script is working.');
} 