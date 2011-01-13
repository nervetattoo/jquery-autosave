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
      save: "ajax",
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
      var forms = [], self = this;

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
        changed: [],
        $forms: this.forms(),
        $fields: this.fields(),
        group: this.options.group,
        notify: this.options.notify,
        interval: !isNaN(parseInt(this.options.notify.onInterval))
          ? this.options.notify.onInterval : 30000,
        eventName: typeof this.options.notify.onEvent === 'string'
          ? this.options.notify.onEvent : 'autosave',
        conditions: $.isArray(this.options.conditions)
          ? this.options.conditions : null
      });

      // Bind to event
      if (this.notify.onEvent) {
        console.log("onEvent:", eventType);

        this.form.bind(this.eventName, function() {
          self.notify(this);
        });
      }

      // Start interval
      if (this.notify.onInterval) {
        console.log("onInterval:", this.interval);

        this.start(this.interval);
      }

      // Set up form listeners to all form inputs.
      // For IE bug fixes, see: https://gist.github.com/770449
      this.$fields.each(function() {
        var eventType = (this.type == 'checkbox' ||
          this.tagName.toLowerCase() == "select" && this.multiple)
          && ("onpropertychange" in document.body) ? "propertychange" : "change";

        $(this).bind(eventType, function(e) {
          if (e.type == "change" || (e.type == "propertychange"
            && /^(checked|selectedIndex)$/.test(window.event.propertyName))) {
            // Add this element to the list of changed elements
            self.changed.push(this);

            if (self.notify.onChange) {
              console.log("onUpdate:", this);
              self.notify(this);
            }
          }
        });
      });
    },

    // Returns the form fields associated with targets
    fields: function(targets) {
      var $targets = targets ? targets : this.elements;

      // Extracts form fields if a form element is found
      return $targets.map(function() {
        return this.elements ? $.makeArray(this.elements) : this;
      });
    },

    // returns the forms associated with targets
    forms: function(targets) {
      var $targets = targets ? $(targets) : this.elements;

      // we only want unique form instances, no duplicates
      return $($.unique($targets.map(function() {
        return this.elements ? this : this.form;
      }).get()));
    },

    // Starts the autosave interval loop
    start: function(interval) {
        var self = this;

        if (this.timer) this.stop();

        this.timer = setTimeout(function() {
          self.notify(this.timer);
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

      if (this.conditions && this.conditions.length) {
        $.each(conditions, function(i, condition) {
          if ($.isFunction(condition)) {
            return passes = (condition.call(self.$element,
              self.$forms, targets, self.options, self.changed) !== false);
          }
        });
      }

      return passes;
    },

    // Notifies the plugin of a change and handles it accordingly
    notify: function(targets, timer) {
      var self = this;

      console.log("notify:", targets, timer);

      // If there is a timer running, only proceed if it called this function
      if (!this.timer || this.group.byInterval && this.timer === timer) {
        // Fields may be all fields, or only those that have changed
        var $fields = this.group.byChanged ? fields(this.changed)
          : (targets ? fields(targets) : this.$fields);

        // Loop through all of our conditions and make sure they pass
        if ($fields.length && (!this.conditions || this.passes($fields))) {
          self.save($fields.serializeArray());
        }
      }

      // If there is a timer running, continue on to the next interval
      if (this.time && this.timer === timer) {
        console.log("started");
        this.start();
      }
    },

    // performs the actual saving of data
    _save: function(data) {
      console.log("save:", this.options.save, data);

      // reset changed elements list
      this.changed = [];
    }
  });
})(jQuery);
