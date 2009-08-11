/**
 * jQuery Plugin Autosave
 *
 * @author Mads Erik Forberg (mads[at]hardware[dot]no)
 * @author Raymond Julin (raymond[dot]julin[at]gmail[dot]com)
 *
 * Licensed under the BSD License
 *
 * Usage: 
 * $("input.autosave").autosave({ 
 *     url: url, // Defaults to parent form url or window.location.href
 *     method: "post",  // Defaults to parent form url or get
 *     grouped: true, // Defaults to false. States whether all "input.autosave" should be sent in the request or only the one it was triggered upon
 *     load: function(data) { 
 *         console.log(data); 
 *     },
 *     dataType: "json", // Defaults to JSON, but can be XML, HTML and so on
 *     saving: function() { // Do stuff while we wait for the ajax response, defaults to doing nothing
 *         console.log("Saving");
 *     },
 *     error: function(xmlReq, text, errorThrown) { // Handler if the ajax request fails, defaults to console.log-ing the ajax request scope
 *         console.log(text);
 *     }
 * });
 *
 * $("form#myForm").autosave(); // Submits entire form each time one of the 
 *                              // elements are changed
 *
 *
 * Todo:
 * - More events: load/error/saving
 * 
 */

(function($) {
    $.fn.autosave = function(options) {
        // Define some variables
        var elems = $(this), nodes = {}, eventType;
        
        /**
         * For each element selected (typically a list of form elements
         * that may, or may not, reside in the same form
         * Build a list of these nodes and bind them to some
         * onchange/onblur events for submitting
         */
        return elems.each(function(i) {
            var spinner = $('<img src="/images/spin.gif" />').css({
                    'position':'relative',
                    'margin-left':'10px',
                    'height':$(this).parent('fieldset').find('legend').height(),
                    'width':$(this).parent('fieldset').find('legend').height(),
            });
            if ($(this).is("form")) {
                /* Group all inputelements in this form */

                if (options == undefined)
                    options = {};
                options.grouped = true;
                nodes = $(this).find(":input");
                var that = $(this);
                // Bind to forms submit
                $(this).bind('submit', function(e) {
                    e.preventDefault();
                    spinner.appendTo(that.find('legend'));
                    $.fn.autosave._makeRequest(e, nodes, options, that, spinner);
                });
                // Bind to form elements change
                nodes.each(function (i) {
                    $(this).bind("change", function (e) {
                        spinner.appendTo(that.find('legend'));
                        $.fn.autosave._makeRequest(e, nodes, options, this, spinner);
                    });
                });
            }
            else {
                nodes[this.name] = this;
                var that = $(this);
                $(this).bind("change", function(e) {
                    if (that.parent('fieldset').length > 0)
                        spinner.appendTo(that.parent('fieldset').find('legend'));
                    else
                        spinner.prependTo(that.parent('form'));
                    $.fn.autosave._makeRequest(e, nodes, options, this, spinner);
                });
            }
        });
    }
    
    /**
     * Actually make the http request
     * using previously supplied data
     */
    $.fn.autosave._makeRequest = function(e, nodes, options, actsOn,spinner) {
        // Keep variables from global scope
        var vals = {}, opts = {}, form;
        /**
         * Generate a hash of options
         * method: post
         * url: Will default to parent form if one is found,
         *   if not it will use the current location
         * load: Will be an empty function returning (bool)true
         */
        form = $(actsOn).is('form') ? $(actsOn) : $(actsOn.form);
        opts = $.extend({
            url: (form.attr('action'))? form.attr('action') : window.location.href,
            method: (form.attr('method')) ? form.attr('method') : "post",
            grouped: false,
            load: function(data) {
                // Do nothing
                return true;
            },
            dataType: "json",
            error: function(req, text, errorThrown) {
                return this;
            },
            saving: function() {
                // Do nothing
            }
        }, options);

        /**
         * If options.grouped is true we collect every
         * value from every node
         * But if its false we should only push
         * the one element we are acting on
         */
        if (opts.grouped) {
            var vals = {};
            nodes.each(function (i) {
                /**
                 * Do not include button and input:submit as nodes to 
                 * send, EXCEPT if the button/submit was the explicit
                 * target, aka it was clicked
                 */
                if (!$(this).is('button,:submit') ||
                    e.originalEvent.explicitOriginalTarget == this)
                    vals[this.name] = $(this).val();
            });
        }
        else {
            vals[actsOn.name] = $(actsOn).val();
        }
        /**
         * Finally perform http request and run the saving-method
         */
        opts.saving();
        $.ajax({
            type: opts.method,
            data: vals,
            url: opts.url,
            dataType: opts.dataType,
            success: function(resp) {
                spinner ? spinner.remove():false;
                opts.load(resp);
            },
            error: function(resp) {
                spinner ? spinner.remove():false;
                opts.error(resp);
            }
        });
    }
})(jQuery);
