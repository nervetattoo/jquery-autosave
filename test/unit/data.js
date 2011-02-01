module("Data");

test("SerializeArray", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    save: {
      scope: "changed",
      condition: function(options, $fields, formData) {
        var data = [{ name: "text", value: "test" }];

        deepEqual(formData, data, "SerializeArray data matches correctly");

        return false;
      }
    }
  });

  $form.find(":input[type=text]").val("test").change();
});

test("SerializeObject", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    save: {
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
