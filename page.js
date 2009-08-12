$(function(){
    $("form select,form input,form textarea").autosave({
        grouped:false,
        success:function(data) {
            if ("name" in data)
                $("<span>Select:"+data.name+"</span><br/>").appendTo($("#demodebug"));
            if ("text" in data)
                $("<span>Input:"+data.text+"</span><br/>").appendTo($("#demodebug"));
            if ("textarea" in data)
                $("<span>Textarea:"+data.textarea+"</span><br/>").appendTo($("#demodebug"));
            if ("checkbox" in data)
                $("<span>Checkbox: "+data.checkbox+"</span><br/>").appendTo($("#demodebug"));
            if ("radio" in data)
                $("<span>Radio: "+data.radio+"</span><br/>").appendTo($("#demodebug"));
        }
    });
    // Set up documentation shit
    // Ruthlessly copied from multiselect
    $("#optionTabs").tabs();
    $('.options-list').find('.option-description, .option-examples').hide().end()
        .find('.option-name a').click(function() {
            var a = $(this);
            var p = a.parents(a.attr('href'));
            p.find('.option-examples, .option-description')['slide' + (p.find('.option-description').is(':visible') ? 'Up' : 'Down')]('fast');
            return false;
        });
        $('.methods-list').find('.method-header > dl, .method-description').hide().end()
        .find('.method-name a').click(function() {
            var a = $(this);
            var p = a.parents(a.attr('href'));
            p.find('.method-header > dl, .method-description')['slide' + (p.find('.method-description').is(':visible') ? 'Up' : 'Down')]('fast');
            return false;
        });
        $('.events-list').find('.event-description, .event-examples').hide().end()
        .find('.event-name a').click(function() {
            var a = $(this);
            var p = a.parents(a.attr('href'));
            p.find('.event-examples, .event-description')['slide' + (p.find('.event-description').is(':visible') ? 'Up' : 'Down')]('fast');
            return false;
        });

});
