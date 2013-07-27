module("Callbacks");

/**
 * Trigger callbacks
 */

test("Trigger/Change", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      trigger: "change",
      save: function() {
        ok(true, "Trigger 'change' fired successfully");
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

test("Trigger/Modified", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      trigger: "modify",
      save: function() {
        ok(true, "Trigger 'change' fired successfully");
      }
    }
  });

  $form.find(":input[type=text]").val("t").keyup().trigger("input");
});

asyncTest("Trigger/Interval", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      trigger: {
        method: "interval",
        options: {
          interval: 10
        }
      },
      condition: function(options, $input, formData, caller) {
        equal(caller, this.timer, "Trigger 'interval' fired successfully");

        this.stopInterval();
        start();

        return false;
      }
    }
  });
});

/**
 * Scope callbacks
 */

test("Scope/All", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      scope: "all",
      condition: function(options, $inputs) {
        equal($inputs.length, this.validInputs().length, "Using all valid inputs");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

test("Scope/Changed", function() {
  expect(2);

  var $form = $("#testForm1").autosave({
    callbacks: {
      scope: "changed",
      condition: function(options, $inputs) {
        equal($inputs.length, 1, "One changed input");
        equal($inputs[0].name, "text", "Changed input's name is 'text'");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

test("Scope/Modified", function() {
  expect(2);

  var $form = $("#testForm1").autosave({
    callbacks: {
      trigger: "modify",
      scope: "modified",
      condition: function(options, $inputs) {
        equal($inputs.length, 1, "One changed input");
        equal($inputs[0].name, "text", "Changed input's name is 'text'");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("t").keyup().trigger('input');
});

/**
 * Data callbacks
 */

test("Data/Serialize (Default)", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      scope: "changed",
      condition: function(options, $fields, formData) {
        var data = "text=test";

        deepEqual(formData, data, "SerializeArray data matches correctly");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

test("Data/SerializeArray", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      scope: "changed",
      data: "serializeArray",
      condition: function(options, $fields, formData) {
        var data = [{ name: "text", value: "test" }];

        deepEqual(formData, data, "SerializeArray data matches correctly");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

test("Data/SerializeObject", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      scope: "changed",
      data: "serializeObject",
      condition: function(options, $fields, formData) {
        var data = { text: "test" };

        deepEqual(formData, data, "SerializeObject data matches correctly");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

/**
 * Condition callbacks
 */

test("Condition/Changed", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      condition: "changed",
      save: function() {
        ok(true, "Only save if there is changed data");
      }
    }
  });

  $form.find(":input[name=save]").click();
  $form.find(":input[type=text]").val("test").change();
});

test("Condition/Modified", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    callbacks: {
      trigger: "modify",
      condition: "modified",
      save: function() {
        ok(true, "Only save if there is modified data");
      }
    }
  });

  $form.find(":input[name=save]").click();
  $form.find(":input[type=text]").val("t").keyup().trigger('input');
});

/**
 * Save callbacks
 */

asyncTest("Save/AJAX/Serialize", function() {
  expect(2);

  var num = 0;

  $("#testForm1").autosave({
    callbacks: {
      save: {
        method: "ajax",
        options: {
          data: function() {
            return "number=" + ++num;
          },
          beforeSend: function(xhr, settings) {
            var qs = settings.url.split('?')[1];
            equal( qs, "text=test&number=1", "Data merged successfully" );
          },
          complete: function() {
            ok(done = true, "AJAX save completed successfully");
            start();
          }
        }
      }
    }
  }).find(":input[type=text]").val("test").change();
});

asyncTest("Save/AJAX/SerializeArray", function() {
  expect(2);

  var num = 0;

  $("#testForm1").autosave({
    callbacks: {
      data: "serializeArray",
      save: {
        method: "ajax",
        options: {
          data: function() {
            return [{ name: "number", value: ++num }];
          },
          beforeSend: function(xhr, settings) {
            var qs = settings.url.split('?')[1];
            equal( qs, "text=test&number=1", "Data merged successfully" );
          },
          complete: function(xhr, status) {
            ok(done = true, "AJAX save completed successfully");
            start();
          }
        }
      }
    }
  }).find(":input[type=text]").val("test").change();
});

asyncTest("Save/AJAX/SerializeObject", function() {
  expect(2);

  var num = 0;

  $("#testForm1").autosave({
    callbacks: {
      data: "serializeObject",
      save: {
        method: "ajax",
        options: {
          data: function() {
            return { number: ++num };
          },
          beforeSend: function(xhr, settings) {
            var qs = settings.url.split('?')[1];
            equal( qs, "text=test&number=1", "Data merged successfully" );
          },
          complete: function(xhr, status) {
            ok(done = true, "AJAX save completed successfully");
            start();
          }
        }
      }
    }
  }).find(":input[type=text]").val("test").change();
});

asyncTest("Save/AJAX Mismatched data types", function() {
  expect(1);

  var num = 0;

  try {
    $("#testForm1").autosave({
      callbacks: {
        save: {
          method: "ajax",
          options: {
            data: function() {
              return []; // should be string
            }
          }
        }
      }
    }).find(":input[type=text]").val("test").change();
  } catch( e ) {
    ok(true, "Exception thrown: " + e);
  } finally {
    start();
  }
});

asyncTest("Save/AJAX - No options.data", function() {
  expect(2);

  $("#testForm1").autosave({
    callbacks: {
      save: {
        method: "ajax",
        options: {
          beforeSend: function(xhr, settings) {
            var qs = settings.url.split('?')[1];
            equal( qs, "text=test", "Data merged successfully" );
          },
          complete: function(xhr, status) {
            ok(done = true, "AJAX save completed successfully");
            start();
          }
        }
      }
    }
  }).find(":input[type=text]").val("test").change();
});
