/**
 * jQuery.autosave
 *
 * @author Raymond Julin (raymond[dot]julin[at]gmail[dot]com)
 * @author Mads Erik Forberg (mads[at]hardware[dot]no)
 * @author Simen Graaten (simen[at]hardware[dot]no)
 *
 * Licensed under the MIT License
 */

(function($) {
  $.fn.autosave = function(options) {
    options = $.extend(true, $.fn.autosave.options, options);

    var timer,
      changed = [],
      $elements = this,
      rprops = /^(checked|selectedIndex)$/,
      interval = !isNaN(parseInt(options.save.onInterval))
        && options.save.onInterval > 0 ? save.onInterval : 5000,
      eventType = options.save.onEvent ? (typeof options.save.onEvent
        === "string" ? options.save.onEvent : "autosave") : false,
      condition = typeof options.save.onCondition === "function"
        ? options.save.onCondition : false,
      // returns the forms associated with targets
      forms = function(targets) {
        var $forms = targets ? $(targets) : $elements;

        // we only want unique form instances, no duplicates
        return $($.unique($forms.map(function() {
          return this.elements ? this : this.form;
        }).get()));
      },
      // returns the form fields associated with targets
      fields = function(targets) {
        var $fields = targets ? $(targets) : $elements;

        // extracts form fields if a form element is found
        return $fields.map(function() {
          return this.elements ? $.makeArray(this.elements) : this;
        });
      },
      // setTimeout loop for saving on intervals
      loop = function(targets) {
        // using setTimeout ensures our requests are processed in the
        // order they are received but may delay them slightly
        if (targets !== false) {
          console.log("loop:", targets);
          timer = setTimeout(function() {
            notify(targets, timer);
          }, interval);
        } else {
          clearTimeout(timer);
          timer = undefined;
        }
      },
      // called whenever there is new data to be saved, or on an interval
      notify = function(targets, context) {
        console.log("notify:", targets);

        // if there is a timer going and we are grouping by interval, wait
        // for the timer to call notify before saving
        if (!timer || options.group.byInterval && context === timer) {
          // if we are grouping by event, wait for that event to fire
          if (!eventType || options.group.byEvent && context === eventType) {
            // if we are saving grouped values, use all targets, otherwise
            // only use targets that have been changed since the last save
            var $fields = options.group.byChanged
              ? fields(changed) : fields(targets),
              $forms = forms($fields);

            // if we have something to update...
            if ($fields.length && (!condition || condition.call(
              $elements, options, changed, $forms, $fields) === true)) {
              // send requests separately if grouping by form
              if (options.group.byForm) {
                $forms.each(function(i, form) {
                  save($fields.filter(function() {
                    return this.form === form;
                  }).serializeArray(), targets);
                });
              }

              // if we are grouping form field data, it can be sent in one request
              else save($fields.serializeArray(), targets);
            }
          }
        }

        // nothing to update on this loop or condition failed, continue
        if (timer && context === timer) loop(targets);
      },
      // performs the actual saving of data
      save = function(data, targets) {
        console.log("save:", data, targets);

        // reset changed elements list
        changed = [];

        // if we have a timer interval, continue the loop
        if (timer) loop(targets);
      };

    // save references to the forms and fields that were
    // passed into the plugin
    var $forms = forms(), $fields = fields();

    // set up form listeners
    $fields.each(function() {
      // IE doesn't fire the change event for checkboxes and select multiples
      var eventType = (this.type == 'checkbox' ||
        this.tagName.toLowerCase() == "select" && this.multiple)
        && ("onpropertychange" in document.body) ? "propertychange" : "change";

      $(this).bind(eventType, function(e) {
        // if type is propertychange, only fire trigger for certain
        // propertyName's (see regex above)
        if (e.type == "change" || (e.type == "propertychange"
          && rprops.test(window.event.propertyName))) {
          // add this element to the list of changed elements
          changed.push(this);

          // notify plugin of update and save
          if (options.save.onUpdate) {
            console.log("onUpdate:", this);
            notify(this);
          }
        }
      });
    });

    // save when an event fires
    if (options.save.onEvent) {
      console.log("onEvent:", eventType);

      $forms.bind(eventType, function() {
        notify(this, eventType);
      });
    }

    // attempt to save at regular intervals. actual save will only
    // happen if form values have changed since the last interval
    if (options.save.onInterval) {
      console.log("onInterval:", interval);

      $forms.bind("start." + eventType, function() {
        loop(this);
      }).bind("stop." + eventType, function() {
        loop(false);
      }).trigger("start." + eventType);
    }

    return $elements;
  }

  // Expose default options for plugin override
  $.fn.autosave.options = {
    save: {
      onEvent: false,
      onChange: true,
      onInterval: true,
      onConditoin: false
    },
    group: {
      byForm: true,
      byEvent: false,
      byChanged: true,
      byInterval: true
    },
    method: "ajax",
    methods: {
      ajax: {
        url: window.location.href,
        type: 'POST'
      }
    }
  }
})(jQuery);
