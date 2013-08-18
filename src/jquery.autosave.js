/**
 * @fileOverview jQuery.autosave
 *
 * @author Kyle Florence
 * @website https://github.com/kflorence/jquery-autosave
 * @version 1.2-pre
 *
 * Inspired by the jQuery.autosave plugin written by Raymond Julin,
 * Mads Erik Forberg and Simen Graaten.
 *
 * Dual licensed under the MIT and BSD Licenses.
 */
;(function($, window, document, undefined) {

  // Figure out if html5 "input" event is available
  var inputSupported = (function() {
      var tmp = document.createElement("input");
      if ('oninput' in tmp) return true;
      // also try workaround for older versions of Firefox
      tmp.setAttribute("oninput", "return;");
      return typeof tmp["oninput"] === "function";
  }());

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
    var cb = { options: {} }, callbackType = typeof callback;

    if (callbackType === "function") {
      // Custom function with no options
      cb.method = callback;

    } else if (callbackType === "string" && callbacks[callback]) {
      // Built in method, use default options
      cb.method = callbacks[callback].method;

    } else if (callbackType === "object") {
      callbackType = typeof callback.method;

      if (callbackType === "function") {
        // Custom function
        cb.method = callback.method;

      } else if (callbackType === "string" && callbacks[callback.method]) {
        // Built in method
        cb.method = callbacks[callback.method].method;
        cb.options = $.extend(true, cb.options, callbacks[callback.method].options, callback.options);
      }
    }

    return cb;
  };

  $.autosave = {
    timer: 0,

    $queues: $({}),

    states: {
        changed: "changed",
        modified: "modified"
    },

    options: {
      namespace: "autosave",
      callbacks: {
        trigger: "change",
        scope: null,
        data: "serialize",
        condition: null,
        save: "ajax"
      },
      events: {
        save: "save",
        saved: "saved",
        changed: "changed",
        modified: "modified"
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

      this.$elements = $elements;
      this.options = $.extend(true, {}, this.options, options);

      // If length == 0, we have no forms or inputs
      if (this.elements().length) {
        var validCallbacks, $forms = this.forms(), $inputs = this.inputs();

        // Only attach to forms
        $forms.data(this.options.namespace, this);

        $.each(this.options.events, function(name, eventName) {
          self.options.events[name] = [eventName, self.options.namespace].join(".");
        });

        // Parse callback options into an array of callback objects
        $.each(this.options.callbacks, function(key, value) {
          validCallbacks = [];

          if (value) {
            $.each($.isArray(value) ? value : [value], function(i, callback) {
              callback = _findCallback(callback, self.callbacks[key]);

              // If callback has a valid method, we can use it
              if ($.isFunction(callback.method)) {
                validCallbacks.push(callback);
              }
            });
          }

          self.options.callbacks[key] = validCallbacks;
        });

        // Attempt to save when "save" is triggered on a form
        $forms.bind([this.options.events.save, this.options.namespace].join("."), function(e, inputs) {
          self.save(inputs, e.type);
        });

        // Listen for changes on all inputs
        $inputs.bind(["change", this.options.namespace].join("."), function(e) {
          $(this).data([self.options.namespace, self.states.changed].join("."), true);
          $(this.form).triggerHandler(self.options.events.changed, [this]);
        });

        // Listen for modifications on all inputs
        // Use html5 "input" event is available. Otherwise, use "keyup".
        var modifyTriggerEvent = inputSupported ? "input" : "keyup";
        $inputs.bind([modifyTriggerEvent, this.options.namespace].join("."), function(e) {
          $(this).data([self.options.namespace, self.states.modified].join("."), true);
          $(this.form).triggerHandler(self.options.events.modified, [this]);
        });

        // Set up triggers
        $.each(this.options.callbacks.trigger, function(i, trigger) {
          trigger.method.call(self, trigger.options);
        });
      }

      return $elements;
    },

    /**
     * Returns the forms and inputs within a specific context.
     *
     * @param {jQuery|Element|Element[]} [elements]
     *    The elements to search within. Uses the pass elements by default.
     *
     * @return {jQuery}
     *    A jQuery object containing any matched form and input elements.
     */
    elements: function(elements) {
      if (!elements) {
        elements = this.$elements;
      }

      return $(elements).filter(function() {
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
        return this.elements ? $.makeArray($(this).find(":input")) : this;
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
      return this.inputs(inputs);
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
        return $(this).data([self.options.namespace, self.states.changed].join("."));
      });
    },

    /**
     * Get all of the inputs whose value has been modified since the last save.
     *
     * @param {jQuery|Element|Element[]} [inputs]
     *    The set of inputs to search within. Uses all of the currently found
     *    inputs by default.
     *
     * @returns {jQuery}
     *    A jQuery object containing any matched input elements.
     */
    modifiedInputs: function(inputs) {
      var self = this;

      return this.inputs(inputs).filter(function() {
        return $(this).data([self.options.namespace, self.states.modified].join("."));
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

        if (this.timer) {
          this.stopInterval();
        }

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
          var formData, passes = true;

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
                if (save.method.call(self, save.options, formData) === false) {
                  // Methods that return false should handle the call to next()
                  // we call resetFields manually here (immediately) before the async 
                  // save fires, because the callback will call next without 'true'.
                  // and we want to reset the fields when the async save *starts*.
                  self.resetFields();
                } else {
                  self.next("save", true);
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
     *    Whether or not to reset which elements were changed/modified before saving.
     *    Defaults to false.
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
     * Reset which elements where changed/modified before saving.
     */
    resetFields: function() {
      this.inputs().data([this.options.namespace, this.states.changed].join("."), false);
      this.inputs().data([this.options.namespace, this.states.modified].join("."), false);
    },

    /**
     * Called whenever a queue finishes processing, usually to perform some
     * type of cleanup.
     *
     * @param {Array} queue
     *    The queue that has finished processing.
     *
     * @param {Boolean} [resetChanged]
     *    Whether or not to reset which elements were changed/modified before saving.
     *    Defaults to false
     */
    finished: function(queue, name, resetChanged) {
      if (name === "save") {
        if (queue) {
          this.forms().triggerHandler(this.options.events.saved);
        }

        if (resetChanged) {
          this.resetFields();
        }

        // If there is a timer running, start the next interval
        if (this.timer) {
          this.startInterval();
        }
      }
    }
  };

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

        this.forms().bind([this.options.events.changed, this.options.namespace].join("."), function(e, input) {
          self.save(input, e.type);
        });
      }
    },

    /**
     * Attempt to save any time an input value is modified.
     */
    modify: {
      method: function() {
        var self = this;

        this.forms().bind([this.options.events.modified, this.options.namespace].join("."), function(e, input) {
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
    },

    /**
     * Only use the inputs with values that have been modified since the last save.
     */
    modified: {
      method: function() {
        return this.modifiedInputs();
      }
    }
  });

  $.extend(callbacks.data, {
    /**
     * See: http://api.jquery.com/serialize/
     *
     * @returns {String}
     *    Standard URL-encoded string of form values.
     */
    serialize: {
      method: function(options, $inputs) {
        return $inputs.serialize();
      }
    },

    /**
     * See: http://api.jquery.com/serializeArray/
     *
     * @returns {Array}
     *     An array of objects containing name/value pairs.
     */
    serializeArray: {
      method: function(options, $inputs) {
        return $inputs.serializeArray();
      }
    },

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
     * @returns {Object}
     *    The resulting object of form values.
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
     * Only save if the interval called the save method.
     */
    interval: {
      method: function(options, $inputs, data, caller) {
        return (!this.timer || this.timer === caller);
      }
    },

    /**
     * Only save if at least one of the input values has changed.
     */
    changed: {
      method: function() {
        return this.changedInputs().length > 0;
      }
    },

    /**
     * Only save if at least one of the input values has been modified.
     */
    modified: {
      method: function() {
        return this.modifiedInputs().length > 0;
      }
    }
  });

  $.extend(callbacks.save, {
    /**
     * Saves form data using a jQuery.ajax call.
     */
    ajax: {
      method: function(options, formData) {
        var self = this, o = $.extend({}, options);

        // Wrap the complete method with our own
        o.complete = function(xhr, status) {
          if ($.isFunction(options.complete)) {
            options.complete.apply(self, arguments);
          }

          self.next("save");
        };

        // Allow for dynamically generated data
        if ($.isFunction(o.data)) {
          o.data = o.data.call(self, formData);
        }

        var formDataType = $.type(formData),
            optionsDataType = $.type(o.data);

        // No options data given, use form data
        if (optionsDataType == "undefined") {
          o.data = formData;

        // Data types must match in order to merge
        } else if (formDataType == optionsDataType) {
          switch(formDataType) {
            case "array": {
              o.data = $.merge(formData, o.data);
            } break;
            case "object": {
              o.data = $.extend(formData, o.data);
            } break;
            case "string": {
              o.data = formData + (formData.length ? "&" : "") + o.data;
            } break;
          }
        } else {
          throw "Cannot merge form data with options data, must be of same type.";
        }

        $.ajax(o);

        return false;
      },
      options: {
        url: window.location.href
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

})(jQuery, window, document);
