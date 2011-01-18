/**
 * @fileOverview jQuery.autosave
 * Unobtrusively saves form data based on certain conditions
 *
 * @author Mads Erik Forberg, Raymond Julin, Kyle Florence
 * @website https://github.com/nervetattoo/jquery-autosave
 * @version 1.0.0
 *
 * Dual licensed under the MIT and GPL Licenses.
 */

;(function($, undefined) {

  // Attaches a class instance to an element
  $.fn.autosave = function(options) {
    var $elements = this, instance = $.extend({}, $.autosave);

    instance.initialize($elements.filter(function() {
      return (this.elements || this.form);
    }).data("autosave", instance), options);

    return this;
  }

  // The autosave class
  $.autosave = {
    options: {
      /**
      * Triggers is an array of methods that will trigger an autosave. Each
      * array element can contain strings, functions or objects as follows:
      *
      * - "string" - call built in function.
      * - function(data) {} - simple custom function.
      * - { method: "string" } - another way to call a built in function.
      * - { method: function(data) {} } - another way to call a simple
      *     custom function.
      * - { method: "string", options: {} } - call a built in function with
      *     custom parameters (will override default parameters).
      * - { method: function(data, options) {}, options: {} } - call a custom
      *     function with options passed in.
      *
      * The arguments passed to all functions are:
      * - options - (optional) any options to pass to the method
      */
      triggers: ["interval"],
      /**
      * Filters is an array of methods to apply to the dataset. By default,
      * all form fields are used when data is saved, but the scope of data can
      * be restricted by using filters. Each array element can contain strings
      * or functions as follows:
      *
      * - "string" - call a built in function.
      * - function() {} - call a custom function.
      *
      * The arguments passed to all functions are:
      * - $fields - the jQuery fields to filter on
      */
      fields: ["changed"],
      /**
      * Conditions is an array of methods to invoke before calling any of
      * the data saving methods. Any condition function that returns false
      * will prevent saving from happening.
      *
      * The arguments passed to all functions are:
      * - $fields - the form fields this save request is acting upon
      * - data - the data from those form fields
      */
      conditions: [],
      /**
      * Methods is an array of saving methods to invoke. These methods will be
      * invoked with this instance as the context. Each array element can contain
      * strings, functions or objects as follows:
      *
      * - "string" - call built in function.
      * - function(data) {} - simple custom function.
      * - { method: "string" } - another way to call a built in function.
      * - { method: function(data) {} } - another way to call a simple
      *     custom function.
      * - { method: "string", options: {} } - call a built in function with
      *     custom parameters (will override default parameters).
      * - { method: function(data, options) {}, options: {} } - call a custom
      *     function with options passed in.
      *
      * The arguments passed to all functions are:
      * - data - the data collected from form fields using jQuery.serializeArray
      * - options - (optional) any options to pass to the method
      */
      methods: ["ajax"]
    },

    // Set up the plugin
    initialize: function($elements, options) {
      var self = this;

      // Merge user supplied options with defaults
      $.extend(true, this.options, options);
      $.extend(this, {
        timer: 0,
        changed: [],
        $queue: $({}),
        $elements: $elements,
        $forms: this.getForms($elements),
        $fields: this.getFields($elements)
      });

      // Listen to form inputs
      this.$fields.each(function() {
        // For IE bug fixes, see: https://gist.github.com/770449
        var eventType = (this.type == "checkbox" ||
          this.tagName.toLowerCase() == "select" && this.multiple)
          && ("onpropertychange" in document.body) ? "propertychange" : "change";

        $(this).bind(eventType, function(e) {
          if (e.type == "change" || (e.type == "propertychange"
            && /^(checked|selectedIndex)$/.test(window.event.propertyName))) {
            self.valueChanged(this);
          }
        });
      });

      // Which options use the callback-style syntax
      var callbackOptions = ["triggers", "fields", "conditions", "methods"];

      // Set up callback functions
      $.each(callbackOptions, function(i, name) {
        var callbacks = self.options[name], validCallbacks = [];

        if ($.isArray(callbacks) && callbacks.length) {
          $.each(callbacks, function(i, callback) {
            callback = self.getCallback(callback, self.callbacks[name]);

            // At the very least, we need a valid callback method
            if ($.isFunction(callback.method)) {
              validCallbacks.push(callback);
            }
          });
        }

        // Store actual callback methods, or undefined if there are none
        self.options[name] = validCallbacks.length ? validCallbacks : undefined;
      });

      // Set up triggers
      if (this.options.triggers) {
        $.each(this.options.triggers, function(i, callback) {
          callback.method.call(self, callback.options);
        });
      }
    },

    // Returns the form fields associated with elements
    getFields: function(elements) {
      var $elements = elements ? $(elements) : this.$elements;

      // Extract inputs from form elements
      return $elements.map(function() {
        return this.elements ? $.makeArray(this.elements) : this;
      });
    },

    // Returns the forms associated with elements
    getForms: function(elements) {
      var $elements = elements ? $(elements) : this.$elements;

      // Weed out duplicates
      return $($.unique($elements.map(function() {
        return this.elements ? this : this.form;
      }).get()));
    },

    // Attempts to return a callback method from methods
    getCallback: function(method, methods) {
      var callback = {}, methodType = typeof method;

      // Custom function without options
      if (methodType === "function") {
        callback.method = method;
      }

      // Built in function with default options
      else if (methodType === "string" && method in methods) {
        callback = methods[method];
      }

      // Objects can contain custom or built in handler methods
      else if (methodType === "object") {
        callback = method;
        methodType = typeof callback.method;

        // Built in handler method with options
        if (methodType === "string" && callback.method in methods) {
          callback = methods[callback.method];

          // Merge in user defined options, if they exist
          if (typeof method.options === "object") {
            callback.options = $.extend(true, {}, callback.options, method.options);
          }
        }
      }

      return callback;
    },

    // Starts the autosave interval loop
    startInterval: function(interval) {
        var self = this;

        interval = interval || this.interval;

        if (this.timer) {
          this.stopInterval();
        }

        if (interval) {
          this.timer = setTimeout(function() {
            self.save(undefined, self.timer);
          }, interval);
        }
    },

    // Stops the autosave interval loop
    stopInterval: function() {
      clearTimeout(this.timer);
      this.timer = undefined;
    },

    // Called whenever a form value changes
    valueChanged: function(field) {
      this.changed.push(field);

      // Allows for custom handling of changed fields
      $(field.form).triggerHandler("valueChanged", [field]);
    },

    // Attempt to save. Will only complete if certain conditions are met.
    save: function(fields, context) {
      var self = this, $fields = fields ? this.getFields(fields) : this.$fields;

      if (this.options.fields) {
        $.each(this.options.fields, function(i, callback) {
          $fields = callback.method.call(self, callback.options, $fields);
        });
      }

      if ($fields.length && this.options.methods) {
        var data = $fields.serializeArray();

        // Loop through pre-save conditions and proceed only if they pass
        if (this.conditions($fields, data, context) !== false) {
          $.each(this.options.methods, function(i, callback) {
            self.$queue.queue("saveMethods", function() {
              // Methods that return false should handle the call to complete()
              if (callback.method.call(self, callback.options, data) !== false) {
                self.complete();
              }
            });
          });
        }
      }

      // Start the dequeue process
      this.complete();
    },

    // Matches supplied arguments against conditions to see if they pass
    conditions: function() {
      var self = this, args = arguments, proceed = true;

      if (this.options.conditions) {
        $.each(this.options.conditions, function(i, callback) {
          return (proceed = callback.method.apply(self, args)) !== false;
        });
      }

      return proceed;
    },

    // Called upon save method completion. Performs necessary cleanup.
    complete: function(caller) {
      var queue = this.$queue.queue("saveMethods");

      // Queue exists, has remaining items and we are dequeueing
      if (queue && queue.length) {
        this.$queue.dequeue("saveMethods");
      }

      // Queue does not exist or is empty, proceed to cleanup
      else if (!queue || !queue.length) {
        this.changed = [];

        // If there is a timer running, start the next interval
        if (this.timer) {
          this.startInterval();
        }
      }
    },

    callbacks: {
      triggers: {
        // Save whenever an event fires
        event: {
          method: function(options) {
            var self = this;

            if (typeof options.eventName === "string") {
              this.$forms.bind(options.eventName, function() {
                self.notify(this);
              });
            }
          },
          options: {
            eventName: "autosave"
          }
        },

        // Save whenever a form field value changes
        change: {
          method: function(options) {
            var self = this;

            this.$forms.bind("autosave.onChange", function(e, field) {
              self.save(field);
            });
          }
        },

        // Save at regular intervals
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

      // Limit which fields we will use data from
      fields: {
        changed: {
          method: function(options, $fields) {
            return this.getFields(this.changed);
          }
        }
      },

      // Only save if these conditions are met
      conditions: {
        waitForInterval: {
          method: function($fields, data, context) {
            return (!this.timer || this.timer === context);
          }
        }
      },

      // Methods for saving the collected data
      methods: {
        ajax: {
          method: function(options, data) {
            var self = this;

            $.ajax($.extend(true, {}, options, {
              data: data,
              complete: function(xhr, status) {
                // Call the user defined function first, if it exists
                if ($.isFunction(options.complete)) {
                  options.complete.apply(self, arguments);
                }

                self.complete("ajax");
              }
            }));

            // Don't call this.complete() yet
            return false;
          },
          options: {
            url: window.location.href,
            method: "POST"
          }
        }
      }
    }
  }
})(jQuery);
