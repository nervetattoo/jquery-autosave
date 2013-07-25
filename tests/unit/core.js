module("Core");

test("Requirements", function() {
  expect(2);

  ok(jQuery, "jQuery exists");
  ok($, "$ exists");
});

test("Constructor", function() {
  expect(20);

  var $test1 = $("#testForm1").autosave();
  var instance1 = $test1.data("autosave");

  equal(typeof instance1, "object", "$test1 contains an autosave instance");
  equal(instance1.forms().length, 1, "$test1 includes one form element");
  equal(instance1.inputs().length, 12, "$test1 includes twelve form input elements");

  // "trigger" "scope" "data" "conditions" "save"
  $.each(instance1.options.callbacks, function(name, value) {
    equal($.isArray(value), true, "instance1 callbacks." + name + " is an array");

    $.each(value, function(i, callback) {
      equal(typeof callback, "object", "instance1 callbacks." + name + "[" + i + "] is an object");
      equal($.isFunction(callback.method), true, "instance1 callbacks." + name + "[" + i + "].method is a function");
    });
  });

  var $test2 = $("#testForm1").autosave({
    callbacks: {
      scope: ["all", "changed"]
    }
  });

  var instance2 = $test2.data("autosave");

  equal(instance2.options.callbacks.scope.length, 2, "instance2 contains multiple scope callbacks");

  var $test3 = $("#testForm1").autosave();
  var instance3 = $test3.data("autosave");

  equal(typeof instance3, "object", "instance3 contains an autosave instance");
  deepEqual(instance3, instance1, "instance3 refers to the same autosave instance as instance1");

  var $test4 = $("#testForm1 :input").autosave();
  var instance4 = $test4.data("autosave");

  notDeepEqual(instance4, instance3, "instance4 does not refer to the same autosave instance as instance3");

  var $test5 = $("#invalidElement1").autosave();
  var instance5 = $test5.data("autosave");

  equal(instance5, undefined, "instance5 does not exist");

  var $test6 = $("#invalidElement2").autosave();
  var instance6 = $test6.data("autosave");

  equal(instance6, undefined, "instance6 does not exist");
});

// https://github.com/nervetattoo/jquery-autosave/issues/10
test("Select list value", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
	callbacks: {
      scope: "changed",
      data: ["serialize", function(options, $inputs, data) {
        equal(data, "select=1", "select list has value of 1");
      }]
    }
  });

  $form.find("select[name=select]").val("1").change();
});
