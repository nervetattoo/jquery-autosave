/**
 * @fileOverview jQuery.autosave.compatibility
 *
 * Provides backwards compatibility to make jQuery.autosave work with
 * jQuery versions 1.2.3 - 1.3.2. jQuery versions 1.4 and above do not
 * need to include this file. Keep in mind that the following code will
 * modify your version of jQuery for subsequent scripts. It does no harm,
 * but modifying jQuery itself is never a good idea. Do yourself a favor
 * and upgrade to a newer version if at all possible.
 *
 * @author Kyle Florence
 * @website https://github.com/kflorence/jquery-autosave
 * @version 1.0.3b
 *
 * Dual licensed under the MIT and BSD Licenses.
 */
;(function($, window, undefined) {
  // Used to test for jQuery < 1.4
  if (!jQuery.isPlainObject) {
    var class2type = {},
      toString = Object.prototype.toString,
      hasOwn = Object.prototype.hasOwnProperty;

    // Populate the class2type map
    jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
      class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });

    // Add in missing functions: these were pulled straight from jQuery 1.5
    jQuery.extend({
      type: function( obj ) {
        return obj == null ?
          String( obj ) :
          class2type[ toString.call(obj) ] || "object";
      },
      // See test/unit/core.js for details concerning isFunction.
      // Since version 1.3, DOM methods and functions like alert
      // aren't supported. They return false on IE (#2968).
      isFunction: function( obj ) {
        return jQuery.type(obj) === "function";
      },
      isArray: Array.isArray || function( obj ) {
        return jQuery.type(obj) === "array";
      },
      // A crude way of determining if an object is a window
      isWindow: function( obj ) {
        return obj && typeof obj === "object" && "setInterval" in obj;
      },
      isPlainObject: function( obj ) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
          return false;
        }

        // Not own constructor property must be Object
        if ( obj.constructor &&
          !hasOwn.call(obj, "constructor") &&
          !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
          return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for ( key in obj ) {}

        return key === undefined || hasOwn.call( obj, key );
      },
      // Override the extend method !!
      extend: function() {
        var options, name, src, copy, copyIsArray, clone,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length,
          deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
          deep = target;
          target = arguments[1] || {};
          // skip the boolean and the target
          i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
          target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
          target = this;
          --i;
        }

        for ( ; i < length; i++ ) {
          // Only deal with non-null/undefined values
          if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( name in options ) {
              src = target[ name ];
              copy = options[ name ];

              // Prevent never-ending loop
              if ( target === copy ) {
                continue;
              }

              // Recurse if we're merging plain objects or arrays
              if ( deep && copy && ( jQuery.isPlainObject(copy)
                    || (copyIsArray = jQuery.isArray(copy)) ) ) {
                if ( copyIsArray ) {
                  copyIsArray = false;
                  clone = src && jQuery.isArray(src) ? src : [];

                } else {
                  clone = src && jQuery.isPlainObject(src) ? src : {};
                }

                // Never move original objects, clone them
                target[ name ] = jQuery.extend( deep, clone, copy );

              // Don't bring in undefined values
              } else if ( copy !== undefined ) {
                target[ name ] = copy;
              }
            }
          }
        }

        // Return the modified object
        return target;
      }
    });
  }
})(jQuery, window);
