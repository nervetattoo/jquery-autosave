# jQuery.autosave

    $("form").autosave({...});

The jQuery.autosave plugin automatically and unobtrusively saves form field data based on a set of critera. Saving can be broken down into a simple five step process:

1. An event triggers the autosave process.
2. The scope of form fields is narrowed to those that are needed.
3. The data from those form fields is extracted and stored for later use.
4. The current state of the plugin is tested against a series of conditions.
5. If these conditions pass, we save the data using any number of methods.

This plugin works strictly with forms and form fields of any type. Any other elements fed to the plugin will be ignored. Currently, if you wish to autosave data on a per form basis, you should attach a separate instance of the plugin to each form.

**Note**: the actual autosave instance (which is stored using jQuery's [.data()](http://api.jquery.com/data/) function) is only attached to **form elements**, even if those element weren't passed in directly.

## Options

    {
      namespace: "autosave",
      save: {
        trigger: "change",
        scope: false,
        data: false,
        condition: false,
        method: "ajax"
      },
      events: {
        save: "save",
        saved: "saved"
      },
      classes: {
        changed: "changed",
        ignore: "ignore"
      }
    }

Options is a set of key/value pairs that can be passed into the plugin as the first argument upon initialization. The default values are shown above.

* **namespace** _String_  
  The namespace to append after event names and before class names that are used within the plugin.
* **save** _Object_  
  Contains a set of key/value pairs that define callback methods for the autosave process described above.
  * **trigger** _String, Object, Array, function_  
    The callback method(s) that will start the saving process. The built-in callback method "change" will be used by default.
  * **scope** _String, Object, Array, function, Boolean_  
    The callback method(s) that will determine the scope of form fields to gather data from. The built-in callback method "changed" will be used by default.
  * **data** _String, Object, Array, function, Boolean_  
    The callback method(s) that will determine how to build the dataset from the form fields. jQuery's [.serializeArray()](http://api.jquery.com/serializeArray/) function is used by default.
  * **condition** _String, Object, Array, function, Boolean_  
    The callback method(s) that will determine whether or not save based on the current state of the plugin. No conditions need to pass in order to save, by default.
  * **method** _String, Object, Array, function_  
    The callback method(s) that will determine how the form field data will be saved. The built-in callback method "ajax" will be used by default.
* **events** _Object_  
  Contains a set of key/value pairs that allow you to change the name of events used within the plugin. Keep in mind that these events will be namespaced on initialization like: "eventName.namespace"
  * **save** _String_  
    This event will attempt to save anytime it is fired. It is bound to each form passed into the plugin on initialization.
  * **saved** _String_  
    This event is triggered on each form whenever autosave finishes saving form data. It can be bound to if you need to be notified after saving is completed.
* **classes** _Object_  
  Contains a set of key/value pairs that allow yout o chang the name of classes used within the plugin. Keep in mind that these classes will be namespaced on initialization like: "namespace-className"
  * **changed** _String_  
    The class name that will be applied to elements whose value has been changed but not yet saved.
  * **ignore** _String_  
    Fields with this class name will be ignored by the plugin when gathering data.

## Callback Methods

Several of the properties above are composed of **callback methods**. These methods are invoked by the plugin during the autosave process. If an Array of methods is found, they will be invoked in the order they were defined in the Array. Any of the following are valid ways of defining a callback method:

* **"callbackMethod"** _String_, **{ method: "callbackMethod"[, options: {}] }** _Object_  
  Calls a built-in callback method, optionally passing an options object to merge with the default options as defined in the plugin.
* **function() {}** _function_, **{ method: function() {}[, options: {}] }** _Object_  
  Calls a custom, user-defined callback method, optionally passing an options object into that function.

You may also define multiple callback methods for any property by simply putting them into an array.

## Built-in Callback Methods

There are several built-in callback methods that provide you an easy way to set up the most common saving processes. The names of these methods are detailed below along with the arguments that will be passed in when the methods are invoked. Every callback method is called with the current instance as the context of the keyword _this_ making it easy to call any class property or function from within the callback method.

---

### save.trigger

    trigger([options]);

#### Methods

The built-in callback methods for triggering an autosave.

* **change**  
  Attempts to save any time a form field value changes.
* **event**  
  Attemps to save any time an event occurs on some element.
* **interval**  
  Creates an interval loop that will attempt to save periodically.

#### Arguments

These are the arguments that are passed to triggering callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.

#### Return Value

Trigger methods do not require a return value.

---

### save.scope

    scope(options, $fields);

#### Methods

The built-in callback methods for narrowing the scope of form fields.

* **changed**  
  Filters fields down to only those that have had their value changed since the last autosave.

#### Arguments

These are the arguments that are passed to scoping callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$fields** _jQuery_  
  A jQuery object containing the current scope of form fields. Generally, this is either a single form field whose value has changed, or all of the fields detected by the plugin on initialization. Keep in mind that filter callback methods change the current scope of fields, meaning further callback methods will be given the new set of fields to filter on.

#### Return Value

Scope methods should **return a jQuery object** containing the filtered fields.

---

### save.data

    data(options, $fields, data);

#### Methods

The built-in callback methods for generating data from the form fields.

* **serializeObject**  
  Encodes a set of form elements as an object of names and values using Ben Alman's [.serializeObject()](http://benalman.com/projects/jquery-misc-plugins/#serializeobject) function.

#### Arguments

These are the arguments that are passed to scoping callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$fields** _jQuery_  
  A jQuery object containing the current scope of form fields.
* **data** _String, Object, Array_  
  Any data that has already been created from the form fields.

#### Return Value

Data methods should **return some kind of dataset**, most likely containing the values from the form fields.

---

### save.condition

    condition(options, $fields, data[, caller]);

#### Methods

The built-in callback methods for determining whether or not to save.

* **changed**  
  Only save if at least one form field value has changed since the last autosave.
* **interval**  
  Only save on intervals. If anything else triggers an autosave, it will fail.

#### Arguments

These are the arguments that are passed to conditional callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$fields** _jQuery_  
  A jQuery object containing the current scope of form fields. The fields given here have already been filtered.
* **data** _Array_  
  An array of objects containing the data gathered from the form fields.
* **caller** _String, Number_  
  Used to denote who called the save method. This is generally undefined, but may contain the ID of the current interval timer or an event name.

#### Return Value

Condition methods should **return a Boolean value (true or false)**. Returning any _non-false_ value is treated the same as returning _true_.

---

### save.method

    method(options, data);

#### Methods

The built-in callback methods for determining how to save the form field data.

* **ajax**  
  Will save the data using the [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/) function.

#### Arguments

These are the arguments that are passed to saving callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **data** _Object_  
  The data gathered from the form fields.

#### Return value

Saving methods do not require a return value. However, **if your callback method contains asynchronous code, such as an AJAX request, it must return false** and contain a call to the function _this.complete()_ internally. The function _this.complete()_ tells the plugin the save method has finished executing, allowing it to execute the next save method or perform necessary cleanup if there are no save methods left to execute.

## Events

    event(event[, ...]);

Any custom events that have been defined in the plugin are listed below.

### events.save

When triggered, this event will attempt to save form field data for a specific form. You can trigger this event using jQuery's [.triggerHandler()](http://api.jquery.com/triggerHandler/) function on any form autosave is bound to.

---

### events.saved

This event is triggered on each form whenever autosave finishes saving form data. It can be bound to using jQuery's [.bind()](http://api.jquery.com/bind/) function if you need to be notified after saving is completed.

## Examples

### Default behavior

    $("form").autosave();

1. **trigger** An autosave is triggered any time a form field value changes.
2. **scope** The scope is narrowed to include only the field whose value has changed.
3. **data** Data is gathered using jQuery's [.serializeArray()](http://api.jquery.com/serializeArray/) function.
4. **condition** There are no conditions that need to pass to complete this save.
5. **method** The data is posted to the current browser URL using the [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/) function.

## Requirements

jQuery.autosave requires:

* jQuery version 1.3+

## Compatibility

Verified to work correctly on:

* Chrome 7.0+
* Firefox 3.0+
* Internet Explorer 6.0+

## Credits

Written by [Kyle Florence](https://github.com/kflorence/).  
Inspired by the jQuery.autosave plugin written by [Raymond Julin](https://github.com/nervetattoo/), Mads Erik Forberg and Simen Graaten.

## License

Copyright (C) 2011  
Kyle Florence, Raymond Julin, Mads Erik Forberg and Simen Graaten.  
The jQuery.autosave is dual licensed under the MIT and BSD licenses.

