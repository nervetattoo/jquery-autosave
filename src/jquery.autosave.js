/**
 * @fileOverview jQuery.autosave
 * Unobtrusively saves form data based on certain conditions
 *
 * @author Mads Erik Forberg, Raymond Julin, Kyle Florence
 * @website https://github.com/nervetattoo/jquery-autosave
 * @version 1.0.0
 *
 * Dual licensed under the MIT and BSD Licenses.
 */

;(function($, undefined) {
  /**
   * Fixes binding the "change" event to checkboxes and select[type=multiple]
   * for Internet Explorer. See: https://gist.github.com/770449
   */
  var bind = function(eventType, element, callback) {
    if (eventType !== "change") $(element).bind(eventType, callback);
    else {
      eventType = (element.type == "checkbox"
        || element.tagName.toLowerCase() == "select" && element.multiple)
        && ("onpropertychange" in document.body) ? "propertychange" : "change";

      $(element).bind(eventType, function(e) {
        if (e.type == "change" || (e.type == "propertychange"
          && /^(checked|selectedIndex)$/.test(window.event.propertyName))) {
          callback.call(this, e);
        }
      });
    }
  }

  /**
   * Looks for form elements inside of the elements passed into the plugin
   * and attaches an autosave instance to them.
   *
   * @param {Object} [options]
   *    User supplied options to override the defaults within the plugin.
   *
   * @returns {jQuery}
   *    The elements that invoked this function.
   */
  $.fn.autosave = function(options) {
    var instance = $.extend({}, $.autosave),
      $forms = instance.getForms(this),
      $fields = instance.getFields(this);

    // Make sure we have at least one form and form field
    if ($forms.length && $fields.length) {
      // Store instance in form and form fields
      $forms.add($fields).data("autosave", instance);

      // Initialize the instance
      instance.initialize(this, $forms, $fields, options);
    }

    return this;
  }

  /**
   * @class The jQuery.autosave class.
   */
  $.autosave = {
    options: {
      /**
       * The namespace to append after event and class names.
       */
      namespace: "autosave",
      /**
       * Contains a set of key/value pairs that represent the steps of the
       * saving process.
       */
      save: {
        /**
        * Events that will start the saving process.
        */
        trigger: "change",
        /**
        * Reduces the scope of form fields involved in the save.
        */
        scope: "changed",
        /**
         * How to build the dataset from the form fields.
         */
        data: "serializeArray",
        /**
        * Determine whether or not to autosave based on certain conditions.
        */
        condition: undefined,
        /**
        * An array of callback methods that will determine how the form field
        * data will be saved.
        */
        method: "ajax"
      },
      /**
      * Contains a set of key/value pairs that allow you to change the name of
      * events used within the plugin. Keep in mind that these events will be
      * namespaced on initialization.
      */
      events: {
        /**
         * This event is attached to each form autosave is attached to. When
         * triggered, it will attempt to save the form.
         */
        save: "save"
      },
      /**
       * Contains a set of key/value pairs that allow you to change the name of
       * classes used within the plugin. Keep in mind that these classes will be
       * namespaced on initialization.
       */
      classes: {
        /**
         * The class name that will be applied to elements whose value has been
         * changed but not yet saved.
         */
        changed: "changed"
      }
    },

    /**
     * Initializes the plugin.
     *
     * @param {jQuery} $elements
     *    The set of jQuery objects that this plugin was called with.
     *
     * @param {jQuery} $forms
     *    The set of jQuery form elements that the plugin detected.
     *
     * @param {jQuery} $fields
     *    The set of jQuery form field elements that the plugin detected.
     *
     * @param {Object} [options]
     *    User supplied options to merge with the defaults.
     */
    initialize: function($elements, $forms, $fields, options) {
      var self = this;

      $.extend(true, this.options, options);
      $.extend(this, {
        timer: 0,
        callbacks: {},
        $queue: $({}),
        $forms: $forms,
        $fields: $fields,
        $elements: $elements
      });

      // Add namespace to events
      $.each(this.options.events, function(key, eventName) {
        self.options.events[key] = eventName + "." + self.options.namespace;
      });

      // Add namespace to classes
      $.each(this.options.classes, function(key, className) {
        self.options.classes[key] = className + "-" + self.options.namespace;
      });

      // Bind to each form field and listen for changes
      $fields.each(function() {
        bind("change", this, function(e) {
          $(this).addClass(self.options.classes.changed);
        });
      });

      // Bind the "save" event to each form
      $forms.bind(this.options.events.save, function(e) {
        self.save(this, e.type);
      });

      // Parse each save option and extract the callback methods
      $.each(this.options.save, function(key, value) {
        var validCallbacks = [];

        if (value) {
          // Store callback in an array, if it isn't one already
          if (!$.isArray(value)) value = [value];

          $.each(value, function(i, callback) {
            callback = self.getCallback(callback, self._callbacks[key]);

            // If callback has a valid method, we can use it
            if ($.isFunction(callback.method)) validCallbacks.push(callback);
          });
        }

        self.callbacks[key] = validCallbacks;
      });

      // Set up save triggers
      $.each(this.callbacks.trigger, function(i, callback) {
        callback.method.call(self, callback.options);
      });
    },

    /**
     * Get the form fields associated with elements. This method can be called
     * statically.
     *
     * @param {jQuery|Element|Element[]} elements
     *    The elements to extract form fields from. Can be of type jQuery
     *    or an array of DOM elements.
     *
     * @returns {jQuery}
     *    A jQuery object containing the form fields.
     */
    getFields: function(elements) {
      var $elements = $(elements);

      // Extract inputs from form elements
      return $elements.length ? $elements.map(function() {
        return this.elements ? $.makeArray(this.elements) : this;
      }) : $elements;
    },

    /**
     * Get the forms associated with elements. This method can be called
     * statically.
     *
     * @param {jQuery|Element|Element[]} [elements]
     *    The elements to extract form fields from. Can be of type jQuery
     *    or an array of DOM elements.
     *
     * @returns {jQuery}
     *    A jQuery object containing the forms.
     */
    getForms: function(elements) {
      var $elements = $(elements);

      // Weed out duplicates
      return $elements.length ? $($.unique($elements.map(function() {
        return this.elements ? this : this.form;
      }).get())) : $elements;
    },

    /**
     * Get a callback method from a list of methods.
     *
     * @param {String|Object|function} method
     *    The method to get. Can be a string or object that represents one of
     *    the built in callback methods, or a custom function to use instead.
     *
     * @param {Object} methods
     *    An object containing the list of methods to search in.
     *
     * @returns {Object}
     *    The callback object. This will be an empty object if the callback
     *    could not be found. If it was found, this object will contain at the
     *    very least a "method" property and potentially an "options" property.
     */
    getCallback: function(method, methods) {
      var callback = {}, methodType = typeof method;

      if (methodType === "function") {
        // Custom function with no options
        callback.method = method;
      } else if (methodType === "string" && method in methods) {
        // Built in method, use default options
        callback = methods[method];
      } else if (methodType === "object") {
        callback = method, methodType = typeof callback.method;

        if (methodType === "string" && callback.method in methods) {
          // Built in method
          callback = methods[callback.method];

          if (typeof method.options === "object") {
            // Merge in user supplied options with the defaults
            callback.options = $.extend(true, {}, callback.options, method.options);
          } else {
            // Set options up as an empty object if none are found
            callback.options = {};
          }
        }
      }

      return callback;
    },

    /**
     * Starts an autosave interval loop, stopping the current one if needed.
     *
     * @param {number} interval
     *    An integer value representing the time between intervals in
     *    milliseconds.
     */
    startInterval: function(interval) {
        var self = this;

        interval = interval || this.interval;

        // If there is a timer running, stop it
        if (this.timer) this.stopInterval();

        // Make sure we have a valid interval
        if (!isNaN(parseInt(interval))) {
          this.timer = setTimeout(function() {
            self.save(undefined, self.timer);
          }, interval);
        }
    },

    /**
     * Stops an autosave interval loop.
     */
    stopInterval: function() {
      clearTimeout(this.timer);
      this.timer = undefined;
    },

    /**
     * Attemps to save form field data.
     *
     * @param {jQuery|Element|Element[]} [fields]
     *    The form fields to extract data from. Can be of type jQuery, a DOM
     *    element, or an array of DOM elements. If no fields are passed, the
     *    fields passed to the plugin on initialization will be used.
     *
     * @param {mixed} [caller]
     *    Used to denote who called this function. If passed, it is typically
     *    the ID of the current interval timer and may be used to check if the
     *    timer called this function.
     */
    save: function(fields, caller) {
      var self = this, $fields = fields ? this.getFields(fields) : this.$fields;

      // If there are no save methods defined, we can't save
      if (this.callbacks.method.length) {
        $.each(this.callbacks.scope, function(i, callback) {
          $fields = callback.method.call(self, callback.options, $fields);
        });

        // No fields = no data
        if ($fields.length) {
          var data, conditionsPassed = true;

          // Build our dataset
          $.each(this.callbacks.data, function(i, callback) {
              data = callback.method.call(self, callback.options, $fields);
          });

          // Loop through pre-save conditions and proceed only if they pass
          $.each(this.callbacks.condition, function(i, callback) {
            return (conditionsPassed = callback.method.call(
              self, callback.options, $fields, data, caller
            )) !== false;
          });

          // Can we save?
          if (conditionsPassed) {
            $.each(this.callbacks.method, function(i, callback) {
              // Add all of our save methods to the queue
              self.$queue.queue("saveMethodQueue", function() {
                // Methods that return false should handle the call to complete()
                if (callback.method.call(self, callback.options, data) !== false) {
                  self.complete();
                }
              });
            });
          }
        }
      }

      // Start the dequeue process
      this.complete(conditionsPassed);
    },

    /**
     * Called whenever a save method completes; performs necessary cleanup.
     */
    complete: function(resetChanged) {
      var queue = this.$queue.queue("saveMethodQueue");

      // Dequeue the next function if queue is not empty
      if (queue && queue.length) this.$queue.dequeue("saveMethodQueue");

      // Queue does not exist or is empty, proceed to cleanup
      else if (!queue || !queue.length) {
        // Reset changed by default
        if (resetChanged !== false) {
          this.$fields.removeClass(this.options.classes.changed);
        }

        // If there is a timer running, start the next interval
        if (this.timer) this.startInterval();
      }
    },

    /**
     * @namespace Holds all of the built-in callback methods.
     */
    _callbacks: {
      trigger: {
        /**
         * Attempt to save any time a form field value changes.
         */
        change: {
          method: function(options) {
            var self = this,
              $fields = options.filter ? this.$fields.filter(options.filter)
                : this.$fields;

            $fields.each(function() {
              bind("change", this, function(e, field) {
                self.save(field, e.type);
              });
            });
          },
          options: {
            filter: undefined
          }
        },
        /**
         * Attempt to save any time an event occurs on some element.
         */
        event: {
          method: function(options) {
            var self = this, $element = $(options.element);

            if (typeof options.eventType === "string") {
              $element.each(function() {
                bind(options.eventType, this, function(e) {
                  self.save(undefined, e.type);
                });
              });
            }
          },
          options: {
            element: undefined,
            eventType: "click"
          }
        },
        /**
         * Creates an interval loop that will attempt to save periodically.
         */
        interval: {
          method: function(options) {
            if (!isNaN(parseInt(options.interval))) {
              this.startInterval(this.interval = options.interval);
            }
          },
          options: {
            interval: 30000
          }
        }
      },
      scope: {
        /**
         * Changes the scope of fields to only those whose value has changed
         * since the last autosave.
         */
        changed: {
          method: function(options, $fields) {
            return $fields.filter("." + this.options.classes.changed);
          }
        }
      },
      data: {
        /**
         * Gather data using jQuery's .serializeArray() method.
         */
        serializeArray: {
          method: function(options, $fields) {
            return $fields.serializeArray();
          }
        }
      },
      condition: {
        /**
         * Only save if the interval called the save method
         */
        interval: {
          method: function(options, $fields, data, caller) {
            return (!this.timer || this.timer === caller);
          }
        },
        /**
         * Only save if at least one of the field values has changed
         */
        changed: {
          method: function(options, $fields) {
            return $fields.filter("." + this.options.classes.changed).length > 0;
          }
        }
      },
      method: {
        /**
         * Saves form field data using a jQuery.ajax call. Any options that can
         * be passed to the jQuery.ajax method are valid here.
         */
        ajax: {
          method: function(options, data) {
            var self = this;

            $.ajax($.extend(true, { data: data }, options, {
              complete: function(xhr, status) {
                if ($.isFunction(options.complete)) {
                  // Call user-provided complete function first
                  options.complete.apply(self, arguments);
                }

                // We are done now, cleanup
                self.complete();
              }
            }));

            // Don't call this.complete() yet
            return false;
          },
          options: {
            url: window.location.href,
            type: "POST"
          }
        }
      }
    }
  }
})(jQuery);
