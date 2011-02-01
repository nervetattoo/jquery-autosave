module("Condition");

test("Changed", function() {
  expect(1);

  var $form = $("#testForm1").autosave({
    save: {
      trigger: "change",
      condition: "changed",
      method: function() {
        ok(true, "Only save if there is changed data");
      }
    }
  });

  $form.find(":input[name=save]").click();
  $form.find(":input[type=text]").val("test").change();
});
