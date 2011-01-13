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

(function($) {
  $.plugin("autosave", {
    options: {
      save: {
        method: "ajax",
        methods: {
          ajax: {
            url: window.location.href,
            method: "POST"
          }
        }
      },
      notify: {
        onEvent: false,
        onChange: true,
        onInterval: true
      },
      group: {
        byForm: true,
        byEvent: false,
        byChanged: true,
        byInterval: true
      },
      conditions: []
    },

    // Set up the plugin
    _initialize: function() {
      var self = this;

      // We are only interested in forms and inputs
      if (!this.element.elements && !this.element.form) return;

      // Loop through all of the elements passed to the plugin and attach
      // only to the ones that are associated with form elements
      this.elements.filter(function() {
        return (this.elements || this.form);
      }).data(this.name, this);

      // Set up our default values
      $.extend(true, this, {
        timer: null,
        changed: {},
        $forms: this.forms(),
        $fields: this.fields(),
        interval: !isNaN(parseInt(this.options.notify.onInterval))
          ? this.options.notify.onInterval : 3000,
        eventName: typeof this.options.notify.onEvent === "string"
          ? this.options.notify.onEvent : "autosave",
        conditions: $.isArray(this.options.conditions)
          && this.options.conditions.length ? this.options.conditions : null
      });

      // Set up changed fields for each form
      this.$forms.each(function() {
        self.changed[this.name] = [];
      });

      // Bind to event
      if (this.options.notify.onEvent) {
        console.log("onEvent:", eventType);

        this.form.bind(this.eventName, function() {
          self._notify(this);
        });
      }

      // Start interval
      if (this.options.notify.onInterval) {
        console.log("onInterval:", this.interval);

        this.start(this.interval);
      }

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

            if (self.options.notify.onChange) {
              console.log("onUpdate:", this);
              self._notify(this);
            }
          }
        });
      });
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
          self._notify(null, self.timer);
        }, interval || this.interval);
    },

    // Stops the autosave interval loop
    stop: function() {
      clearTimeout(this.timer);
      this.timer = null;
    },

    // Whether or not the plugin satisfies its save conditions when
    // matched against current targets (or all if none are passed)
    passes: function(targets) {
      var self = this, passes = true;

      targets = targets || this.$fields;

      if (this.conditions) {
        $.each(this.conditions, function(i, condition) {
          if ($.isFunction(condition)) {
            return passes = (condition.call(self.$element,
              self.$forms, targets, self.options, self.changed) !== false);
          }
        });
      }

      return passes;
    },

    // Notifies the plugin of a change and handles it accordingly
    _notify: function(targets, timer) {
      var requests, self = this, group = this.options.group;

      console.log("notify:", targets, timer);

      // If there is a timer running, only proceed if it called this function
      if (!this.timer || group.byInterval && this.timer === timer) {
        // Fields may be all fields, or only those that have changed
        var $fields = group.byChanged ? this.fields(this.changed)
          : (targets ? this.fields(targets) : this.$fields);

        // TODO -- implement group.byForm

        // Loop through all of our conditions and make sure they pass
        if ($fields.length && (!this.conditions || this.passes($fields))) {
          this._save($fields.serializeArray());
        }

        // If there is a timer running, start the next interval
        else if (this.timer) {
          console.log("start");
          this.start();
        }
      }
    },

    // performs the actual saving of data
    _save: function(data) {
      var result, self = this,
        save = this.options.save,
        saveMethod = typeof save.method;

      console.log("save:", data);

      // Custom method call
      if (saveMethod === "function") {
        // Custom methods can return false to handle the call to start the
        // timer themselves. Otherwise, it will start after the method call.
        if ((result = save.method.call(this, data)) !== false && this.timer) {
          this.start();
        }
      }

      // Built in save method
      else if (saveMethod === "string" && save.method in save.methods) {
        switch(save.method) {
          case "ajax": {
            // TODO
            $.ajax($.extend(save.methods, {
              complete: function() {
                if (self.timer) self.start();
              }
            }));
            break;
          }
        }
      }
    }
  });
})(jQuery);
