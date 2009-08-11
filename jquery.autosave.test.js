$(function() {
    /**
     * Tests
     */
    test("full form submit", function() {
        stop();
        $("form#one").autosave({
            success: function(data) {
                start();
                equals('foo', data.a, "Expecting value foo for a(input#1)");
                equals('foo', data.b, "Expecting value foo for b(input#2)");
                equals('foobar', data.c, "Expecting value foobar for c(textarea)");
                ok(!("foo" in data), 'Button should not be included');
            },
            send: defaultAutosaveSendVisualizer
        });
        // Set some value on form
        $("form#one input").val('foo');
        $("form#one textarea").val('foobar');
        $("form#one").trigger('submit');
    });
    test("full form submit by button click", function() {
        stop();
        $("form#one").autosave({
            success: function(data) {
                start();
                equals('foo', data.a, "Expecting value foo for a(input#1)");
                equals('foo', data.b, "Expecting value foo for b(input#2)");
                equals('foobar', data.c, "Expecting value foobar for c(textarea)");
                ok(("foo" in data), 'Button should be included');
            }
        });
        // Set some value on form
        $("form#one input").val('foo');
        $("form#one textarea").val('foobar');
        $("form#one button").trigger('click');
    });
    test("input and button list by input change", function() {
        stop();
        $("#one input,#one button").autosave({
            grouped:true,
            success: function(data) {
                start();
                equals(data.a, 'foo', "Expecting value foo for a(input#1)");
                equals(data.b, 'foo', "Expecting value foo for b(input#2)");
                ok(!("foo" in data), 'Button should not be included');
            }
        });
        // Set some value on form
        $("#one input").val('foo');
        $("#one input:first-child").trigger('change');
    });
    test("input and button list by button click", function() {
        stop();
        $("#one input,#one button").autosave({
            grouped:true,
            success: function(data) {
                start();
                equals(data.a, 'foo', "Expecting value foo for a(input#1)");
                equals(data.b, 'foo', "Expecting value foo for b(input#2)");
                ok(("foo" in data), 'Button should not be included');
            }
        });
        // Set some value on form
        $("#one input").val('foo');
        $("#one button").trigger('click');
    });
    test("single element submit", function() {
        stop();
        var nodes = $("form#one input");
        var node = $("form#one input[name=a]");
        nodes.autosave({
            success: function(data) {
                start();
                equals(data.a, 'foo', "Expecting value foo");
                stop();
            }
        });
        // Set some value on form
        nodes.val('foo');
        node.trigger('change');
    });
    test("grouped element submit", function() {
        stop();
        var nodes = $("form#one input");
        var node = $("form#one input[name=a]");
        nodes.autosave({
            grouped: true,
            success: function(data) {
                console.log(data);
                start();
                equals(data.b, 'foo', "Expecting value foo for b");
                equals(data.b, 'foo', "Expecting value foo for a");
                stop();
            }
        });
        // Set some value on form
        nodes.val('foo');
        node.trigger('change');
    });
    test("non grouped element submit", function() {
        stop();
        var nodes = $("form#one input");
        var node = $("form#one input[name=a]");
        nodes.autosave({
            success: function(data) {
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

