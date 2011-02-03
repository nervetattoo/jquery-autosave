/**
 * @fileOverview jQuery.autosave.compatibility
 *
 * Provides backwards compatibility to make jQuery.autosave work with
 * jQuery versions 1.2.3 - 1.3.2. jQuery versions 1.4 and above do not
 * need to include this file. Keep in mind that the following code will
 * modify your version of jQuery for subsequent scripts. It does no harm,
 * but modifying jQuery itself is never a good idea. Do yourself a favor
 * and upgrade to a newer version if at all possible.
 *
 * @author Kyle Florence
 * @website https://github.com/kflorence/jquery-autosave
 * @version 1.0.3b
 *
 * Dual licensed under the MIT and BSD Licenses.
 */
(function(d,c,f){if(!d.isPlainObject){var b={},e=Object.prototype.toString,a=Object.prototype.hasOwnProperty;d.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(h,g){b["[object "+g+"]"]=g.toLowerCase()});d.extend({type:function(g){return g==null?String(g):b[e.call(g)]||"object"},isFunction:function(g){return d.type(g)==="function"},isArray:Array.isArray||function(g){return d.type(g)==="array"},isWindow:function(g){return g&&typeof g==="object"&&"setInterval" in g},isPlainObject:function(h){if(!h||d.type(h)!=="object"||h.nodeType||d.isWindow(h)){return false}if(h.constructor&&!a.call(h,"constructor")&&!a.call(h.constructor.prototype,"isPrototypeOf")){return false}var g;for(g in h){}return g===f||a.call(h,g)},extend:function(){var q,j,g,h,n,o,m=arguments[0]||{},l=1,k=arguments.length,p=false;if(typeof m==="boolean"){p=m;m=arguments[1]||{};l=2}if(typeof m!=="object"&&!d.isFunction(m)){m={}}if(k===l){m=this;--l}for(;l<k;l++){if((q=arguments[l])!=null){for(j in q){g=m[j];h=q[j];if(m===h){continue}if(p&&h&&(d.isPlainObject(h)||(n=d.isArray(h)))){if(n){n=false;o=g&&d.isArray(g)?g:[]}else{o=g&&d.isPlainObject(g)?g:{}}m[j]=d.extend(p,o,h)}else{if(h!==f){m[j]=h}}}}}return m}})}})(jQuery,window);
