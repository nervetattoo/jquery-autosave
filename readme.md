# [jQuery.autosave](http://kflorence.github.com/jquery-autosave/)

    $("form").autosave();

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
    This event is triggered whenever an input value is modified ("input" or "keyup" event is fired) on the form containing that input. It can be bound to if you need to be notified whenever an input value is modified.

## Default Behavior

    $("form").autosave();

If you use this plugin as is (without providing any options), this is what you can expect.

1. **trigger** An autosave is triggered any time an input value changes.
2. **scope** Due to the `change` default trigger, the scope of inputs is narrowed to include only those whose value has changed since the last autosave.
3. **data** Data is gathered using jQuery's [.serialize()](http://api.jquery.com/serialize/) function.
4. **condition** There are no conditions that need to pass to complete this save.
5. **save** The data is sent to the current browser URL using the [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/) function.

## Callbacks

Callback methods are invoked by the plugin during the autosave process. There are several built-in callback methods that provide you an easy way to set up the most common saving processes, but you can also write your own.

    $("form").autosave({

		// In all of these cases, "callbackName" refers to any of the callback
		// options outlined above (trigger, scope, data, condition, save).
	    callbacks: {
		    // The simplest way to use a built-in callback is to pass in the
			// method name as a string. Default callback options will be used.
		    callbackName: "callbackMethod",
    
			// You may also pass in the method name as a string and provide
			// custom options by using an object.
			callbackName: {
			    method: "callbackMethod",
				options: {
				    // ...
				}
			},
    
	        // An array of callbacks may also be provided.
			callbackName: [
			    "callbackMethod1",
				{
				    method: "callbackMethod2",
					options: {
					    // ...
					}
				}
			],
    
	        // The simplest way to use a custom callback method is to pass
			// in a function. The arguments provided to this function vary
			// depending on the callback used.
			callbackName: function() {
			    // ...
			},
    
	        // You may also pass in the method and custom options by using
			// an object.
			callbackName: {
			    method: function(options) {
				    // ...
				},
				options: {
				   // ...
				}
            }
		}
	});

The names of these methods are detailed below along with the arguments that will be passed in when the methods are invoked. If an Array of callback methods is provided, they will be invoked in the order they were defined in the Array. Every callback method is called with the current instance as the context of the keyword _this_ making it easy to call any class property or function from within the callback method.

---

### Triggers

    $("form").autosave({
	    callbacks: {
			trigger: function(options) {
				// ...
			}
		}
	});

#### Methods

The built-in callback methods for triggering an autosave.

* **change**  
  Attempts to save any time an input value changes.
* **modify**  
  Attempts to save any time an input value is modified.
* **interval**  
  Creates an interval loop that will attempt to save periodically.

#### Arguments

These are the arguments that are passed to trigger callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.

#### Return Value

Trigger methods do not require a return value.

---

### Scope

    $("form").autosave({
	    callbacks: {
			scope: function(options, $inputs) {
				// ...
                // Must return a jQuery Object.
	            return $inputs;
			}
		}
	});

#### Methods

The built-in callback methods for narrowing the scope of inputs we will gather data from.

* **all**  
  Uses all valid form inputs
* **changed**  
  Filters inputs down to only those that have had their value changed since the last autosave.
* **modified**  
  Filters inputs down to only those that have had their value modified since the last autosave.  

#### Arguments

These are the arguments that are passed to scope callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$inputs** _jQuery_  
  A jQuery object containing the current scope of inputs.

#### Return Value

Scope methods should **return a jQuery object** containing the filtered inputs.

---

### Data

    $("form").autosave({
	    callbacks: {
			data: function(options, $inputs, formData) {
				// ...
                // Must return some kind of dataset.
	            return formData;
			}
		}
	});

#### Methods

The built-in callback methods for generating data from the inputs.

* **serialize**  
  Serializes a set of form elements as a String using jQuery's [.serialize()](http://api.jquery.com/serialize/) function.
* **serializeArray**  
  Serializes a set of form elements as an Array using jQuery's [.serializeArray()](http://api.jquery.com/serializeArray/) function.
* **serializeObject**  
  Serializes a set of form elements as an Object of names and values using Ben Alman's [.serializeObject()](http://benalman.com/projects/jquery-misc-plugins/#serializeobject) function.

#### Arguments

These are the arguments that are passed to data callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$inputs** _jQuery_  
  A jQuery object containing the current scope of inputs.
* **formData** _String, Object, Array_  
  Any data that has already been generated from previous data methods, or undefined if none have been called.

#### Return Value

Data methods should **return some kind of dataset**, most likely containing the values from the inputs.

---

### Conditions

    $("form").autosave({
	    callbacks: {
			condition: function(options, $inputs, formData, caller) {
				// ...
                // Should return a boolean value.
				// Returning boolean 'false' will cancel the save.
	            return false;
			}
		}
	});

#### Methods

The built-in callback methods for determining whether or not to save.

* **changed**  
  Only save if at least one input value has changed since the last autosave.
* **modified**  
  Only save if at least one input value has been modified since the last autosave.
* **interval**  
  Only save on intervals. If anything else triggers an autosave, it will wait until the next interval to save.

#### Arguments

These are the arguments that are passed to condition callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method.
* **$inputs** _jQuery_  
  A jQuery object containing the current scope of inputs. The inputs given here have already been filtered.
* **formData** _String, Array, Object_  
  The data gathered from the scoped form elements and returned from the data callback method.
* **caller** _String, Number_  
  Used to denote who called the save method. This is generally undefined, but may contain the ID of the current interval timer or an event name.

#### Return Value

Condition methods should **return a Boolean value (true or false)**. Returning any _non-false_ value is treated the same as returning _true_.

---

### Save

    $("form").autosave({
	    callbacks: {
			save: function(options, formData) {
				// ...
				// If your save function contains asynchronous code,
				// you should return a Boolean 'false' here and call
				// this.next("save") when your method has finished.
	            return false;
			}
		}
	});

#### Methods

The built-in callback methods for determining how to save the input data.

* **ajax**  
  Will save the data using the [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/) function.

#### Arguments

These are the arguments that are passed to save callback methods.

* **options** _Object_  
  An object of key/value pairs that may be used to configure the callback method. Everything supported by the [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/) function is supported here. Additionally, you may pass a function to the `options.data` parameter to allow your callback method to take dynamically generated data (new data will be gathered upon every save attempt).
* **formData** _Object_  
  The data gathered from the scoped form elements and returned from the data callback method.

#### Return value

Saving methods do not require a return value. However, **if your callback method contains asynchronous code, such as an AJAX request, it must return false** and contain a call to the function _this.next("save")_ internally. The function _this.next("save")_ tells the plugin the "save" callback has finished executing, allowing it to execute the next save method or perform necessary cleanup if there are no save methods left to execute.

## Events

For convenience, the plugin automatically binds or fires events on certain elements under certain circumstances. These events are listed below. Some of these events need to be triggered using jQuery's [.triggerHandler()](http://api.jquery.com/triggerHandler/) function on the element the event is bound to. Other events will be fired automatically and may be caught and handled using jQuery's [.bind()](http://api.jquery.com/bind/) function on the element firing the event. The jQuery [Event Object](http://api.jquery.com/category/events/event-object/) will **always** be the first argument passed to handler methods. Also, keep in mind that these events will be [namespaced](http://docs.jquery.com/Namespaced_Events) according to the _namespace_ option above ("autosave" by default).

### Save

    $("form").autosave().bind("save", function(event, $inputs) {
	    // ...
	}).triggerHandler("save");

When triggered, this event will attempt to save form data.

#### Elements

This event is bound to each form autosave is attached to.

#### Arguments

* **$inputs** _jQuery|Element|Element[]_  
  The inputs to save. All inputs will be used by default.

---

### Saved

    $("form").autosave().bind("saved", function(event) {
	    // ...
	});

Triggered whenever autosave finishes saving form data.

#### Elements

This event is fired for each form autosave is attached to.

#### Arguments

* **event** _Object_  
  The jQuery.Event object.

---

### Changed

    $("form").autosave().bind("changed", function(event, input) {
	    // ...
	});

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

    $("form").autosave().bind("modified", function(event, input) {
	    // ...
	});

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

* jQuery version 1.4.3+

## Compatibility

Verified to work correctly on:

* Chrome 7.0+
* Firefox 3.0+
* Internet Explorer 6.0+

## Credits

Written by [Kyle Florence](https://github.com/kflorence/) and [other contributers](https://github.com/nervetattoo/jquery-autosave/graphs/contributors).
Inspired by the jQuery.autosave plugin written by [Raymond Julin](https://github.com/nervetattoo/), Mads Erik Forberg and Simen Graaten.

## License

Copyright (C) 2012  
Kyle Florence, Raymond Julin, Mads Erik Forberg and Simen Graaten.  
jQuery.autosave is dual licensed under the BSD and MIT licenses.
