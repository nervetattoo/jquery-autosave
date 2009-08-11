$(function() {
    /**
     * Tests
     */
    test("full form submit", function() {
        stop();
        $("form#one").autosave({
            load: function(data) {
                start();
                equals('foo', data.a, "Expecting value foo for a(input#1)");
                equals('foo', data.b, "Expecting value foo for b(input#2)");
                equals('foobar', data.c, "Expecting value foobar for c(textarea)");
            }
        });
        // Set some value on form
        $("form#one input").val('foo');
        $("form#one textarea").val('foobar');
        $("form#one").trigger('submit');
    });
    test("single element submit", function() {
        stop();
        var nodes = $("form#two input");
        var node = $("form#two input[name=a]");
        nodes.autosave({
            load: function(data) {
                start();
                equals('foo', data.a, "Expecting value foo");
                stop();
            }
        });
        // Set some value on form
        nodes.val('foo');
        node.trigger('change');
    });
    test("grouped element submit", function() {
        stop();
        var nodes = $("form#two input");
        var node = $("form#two input[name=a]");
        nodes.autosave({
            grouped: true,
            load: function(data) {
                start();
                equals('foo', data.b, "Expecting value foo for b");
                equals('foo', data.a, "Expecting value foo for a");
                stop();
            }
        });
        // Set some value on form
        nodes.val('foo');
        node.trigger('change');
    });
    test("non grouped element submit", function() {
        stop();
        var nodes = $("form#three input");
        var node = $("form#three input[name=a]");
        nodes.autosave({
            load: function(data) {
                start();
                equals(data.a,'foo', "Expecting value foo for a");
                ok(!("b" in data), "b should not be in data");
                stop();
            }
        });
        // Set some value on form
        nodes.val('foo');
        node.trigger('change');
    });
});

