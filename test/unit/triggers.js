module("triggers");

test("Default behavior", function() {
  expect(4);

  var $form = $("#testForm1").autosave();
  var form = $form.data("autosave");

  $form.ajaxComplete(function(event, xhr, options) {
    ok(true, "Default autosave method 'ajax' is invoked successfully");
    equal(options.data, "text=test", "Form field 'text' has value 'test'");
    equal(options.type, "POST", "Default ajax type is POST");
    equal(options.url, window.location.href, "Default ajax URL is current browser URL");

    start();
  });

  stop();

  $form.find(":input[type=text]").val("test").change();
});
