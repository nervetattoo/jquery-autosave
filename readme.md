# jQuery.autosave Plugin

The jQuery.autosave plugin automatically and unobtrusively saves form field data based on a set of critera.
Saving can be broken down into a simple four step process:

  1. An event triggers an autosave.
  2. The scope of data gathered from the form fields is narrowed to what we wish to save.
  3. We test the current state of the plugin against a series of conditions.
  4. If these conditions pass, we save the data using any number of methods.

This plugin works strictly with forms and form fields of any type. Any other elements fed to the plugin will
be ignored. Currently, if you wish to autosave data on a per form basis, you should attach a separate instance
of the plugin to each form.

# Options

The default plugin options are shown below:

    options: {
      triggers: ["interval"],
      filters: [],
      conditions: [],
      methods: ["ajax"]
    },

The properties _triggers_, _filters_, _conditions_ and _methods_ are each composed of an array of
**callback methods** that will be called within the plugin when needed and in the order they are defined.
The plugin includes several built-in callback methods, but you can also define your own. The following
are all of the valid values for any of the callback-style properties:

  * **"callbackMethod"** _or_ **{ method: "callbackMethod"[, options: {}] }** - Calls a built-in callback
    method, optionally passing an options object to merge with the default options as defined in the plugin.
  * **function() {}** _or_ **{ method: function() {}[, options: {}] }** - Calls a custom callback method,
    optionally passing an options object to pass into the function.

Each callback method will be called within the context of the current instance, therefore the keyword _this_
may be used to access any class properties and functions. The arguments passed to each callback method are
defined below.

## Triggers

## Filters

## Conditions

## Methods

# Examples

# Compatibility

# License
