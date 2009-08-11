/**
 * jQuery Plugin Autosave
 *
 * @author Mads Erik Forberg (mads[at]hardware[dot]no)
 * @author Raymond Julin (raymond[dot]julin[at]gmail[dot]com)
 *
 * Licensed under the MIT License
 *
 * Usage: 
 * $("input.autosave").autosave({ 
 *     url: url, // Defaults to parent form url or window.location.href
 *     method: "post",  // Defaults to parent form url or get
 *     grouped: true, // Defaults to false. States whether all selected fields should be sent in the request or only the one it was triggered upon
 *     success: function(data) { 
 *         console.log(data); 
 *     },
 *     send: function() { 
 *         // Do stuff while we wait for the ajax response, defaults to doing nothing
 *         console.log("Saving");
 *     },
 *     error: function(xmlReq, text, errorThrown) { 
 *         // Handler if the ajax request fails, defaults to console.log-ing the ajax request scope
 *         console.log(text);
 *     },
 *     dataType: "json" // Defaults to JSON, but can be XML, HTML and so on
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
        var elems = $(this), nodes = {}, eventType,spinnerSize;
        options = $.extend({
            grouped: false,
            send: false,
            error: false,
            success: false,
            dataType: "json",
        },options);
        
        /**
         * For each element selected (typically a list of form elements
         * that may, or may not, reside in the same form
         * Build a list of these nodes and bind them to some
         * onchange/onblur events for submitting
         */
        return elems.each(function(i) {
            var that = $(this);
            if ($(this).is("form")) {
                /* Group all inputelements in this form */
                options.grouped = true;
                nodes = that.find(":input,button");
                // Bind to forms submit
                that.bind('submit', function(e) {
                    e.preventDefault();
                    $.fn.autosave._makeRequest(e, nodes, options, that);
                });
                // Bind to form elements change
                nodes.each(function (i) {
                    if ($(this).is('button')) {
                        $(this).bind("click", function (e) {
                            e.preventDefault();
                            $.fn.autosave._makeRequest(e, nodes, options, this);
                        });
                    }
                    else {
                        $(this).bind("change", function (e) {
                            $.fn.autosave._makeRequest(e, nodes, options, this);
                        });
                    }
                });
            }
            else {
                if (that.is('button')) {
                    that.bind("click", function (e) {
                        e.preventDefault();
                        $.fn.autosave._makeRequest(e, elems, options, this);
                    });
                }
                else {
                    that.bind("change", function (e) {
                        $.fn.autosave._makeRequest(e, elems, options, this);
                    });
                }
            }
        });
    }
    
    /**
     * Actually make the http request
     * using previously supplied data
     */
    $.fn.autosave._makeRequest = function(e, nodes, options, actsOn) {
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
                if (!$(this).is('button,:submit') || e.currentTarget == this)
                    vals[this.name] = $(this).val();
            });
        }
        else {
            vals[actsOn.name] = $(actsOn).val();
        }
        /**
         * Finally perform http request and run the saving-method
         */
        opts.send ? opts.send($(actsOn)) : false;
        $.ajax({
            type: opts.method,
            data: vals,
            url: opts.url,
            dataType: opts.dataType,
            success: function(resp) {
                opts.success ? opts.success(resp) : false;
            },
            error: function(resp) {
                opts.error ? opts.error(resp) : false;
            }
        });
    }
})(jQuery);

defaultAutosaveSendVisualizer = function(node) {
    var refNode;
    if (node.is('form'))
        refNode = $(node).find('legend');
    else
        refNode = $(node).parent('fieldset').find('legend');
    var spinner = $('<img src="/images/spin.gif" />').css({
        'position':'relative',
        'margin-left':'10px',
        'height': refNode.height(),
        'width': refNode.height()
    });
    spinner.appendTo(refNode);
}
