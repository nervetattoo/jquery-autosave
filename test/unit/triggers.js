module("Triggers");

test("Change", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    save: {
      trigger: "change",
      condition: function() {
        ok(true, "Trigger 'change' fired successfully");
        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

test("Event", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    save: {
      trigger: "event",
      condition: function() {
        ok(true, "Trigger 'event' fired successfully");

        return false;
      }
    }
  });

  $form.find(":input[name=save]").click();
});

asyncTest("Interval", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    save: {
      trigger: {
        method: "interval",
        options: {
          interval: 10
        }
      },
      condition: function(options, $fields, formData, caller) {
        equal(caller, this.timer, "Trigger 'interval' fired successfully");

        this.stopInterval();
        start();

        return false;
      }
    }
  });
});

