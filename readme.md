# jQuery.autosave

    $("form").autosave({...});

The jQuery.autosave plugin automatically and unobtrusively saves form data based on a set of critera. Saving can be broken down into a simple five step process:

1. A trigger callback begins the saving process.
2. The scope of form inputs is narrowed appropriately.
3. A dataset is created using those inputs.
4. The current state of the plugin is tested against a series of conditions.
5. If those conditions pass, we save the data using any number of methods.

This plugin works strictly with forms and form inputs of any type. Any other elements fed to the plugin will be ignored. Currently, if you wish to autosave data on a per form basis, you should attach a separate instance of the plugin to each form.

**Note**: the actual autosave instance (which is stored using jQuery's [.data()](http://api.jquery.com/data/) function) is only attached to **form elements**, even if those element weren't passed in directly.

## Options

    {
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
      },
      classes: {
        changed: "changed",
		modified: "modified",
        ignore: "ignore"
      }
    }

Options is a set of key/value pairs that can be passed into the plugin as the first argument upon initialization. The default values are shown above.

* **namespace** _String_  
  The namespace to append after event names and before class names that are used within the plugin. This will also be the key name for the autosave instance stored in each element's expando data.
* **callbacks** _Object_  
  Contains a set of key/value pairs that define callback methods for the autosave process described above.
  * **trigger** _String, Object, Array, function_  
    The callback method(s) that will start the saving process.
  * **scope** _String, Object, Array, function, Boolean_  
    The callback method(s) that will determine the scope of inputs from which to gather data.
  * **data** _String, Object, Array, function, Boolean_  
    The callback method(s) that will determine how to build the dataset from the inputs.
  * **condition** _String, Object, Array, function, Boolean_  
    The callback method(s) that will determine whether or not to save based on the current state of the plugin.
  * **save** _String, Object, Array, function_  
    The callback method(s) that will determine how the data will be saved.
* **events** _Object_  
  Contains a set of key/value pairs that allow you to change the name of events used within the plugin. Keep in mind that these events will be namespaced on initialization like: "eventName.namespace"
  * **save** _String_  
    This event will attempt to save anytime it is fired. It is bound to each form passed into the plugin on initialization.
  * **saved** _String_  
    This event is triggered on each form whenever autosave finishes saving form data. It can be bound to if you need to be notified after saving is completed.
  * **changed** _String_  
    This event is triggered whenever an input value changes ("change" event is fired) on the form containing that input. It can be bound to if you need to be notified whenever an input value changes.
  * **modified** _String_  
    This event is triggered whenever an input value is modified ("keyup" event is fired) on the form containing that input. It can be bound to if you need to be notified whenever an input value is modified.
* **classes** _Object_  
  Contains a set of key/value pairs that allow yout o chang the name of classes used within the plugin. Keep in mind that these classes will be namespaced on initialization like: "namespace-className"
  * **changed** _String_  
    The class name that will be applied to elements whose value has been changed but not yet saved.
  * **changed** _String_  
    The class name that will be applied to elements whose value has been modified but not yet saved.
  * **ignore** _String_  
    Inputs with this class name will be ignored by the plugin when gathering data.

## Default Behavior

    $("form").autosave();

If you use this plugin as is (without providing any options), this is what you can expect.

1. **trigger** An autosave is triggered any time an input value changes.
2. **scope** The scope of inputs is narrowed to include only those whose value has changed since the last autosave.
3. **data** Data is gathered using jQuery's [.serialize()](http://api.jquery.com/serialize/) function.
4. **condition** There are no conditions that need to pass to complete this save.
5. **save** The data is posted to the current browser URL using the [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/) function.

## Callbacks

Several of the properties above are composed of **callback methods**. These methods are invoked by the plugin during the autosave process. If an Array of methods is found, they will be invoked in the order they were defined in the Array. Any of the following are valid ways of defining a callback method:

* **"callbackMethod"** _String_, **{ method: "callbackMethod"[, options: {}] }** _Object_  
  Calls a built-in callback method, optionally passing an options object to merge with the default options as defined in the plugin.
* **function() {}** _function_, **{ method: function() {}[, options: {}] }** _Object_  
  Calls a custom, user-defined callback method, optionally passing an options object into that function.

You may also define multiple callback methods for any property by simply putting them into an array.

## Built-in Callbacks

There are several built-in callback methods that provide you an easy way to set up the most common saving processes. The names of these methods are detailed below along with the arguments that will be passed in when the methods are invoked. Every callback method is called with the current instance as the context of the keyword _this_ making it easy to call any class property or function from within the callback method.

---

### Triggers

    trigger([options]);

#### Methods

The built-in callback methods for triggering an autosave.

* **change**  
  Attempts to save any time an input value changes.
* **modify**  
  Attempts to save any time an input value is modified.
* **interval**  
  Creates an interval loop that will attempt to save periodically.

#### Arguments

These are the arguments that are passed to triggering callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.

#### Return Value

Trigger methods do not require a return value.

---

### Scope

    scope(options, $inputs);

#### Methods

The built-in callback methods for narrowing the scope of inputs we will gather data from.

* **all**  
  Uses all valid form inputs (those that aren't ignored).
* **changed**  
  Filters inputs down to only those that have had their value changed since the last autosave.
* **modified**  
  Filters inputs down to only those that have had their value modified since the last autosave.  

#### Arguments

These are the arguments that are passed to scoping callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$inputs** _jQuery_  
  A jQuery object containing the current scope of inputs.

#### Return Value

Scope methods should **return a jQuery object** containing the filtered inputs.

---

### Data

    data(options, $inputs, data);

#### Methods

The built-in callback methods for generating data from the inputs.

* **serializeObject**  
  Encodes a set of form elements as an object of names and values using Ben Alman's [.serializeObject()](http://benalman.com/projects/jquery-misc-plugins/#serializeobject) function.

#### Arguments

These are the arguments that are passed to scoping callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$inputs** _jQuery_  
  A jQuery object containing the current scope of inputs.
* **data** _String, Object, Array_  
  Any data that has already been created from the inputs.

#### Return Value

Data methods should **return some kind of dataset**, most likely containing the values from the inputs.

---

### Conditions

    condition(options, $inputs, formData[, caller]);

#### Methods

The built-in callback methods for determining whether or not to save.

* **changed**  
  Only save if at least one input value has changed since the last autosave.
* **modified**  
  Only save if at least one input value has been modified since the last autosave.
* **interval**  
  Only save on intervals. If anything else triggers an autosave, it will wait until the next interval to save.

#### Arguments

These are the arguments that are passed to conditional callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$inputs** _jQuery_  
  A jQuery object containing the current scope of inputs. The inputs given here have already been filtered.
* **data** _Array_  
  An array of objects containing the data gathered from the inputs.
* **caller** _String, Number_  
  Used to denote who called the save method. This is generally undefined, but may contain the ID of the current interval timer or an event name.

#### Return Value

Condition methods should **return a Boolean value (true or false)**. Returning any _non-false_ value is treated the same as returning _true_.

---

### Save

    method(options, data);

#### Methods

The built-in callback methods for determining how to save the input data.

* **ajax**  
  Will save the data using the [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/) function.

#### Arguments

These are the arguments that are passed to saving callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method. Everything supported by the [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/) function is supported here. Additionally, you may pass a function to the `options.data` parameter to allow your callback method to take dynamically generated data (new data will be gathered upon every save attempt).
* **data** _Object_  
  The data gathered from the inputs.

#### Return value

Saving methods do not require a return value. However, **if your callback method contains asynchronous code, such as an AJAX request, it must return false** and contain a call to the function _this.next("save")_ internally. The function _this.next("save")_ tells the plugin the "save" callback has finished executing, allowing it to execute the next save method or perform necessary cleanup if there are no save methods left to execute.

## Events

    event(event[, ...]);

For convenience, the plugin automatically binds or fires events on certain elements under certain circumstances. These events are listed below. Some of these events need to be triggered using jQuery's [.triggerHandler()](http://api.jquery.com/triggerHandler/) function on the element the event is bound to. Other events will be fired automatically and may be caught and handled using jQuery's [.bind()](http://api.jquery.com/bind/) function on the element firing the event. The jQuery [Event Object](http://api.jquery.com/category/events/event-object/) will **always** be the first argument passed to handler methods. Also, keep in mind that these events will be [namespaced](http://docs.jquery.com/Namespaced_Events) according to the _namespace_ option above ("autosave" by default).

### Save

    save(event, $inputs);

When triggered, this event will attempt to save form data.

#### Elements

This event is bound to each form autosave is attached to.

#### Arguments

* **$inputs** _jQuery|Element|Element[]_  
  The inputs to save. All inputs will be used by default.

---

### Saved

    saved(event);

Triggered whenever autosave finishes saving form data.

#### Elements

This event is fired for each form autosave is attached to.

#### Arguments

* **event** _Object_  
  The jQuery.Event object.

---

### Changed

    changed(event, input);

Triggered whenever an input value changes ("change" event is fired).

#### Elements

This event is fired on the form containing the input.

#### Arguments

* **event** _Object_  
  The jQuery.Event object.
* **input** _Element_  
  The DOM element that triggered the event.

---

### Modified

    modified(event, input);

Triggered whenever an input value is modified ("keyup" event is fired).

#### Elements

This event is fired on the form containing the input.

#### Arguments

* **event** _Object_  
  The jQuery.Event object.
* **input** _Element_  
  The DOM element that triggered the event.

## Requirements

jQuery.autosave requires:

* jQuery version 1.4.0+ (recommended)
* jQuery version 1.2.3+ (see note below)

**Note**: There are several bugs in the [jQuery.extend](http://api.jquery.com/jQuery.extend/) function that will cause unexpected behavior in jQuery versions 1.3.2 and below. To make autosave fully compatible with jQuery versions 1.2.3 through 1.3.2, you should include the [jquery.extend-patch.js](https://github.com/kflorence/misc-js/blob/master/jquery/patches/jquery.extend-patch.js) file _before_ initializing the plugin. This file will add additional functionality to jQuery core and fix the extend method for you. Please be advised that this patch should only be used as a last resort. **If at all possible, please upgrade to jQuery version 1.4 or higher.**

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
jQuery.autosave is dual licensed under the BSD and MIT licenses.