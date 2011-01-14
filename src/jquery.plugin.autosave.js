/**
 * jQuery.plugin.autosave
 *
 * @author Kyle Florence (kyle[dot]florence[at]gmail[dot]com)
 *
 * Based on jQuery.autosave by:
 *
 *  @author Raymond Julin (raymond[dot]julin[at]gmail[dot]com)
 *  @author Mads Erik Forberg (mads[at]hardware[dot]no)
 *  @author Simen Graaten (simen[at]hardware[dot]no)
 *
 * Licensed under the MIT License
 */

;(function($, undefined) {
  $.plugin("autosave", {
    options: {
      save: {
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
        methods: [{
          method: "ajax",
          options: {}
        }],
        /**
         * Conditions is an array of methods to invoke before calling any of
         * the data saving methods. Any condition function that returns false
         * will prevent saving from happening. These functions will be invoked
         * with this instance as the context and these arguments:
         * - fields - the form fields this save request is acting upon
         * - data - the data from those form fields
         */
        conditions: []
      },
      notify: {
        onEvent: false,
        onChange: true,
        onInterval: false
      },
      group: {
        byForm: false,
        byChanged: false,
        byInterval: false
      }
    },

    // Set up the plugin
    _initialize: function() {
      // We are only interested in forms and inputs
      if (!this.element.elements && !this.element.form) return;

      // Loop through all of the elements passed to the plugin and attach
      // only to the ones that are associated with form elements
      this.elements.filter(function() {
        return (this.elements || this.form);
      }).data(this.name, this);

      var self = this,
        save = this.options.save,
        notify = this.options.notify;

      $.extend(true, this, {
        timer: undefined,
        changed: {},
        responded: 0,
        $forms: this.forms(),
        $fields: this.fields(),
        // Sanitize default values
        interval: !isNaN(parseInt(notify.onInterval))
          ? notify.onInterval : 3000,
        conditions: $.isArray(save.conditions) && save.conditions.length
          ? save.conditions : undefined,
        eventName: typeof notify.onEvent === "string"
          ? notify.onEvent : "autosave"
      });

      // Set up changed input lists for each form element
      this.$forms.each(function() {
        self.changed[this.name] = [];
      });

      // Set up form listeners to all form inputs.
      // For IE bug fixes, see: https://gist.github.com/770449
      this.$fields.each(function() {
        var eventType = (this.type == "checkbox" ||
          this.tagName.toLowerCase() == "select" && this.multiple)
          && ("onpropertychange" in document.body) ? "propertychange" : "change";

        $(this).bind(eventType, function(e) {
          if (e.type == "change" || (e.type == "propertychange"
            && /^(checked|selectedIndex)$/.test(window.event.propertyName))) {
            // Add this element to the list of changed elements
            self.changed[this.form.name].push(this);

            if (notify.onChange) {
              console.log("onUpdate:", this);
              self._notify(this);
            }
          }
        });
      });

      if (notify.onEvent) {
        console.log("onEvent:", eventType);

        this.$forms.bind(this.eventName, function() {
          self._notify(this);
        });
      }

      if (notify.onInterval) {
        console.log("onInterval:", this.interval);

        this.start(this.interval);
      }
    },

    // Returns the form fields associated with elements
    fields: function(elements) {
      var $elements = elements ? $(elements) : this.elements;

      // Extract inputs from form elements
      return $elements.map(function() {
        return this.elements ? $.makeArray(this.elements) : this;
      });
    },

    // Returns the forms associated with elements
    forms: function(elements) {
      var $elements = elements ? $(elements) : this.elements;

      // Weed out duplicates
      return $($.unique($elements.map(function() {
        return this.elements ? this : this.form;
      }).get()));
    },

    // Starts the autosave interval loop
    start: function(interval) {
        var self = this;

        if (this.timer) this.stop();

        this.timer = setTimeout(function() {
          self._notify(undefined, self.timer);
        }, interval || this.interval);
    },

    // Stops the autosave interval loop
    stop: function() {
      clearTimeout(this.timer);
      this.timer = null;
    },

    // Whether or not the plugin satisfies its save conditions when
    // matched against current targets (or all if none are passed)
    passes: function(targets, data) {
      var self = this, passes = true;

      targets = targets || this.$fields;

      if (this.conditions) {
        $.each(this.conditions, function(i, condition) {
          if ($.isFunction(condition)) {
            return (passes = condition.call(self, targets, data)) !== false;
          }
        });
      }

      return passes;
    },

    // Notifies the plugin of a change and handles it accordingly
    _notify: function(targets, context) {
      var requests, self = this, group = this.options.group;

      console.log("notify:", targets, context);

      // If there is a timer running, only proceed if it called this function
      if (!this.timer || group.byInterval && this.timer === context) {
        // TODO -- implement group.byForm, flatten for now
        var changed = [];

        // For now, flatten the changed array
        $.each(this.changed, function(formName, changedFields) {
          changed = changed.concat(changedFields);
        });

        // Fields may be all fields, or only those that have changed
        var $fields = group.byChanged ? this.fields(changed)
          : (targets ? this.fields(targets) : this.$fields);

        // Save as long as we have something to save
        if ($fields.length) this._save($fields);

        // If there is a timer running, start the next interval
        else if (this.timer) this.start(this.interval);
      }
    },

    // performs the actual saving of data
    _save: function($fields) {
      var self = this, methods = this._saveMethods,
        data = $fields.serializeArray();

      console.log("save:", data);

      $.each(this.options.save.methods, function(i, handler) {
        if (handler) {
          var save = {}, handlerType = typeof handler;

          // Custom function without options
          if (handlerType === "function") {
            save.method = handler;
          }

          // Built in function with default options
          else if (handlerType === "string" && handler in methods) {
            save = methods[handler];
          }

          // Objects can contain custom or built in handler methods
          // with or without options
          else if (handlerType === "object" && "method" in handler) {
            handlerType = typeof handler.method;

            // Custom handler method
            if (handlerType === "function") {
              save = handler;
            }

            // Built in handler method with
            else if (handlerType === "string" && handler.method in methods) {
              save = methods[handler.method];

              // Merge in user defined options, if they exist
              if (typeof handler.options === "object") {
                save.options = $.extend(true, {}, save.options, handler.options);
              }
            }
          }

          // Loop through any provided pre-save conditions and proceed if they
          // all pass (none of them return a false value).
          if (!self.conditions || self.passes($fields, data)) {
            // Actually call the method. If the method returns false, the call
            // to _saveComplete should be handled within the method.
            return (save.method && save.method.call(self, data, save.options) !== false);
          }

          // Completed this save handler
          self._saveComplete();
        }
      });
    },

    // Should be called after successful save in order to cleanup and get
    // ready for the next round of saving.
    _saveComplete: function(status) {
      var self = this;

      // Increment the number of responses we've got back
      this.responded++;

      // If all the save methods have responded, do cleanup work
      if (this.responded === this.options.save.methods.length) {
        this.responded = 0;

        // Reset changed elements
        $.each(this.changed, function(i) {
          self.changed[i] = [];
        });

        // If there is a timer running on completion, start the next interval
        if (this.timer) this.start(this.interval);
      }
    },

    // Stores all built in save methods
    _saveMethods: {
      ajax: {
        method: function(data, options) {
          $.ajax($.extend(true, {}, options, {
            data: data,
            context: this,
            complete: function(xhr, status) {
              // Call the user defined function first, if it exists
              if ($.isFunction(options.complete)) {
                options.complete.apply(this, arguments);
              }

              // Cleanup
              this._saveComplete(status);
            }
          }));

          // We will handle the call to the completion function
          return false;
        },
        options: {
          url: window.location.href,
          method: "POST"
        }
      }
    }
  });
})(jQuery);
