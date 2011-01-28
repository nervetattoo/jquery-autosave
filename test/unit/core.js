module("core");

test("Requirements", function() {
  expect(2);

  ok(jQuery, "jQuery exists");
  ok($, "$ exists");
});

test("Constructor", function() {
  expect(18);

  var $test1 = $("#testForm1").autosave();
  var test1 = $test1.data("autosave");

  equal(typeof test1, "object", "test1 contains an autosave instance");
  equal(test1.$forms.length, 1, "test1 includes one form element");
  equal(test1.$fields.length, 11, "test1 includes eleven form input elements");

  var test1events = test1.$fields.data("events");

  ok(test1events.change || test1events.propertychange, "test1 is listening for changes to form fields");

  $.each(test1.callbacks, function(name, value) {
    equal($.isArray(value), true, "test1 callbacks." + name + " is an array");

    $.each(value, function(i, callback) {
      equal(typeof callback, "object", "test1 callbacks." + name + "[" + i + "] is an object");
      equal($.isFunction(callback.method), true, "test1 callbacks." + name + "[" + i + "].method is a function");
    });
  });

  var $test2 = $("#testForm1").autosave();
  var test2 = $test2.data("autosave");

  equal(typeof test2, "object", "test2 contains an autosave instance");
  deepEqual(test2, test1, "test2 refers to the same autosave instance as test1");

  var $test3 = $("#testForm1 :input").autosave();
  var test3 = $test3.data("autosave");

  notDeepEqual(test3, test2, "test3 does not refer to the same autosave instance as test2");

  var $test4 = $("#invalidElement1").autosave();
  var test4 = $test4.data("autosave");

  equal(test4, undefined, "test4 does not contain an autosave instance");

  var $test5 = $("#invalidElement2").autosave();
  var test5 = $test5.data("autosave");

  equal(test5, undefined, "test5 does not contain an autosave instance");
});
