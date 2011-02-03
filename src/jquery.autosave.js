/**
 * @fileOverview jQuery.autosave
 *
 * @author Kyle Florence
 * @website https://github.com/kflorence/jquery-autosave
 * @version 1.0.0
 *
 * Inspired by the jQuery.autosave plugin written by Raymond Julin,
 * Mads Erik Forberg and Simen Graaten.
 *
 * Dual licensed under the MIT and BSD Licenses.
 */
;(function($, undefined) {
  /**
   * Fixes binding the "change" event to checkboxes and select[type=multiple]
   * for Internet Explorer. See: https://gist.github.com/770449
   *
   * @param {jQuery|Element|Element[]} elements
   *    The DOM Element we wish to bind the event to.
   *
   * @param {String} eventType
   *    The name of the event we want to bind to.
   *
   * @param {function} callback
   *    The function to execute when the event is triggered
   */
  var _bind = function(elements, eventType, callback) {
    var $elements = $(elements),
      rValidProps = /^(checked|selectedIndex)$/,
      hasPropertyChange = ("onpropertychange" in document.body);

    if (!$elements.length || typeof eventType !== "string") {
      return $elements;
    }

    if (eventType !== "change") {
      return $elements.bind(eventType, callback);
    }

    $elements.each(function() {
      eventType = hasPropertyChange && (this.type === "checkbox"
        || this.tagName.toLowerCase() === "select" && this.multiple)
        ? "propertychange" : "change";

      $(this).bind(eventType, function(e) {
        if (e.type !== "propertychange"
          || rValidProps.test(window.event.propertyName)) {
          callback.call(this, e);
        }
      });
    });
  };

  /**
    * Attempts to find a callback from a list of callbacks.
    *
    * @param {String|Object|function} callback
    *    The callback to get. Can be a string or object that represents one of
    *    the built in callback methods, or a custom function to use instead.
    *
    * @param {Object} callbacks
    *    An object containing the callbacks to search in.
    *
    * @returns {Object}
    *    The callback object. This will be an empty object if the callback
    *    could not be found. If it was found, this object will contain at the
    *    very least a "method" property and potentially an "options" property.
    */
  var _findCallback = function(callback, callbacks) {
    var cb = {}, callbackType = typeof callback;

    if (callbackType === "function") {
      // Custom function with no options
      cb.method = callback;
    } else if (callbackType === "string" && callback in callbacks) {
      // Built in method, use default options
      cb = callbacks[callback];
    } else if (callbackType === "object") {
      callbackType = typeof callback.method;

      if (callbackType === "function") {
        // Custom function
        cb = callback;
      } else if (callbackType === "string" && callback.method in callbacks) {
        // Build in method
        cb = callbacks[callback.method];
      }

      if (typeof cb.options === "object") {
        // Merge in user supplied options with the defaults
        cb.options = $.extend(true, {}, cb.options, callback.options);
      } else {
        // Set options up as an empty object if none are found
        cb.options = {};
      }
    }

    return cb;
  };

  /**
   * @class The jQuery.autosave class.
   */
  $.autosave = {
    /**
     * The ID of the currently running timer, or undefined if there isn't one.
     */
    timer: 0,
    /**
     * This jQuery object will hold our queues.
     */
    $queues: $({}),
    /**
     * Default plugin options.
     */
    options: {
      /**
       * The namespace to append after event names and before class names that
       * are used within the plugin.
       */
      namespace: "autosave",
      /**
       * Contains a set of key/value pairs that allow you to specify which
       * callbacks should be used at the different stages of the save process.
       */
      callbacks: {
        /**
         * Determines what will start the saving process.
         */
        trigger: "change",
        /**
         * Determines the scope of inputs involved in the save.
         */
        scope: null,
        /**
         * Determines how to extract and store the form input values.
         */
        data: null,
        /**
         * Determines whether or not to autosave based on certain conditions.
         */
        condition: null,
        /**
         * Determines how the form data will be saved.
         */
        save: "ajax"
      },
      /**
      * Contains a set of key/value pairs that allow you to change the name of
      * events used within the plugin. Keep in mind that these events will be
      * namespaced on initialization like: "eventName.autosave"
      */
      events: {
        /**
         * This event is attached to each form autosave is attached to. When
         * triggered, it will attempt to save the form.
         */
        save: "save",
        /**
         * This event is triggered on each form whenever autosave finishes
         * saving form data. It can be bound to if you need to be notified
         * after saving is completed.
         */
        saved: "saved",
        /**
         * This event is triggered whenever an input value changes on the form
         * containing that input. It can be bound to if you need to be notified
         * when an input value changes.
         */
        changed: "changed"
      },
      /**
       * Contains a set of key/value pairs that allow you to change the name of
       * classes used within the plugin. Keep in mind that these classes will be
       * namespaced on initialization like: "autosave-className"
       */
      classes: {
        /**
         * The class name that will be applied to elements whose value has been
         * changed but not yet saved.
         */
        changed: "changed",
        /**
         * Inputs with this class name will be ignored by the plugin when
         * gathering data.
         */
        ignore: "ignore"
      }
    },

    /**
     * Initializes the plugin.
     *
     * @param {jQuery} $elements
     *    The elements passed to the plugin.
     *
     * @param {Object} [options]
     *    The user-defined options to merge with the defaults.
     *
     * @returns {jQuery} $elements
     *    The elements passed to the plugin to maintain chainability.
     */
    initialize: function($elements, options) {
      var self = this;

      $.extend(this, {
        context: $elements.context || document,
        selector: $elements.selector || $elements,
        options: $.extend(true, {}, this.options, options)
      });

      // If length == 0, we have no forms or inputs
      if (this.elements().length) {
        var validCallbacks, $forms = this.forms(), $inputs = this.inputs();

        // Only attach to forms
        $forms.data("autosave", this);

        $.each(this.options.events, function(name, eventName) {
          self.options.events[name]
            = [eventName, self.options.namespace].join(".");
        });

        $.each(this.options.classes, function(name, className) {
          self.options.classes[name]
            = [self.options.namespace, className].join("-");
        });

        // Parse callback options into an array of callback objects
        $.each(this.options.callbacks, function(key, value) {
          validCallbacks = [];

          if (value) {
            $.each($.isArray(value) ? value : [value], function(i, callback) {
              callback = _findCallback(callback, self.callbacks[key]);

              // If callback has a valid method, we can use it
              if ($.isFunction(callback.method)) validCallbacks.push(callback);
            });
          }

          self.options.callbacks[key] = validCallbacks;
        });

        // Attempt to save when "save" is triggered on a form
        _bind($forms, this.options.events.save, function(e, inputs) {
          self.save(inputs, e.type);
        });

        // Listen for changes on all inputs
        _bind($inputs, "change", function(e) {
          $(this).addClass(self.options.classes.changed);
          $(this.form).triggerHandler(self.options.events.changed, [this]);
        });

        // Set up triggers
        $.each(this.options.callbacks.trigger, function(i, trigger) {
          trigger.method.call(self, trigger.options);
        });

      }

      // Maintain the chain
      return $elements;
    },

    /**
     * Returns the forms and inputs matched by the selector and context.
     *
     * @param {jQuery|Element|Element[]} [selector]
     *    The selector expression to use. Uses the selector passed into the
     *    plugin by default.
     *
     * @param {jQuery|Element|Document} [context]
     *    A context to limit our search. Uses document by default.
     *
     * @return {jQuery}
     *    A jQuery object containing any matched form and input elements.
     */
    elements: function(selector, context) {
      selector = selector || this.selector;
      context = context || this.context;

      return $(selector, context).filter(function() {
        return (this.elements || this.form);
      });
    },

    /**
     * Returns the forms found within elements.
     *
     * @param {jQuery|Element|Element[]} [elements]
     *    The elements to search within. Uses all of the currently found
     *    forms and form inputs by default.
     *
     * @returns {jQuery}
     *    A jQuery object containing any matched form elements.
     */
    forms: function(elements) {
      return $($.unique(this.elements(elements).map(function() {
        return this.elements ? this : this.form;
      }).get()));
    },

    /**
     * Returns the inputs found within elements.
     *
     * @param {jQuery|Element|Element[]} elements
     *    The elements to search within. Uses all of the currently found
     *    forms and form inputs by default.
     *
     * @returns {jQuery}
     *    A jQuery object containing any matched input elements.
     */
    inputs: function(elements) {
      return this.elements(elements).map(function() {
        return this.elements ? $.makeArray(this.elements) : this;
      });
    },

    /**
     * Returns the inputs from a set of inputs that are considered valid.
     *
     * @param {jQuery|Element|Element[]} [inputs]
     *    The set of inputs to search within. Uses all of the currently found
     *    inputs by default.
     *
     * @returns {jQuery}
     *    A jQuery object containing any matched input elements.
     */
    validInputs: function(inputs) {
      var self = this;

      return this.inputs(inputs).filter(function() {
        return !$(this).hasClass(self.options.classes.ignore);
      });
    },

    /**
     * Get all of the inputs whose value has changed since the last save.
     *
     * @param {jQuery|Element|Element[]} [inputs]
     *    The set of inputs to search within. Uses all of the currently found
     *    inputs by default.
     *
     * @returns {jQuery}
     *    A jQuery object containing any matched input elements.
     */
    changedInputs: function(inputs) {
      var self = this;

      return this.inputs(inputs).filter(function() {
        return $(this).hasClass(self.options.classes.changed);
      });
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
            self.save(false, self.timer);
          }, interval);
        }
    },

    /**
     * Stops an autosave interval loop.
     */
    stopInterval: function() {
      clearTimeout(this.timer);
      this.timer = null;
    },

    /**
     * Attemps to save form data.
     *
     * @param {jQuery|Element|Element[]} [inputs]
     *    The inputs to extract data from. Can be of type jQuery, a DOM
     *    element, or an array of DOM elements. If no inputs are passed, all
     *    of the currently available inputs will be used.
     *
     * @param {mixed} [caller]
     *    Used to denote who called this function. If passed, it is typically
     *    the ID of the current interval timer and may be used to check if the
     *    timer called this function.
     */
    save: function(inputs, caller) {
      var self = this, saved = false,
        $inputs = this.validInputs(inputs);

      // If there are no save methods defined, we can't save
      if (this.options.callbacks.save.length) {
        // Continue filtering the scope of inputs
        $.each(this.options.callbacks.scope, function(i, scope) {
          $inputs = scope.method.call(self, scope.options, $inputs);
        });

        if ($inputs.length) {
          var passes = true, formData = $inputs.serializeArray();

          // Manipulate form data
          $.each(this.options.callbacks.data, function(i, data) {
              formData = data.method.call(self, data.options, $inputs, formData);
          });

          // Loop through pre-save conditions and proceed only if they pass
          $.each(this.options.callbacks.condition, function(i, condition) {
            return (passes = condition.method.call(
              self, condition.options, $inputs, formData, caller
            )) !== false;
          });

          if (passes) {
            // Add all of our save methods to the queue
            $.each(this.options.callbacks.save, function(i, save) {
              self.$queues.queue("save", function() {
                // Methods that return false should handle the call to next()
                if (save.method.call(self, save.options, formData) !== false) {
                  self.next("save");
                }
              });
            });

            // We were able to save
            saved = true;
          }
        }
      }

      // Start the dequeue process
      this.next("save", saved);
    },

    /**
     * Maintains the queue; calls the next function in line, or performs
     * necessary cleanup when the queue is empty.
     *
     * @param {String} name
     *    The name of the queue.
     *
     * @param {Boolean} [resetChanged]
     *    Whether or not to reset which elements were changed before saving.
     *    Defaults to true.
     */
    next: function(name, resetChanged) {
      var queue = this.$queues.queue(name);

      // Dequeue the next function if queue is not empty
      if (queue && queue.length) {
        this.$queues.dequeue(name);
      }

      // Queue is empty or does not exist
      else {
        this.finished(queue, name, resetChanged);
      }
    },

    /**
     * Called whenever a queue finishes processing, usually to perform some
     * type of cleanup.
     *
     * @param {Array} queue
     *    The queue that has finished processing.
     *
     * @param {Boolean} [resetChanged]
     *    Whether or not to reset which elements were changed before saving.
     *    Defaults to true.
     */
    finished: function(queue, name, resetChanged) {
      if (name === "save") {
        if (queue) {
          this.forms().triggerHandler(this.options.events.saved);
        }

        // Reset changed by default
        if (resetChanged !== false) {
          this.changedInputs().removeClass(this.options.classes.changed);
        }

        // If there is a timer running, start the next interval
        if (this.timer) this.startInterval();
      }
    }
  };

  /**
   * Callback repository
   */
  var callbacks = $.autosave.callbacks = {};
  $.each($.autosave.options.callbacks, function(key) {
    callbacks[key] = {};
  });

  $.extend(callbacks.trigger, {
    /**
     * Attempt to save any time an input value changes.
     */
    change: {
      method: function() {
        var self = this;

        this.forms().bind(this.options.events.changed, function(e, input) {
          self.save(input, e.type);
        });
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
  });

  $.extend(callbacks.scope, {
    /**
     * Use all inputs
     */
    all: {
      method: function() {
        return this.validInputs();
      }
    },
    /**
     * Only use the inputs with values that have changed since the last save.
     */
    changed: {
      method: function() {
        return this.changedInputs();
      }
    }
  });

  $.extend(callbacks.data, {
    /**
     * Whereas .serializeArray() serializes a form into an array,
     * .serializeObject() serializes a form into an object.
     *
     * jQuery serializeObject - v0.2 - 1/20/2010
     * http://benalman.com/projects/jquery-misc-plugins/
     *
     * Copyright (c) 2010 "Cowboy" Ben Alman
     * Dual licensed under the MIT and GPL licenses.
     * http://benalman.com/about/license/
     *
     * @return Object The resulting object of form values.
     */
    serializeObject: {
      method: function(options, $inputs) {
        var obj = {};

        $.each($inputs.serializeArray(), function(i, o) {
          var n = o.name, v = o.value;

          obj[n] = obj[n] === undefined ? v
            : $.isArray(obj[n]) ? obj[n].concat(v)
            : [obj[n], v];
        });

        return obj;
      }
    }
  });

  $.extend(callbacks.condition, {
    /**
     * Only save if the interval called the save method
     */
    interval: {
      method: function(options, $inputs, data, caller) {
        return (!this.timer || this.timer === caller);
      }
    },
    /**
     * Only save if at least one of the input values has changed
     */
    changed: {
      method: function() {
        return this.changedInputs().length > 0;
      }
    }
  });

  $.extend(callbacks.save, {
    /**
     * Saves form data using a jQuery.ajax call.
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

            self.next("save");
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
  });

  /**
   * Attaches an autosave class instance to the form elements associated with
   * the elements passed into the plugin.
   *
   * @param {Object} [options]
   *    User supplied options to override the defaults within the plugin.
   *
   * @returns {jQuery}
   *    The elements that invoked this function.
   */
  $.fn.autosave = function(options) {
    return $.extend({}, $.autosave).initialize(this, options);
  };
})(jQuery);
