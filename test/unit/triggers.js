module("triggers");

test("Default behavior", function() {
  expect(4);

  var $form = $("#testForm1").autosave();
  var form = $form.data("autosave");

  // Data should look like this by default
  var data = "text=test&textarea=&select=";

  $form.ajaxComplete(function(event, xhr, options) {
    ok(true, "Default autosave method 'ajax' is invoked successfully");
    equal(options.data, data, "Form field 'text' has value 'test', the rest are blank");
    equal(options.type, "POST", "Default ajax type is POST");
    equal(options.url, window.location.href, "Default ajax URL is current browser URL");

    start();
  });

  stop();

  $form.find(":input[type=text]").val("test").change();
});
