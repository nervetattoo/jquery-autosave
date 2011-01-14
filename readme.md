jQuery Autosave Plugin

Written by Mads Erik Forberg (mads@hardware.no) and Raymond Julin (raymond.julin@gmail.com)

Licensed under the BSD License

Usage: 
$("input.autosave").autosave({ 
    url: url, // Defaults to parent form url or window.location.href
    method: "post",  // Defaults to parent form url or get
    grouped: true, // Defaults to false. States whether all "input.autosave" should be sent in the request or only the one it was triggered upon
    success: function(data) { 
        console.log(data); 
    },
    dataType: "json", // Defaults to JSON, but can be XML, HTML and so on
    send: function() { 
        // Do stuff while we wait for the ajax response, defaults to doing nothing
        console.log("Saving");
    },
    error: function(xmlReq, text, errorThrown) { 
        // Handler if the ajax request fails, defaults to console.log-ing the ajax request scope
        console.log(text);
    }
});
// Submits entire form each time one of the 
// elements are changed
$("form#myForm").autosave(); 

Todo:
- Support timed autosave for textareas
