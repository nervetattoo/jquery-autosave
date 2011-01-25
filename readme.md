# jQuery.autosave

    $("form").autosave({...});

The jQuery.autosave plugin automatically and unobtrusively saves form field data based on a set of critera.
Saving can be broken down into a simple four step process:

1. **A trigger fires, starting the autosave process.**
2. **The set of form fields to gather data from is reduced to those that are needed.**
3. **The current state of the plugin is tested against a series of conditions.**
4. **If these conditions pass, we save the data using any number of methods.**

This plugin works strictly with forms and form fields of any type. Any other elements fed to the plugin will
be ignored. Currently, if you wish to autosave data on a per form basis, you should attach a separate instance
of the plugin to each form.

## Options

Options is a set of key/value pairs that can be passed into the plugin as the first argument upon
initialization. All options are optional.

* **triggers** _Array_ ["change"]  
  An array of callback methods that will start the saving process. By default, a save will be attempted
  any time a form field value changes.
* **filters** _Array_ []  
  An array of callback methods that reduces the set of fields to save data from. By default, all of the
  fields found by the plugin on initialization will be used in the dataset.
* **conditions** _Array_ []  
  An array of callback methods that will determine whether or not autosave. By default, no conditions
  need to be met.
* **methods** _Array_ ["ajax"]  
  An array of callback methods that will determine how the form field data will be saved. By default,
  [jQuery.ajax](http://api.jquery.com/jQuery.ajax/) will POST the data to the current browser URL.
* **events** _Object_  
  Contains a set of key/value pairs that allow you to change the name of events used within the plugin.
  * **change** _String_ "autosave.change"  
    The name to assign to the event fired whenever a form value changes.

## Callback Methods

Several of the properties above are composed of an array of **callback methods**. These methods are invoked
within the plugin in the order that they are defined in the array. They may contain _Strings_, _Objects_
or _Functions_. Thus, any of the following are valid ways of defining a callback method:

* **"callbackMethod"** _or_ **{ method: "callbackMethod"[, options: {}] }**  
  Calls a built-in callback method, optionally passing an options object to merge with the default
  options as defined in the plugin.
* **function() {}** _or_ **{ method: function() {}[, options: {}] }**  
  Calls a custom callback method, optionally passing an options object to pass into the function.

## Built-in Callback Methods

There are several built-in callback methods that provide you an easy way to set up the most common saving
processes. The names of these methods are detailed below along with the arguments that will be passed in
when the methods are invoked. Every callback method is called with the current instance as the context of
the keyword _this_ making it easy to call any class property or function from within the callback method.

### Triggers

    trigger([options]);

The following are the built-in callback methods for _options.triggers_.

* **change**  
  Attempts to save any time a form value changes.
* **event**  
  Attaches an arbitrary event to all of the forms autosave is attached to and attempts to save any
  time that event is fired.
* **interval**  
  Creates an interval loop that will attempt to save periodically.

The default arguments passed to these callback methods are:

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.

### Filters

    filter(options, $fields);

The following are the built-in callback methods for _options.filters_. **Each filtering callback method
should return a jQuery object containing the filtered form fields**.

* **changed**  
  Filters fields down to only those that have had their value changed since the last autosave.

The default arguments passed to these callback methods are:

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$fields** _jQuery_  
  A jQuery object containing the current scope of form fields. Generally, this is either a single form
  field whose value has changed, or all of the fields detected by the plugin on initialization. Keep in
  mind that filter callback methods change the current scope of fields, meaning further callback methods
  will be given the new set of fields to filter on.

### Conditions

    condition(options, $fields, data[, caller]);

The following are the built-in callback methods for _options.conditions_. **Each conditional callback
method should return either _true_ or _false_.** If _false_ is returned, it will halt the saving process.
Any _non-false_ value is treated the same as returning _true_.

* **changed**  
  Only save if at least one form field value has changed since the last autosave.
* **interval**  
  Only save on intervals. If anything else triggers an autosave, it will fail.

The default arguments passed to these callback methods are:

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$fields** _jQuery_  
  A jQuery object containing the current scope of form fields. The fields given here have already been
  filtered.
* **data** _Array_  
  An array of objects containing the data gathered from the filtered form fields. This data is gathered
  using the jQuery [.serialize()](http://api.jquery.com/serialize/) method.
* **caller** _String, Number_  
  Used to denote who called the save method. This is generally undefined, but may contain the ID of the
  current interval timer or an event name.

### Methods

    method(options, data);

These are the built-in callback methods for _options.methods_. **Note that _this.complete()_ will be
called immediately after the invocation of the saving callback method**. The method _this.complete()_
is a special internal function that tells the plugin the save has finished and that it can now move onto
the next method in the array (or perform necessary cleanup if there are no remaining save methods). If
you are defining a custom callback method and the plugin to wait for some asynchronous task to finish
before _this.complete()_ is called, your callback method should return _false_. This will prevent the
automatic call to _this.complete()_ and let you handle the call yourself.

* **ajax**  
  Will save the data using [jQuery.ajax](http://api.jquery.com/jQuery.ajax/).

The default arguments passed to these callback methods are:

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method. Any option that is
  accepted by the jQuery.ajax method is also acceptable here.
* **data** _Object_  
  An array of objects containing the data gathered from the filtered form fields. This data is gathered
  using [jQuery's .serialize()](http://api.jquery.com/serialize/).

## Events

    event(event[, ...]);

The events that jQuery.autosave binds are listed in _options.events_. Each event handler may be passed
any number of arguments, although the first argument will always be the
[jQuery Event Object](http://api.jquery.com/category/events/event-object/).

* **change(event, field)** _String_ "autosave.change"  
  This event is bound to each form element and is fired whenever a form field value changes. The argument
  _field_ refers to the element that triggered the event.

## Examples

    $("form").autosave();

Without passing any options into the plugin, it will default to saving any time a form field value is
changed.

    $("form").autosave({
      triggers: ["interval"],
      filters: ["changed"],
      conditions: ["changed"],
      methods: ["ajax"]
    });

This will AJAX post form field data every 30 seconds, filtering the dataset down to only fields
whose form value has changed since the last autosave, and only saving if at least one form field value
has changed since the last autosave attempt.

## Requirements

jQuery.autosave required jQuery version 1.3 or higher.

## Compatibility

Verified to work correctly on Internet Explorer 6.0+, Firefox 3.0+ and Chrome 7.0+

## Contributers

* [Kyle Florence](https://github.com/kflorence/)
* [Raymond Julin](https://github.com/nervetattoo/)
* Mads Erik Forberg
