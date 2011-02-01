module("Scope");

test("All", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    save: {
      condition: function(options, $fields) {
        equal($fields.length, this.getValidFields().length, "Using all fields");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

test("Changed", function() {
  expect(2);

  var $form = $("#testForm1").autosave({
    save: {
      scope: "changed",
      condition: function(options, $fields) {
        equal($fields.length, 1, "One changed field");
        equal($fields[0].name, "text", "Changed field was the text input");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});
