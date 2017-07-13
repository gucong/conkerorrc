// fix obsolete charset functionality

interactive("charset-prefix",
    "A prefix command that prompts for a charset to use in a "+
    "subsequent navigation command.",
    function (I) {
        Components.utils.import("resource://gre/modules/CharsetMenu.jsm");
		var cmData = CharsetMenu.getData();
        var charsets = [];
        for each(var charsetList in [cmData.pinnedCharsets, cmData.otherCharsets]) {
            for each(var charsetInfo in charsetList) {
                charsets.push(charsetInfo.value);
            }
        }
        I.forced_charset = yield I.minibuffer.read(
            $prompt = "Charset:",
            $completer = new prefix_completer(
                $completions = charsets,
                $get_string = function (x) x.toLowerCase()),
            $require_match,
            $space_completes);
    },
    $prefix);

interactive("reload-with-charset",
    "Prompt for a charset, and reload the current page, forcing use "+
    "of that charset.",
    function (I) {
        Components.utils.import("resource://gre/modules/CharsetMenu.jsm");
		var cmData = CharsetMenu.getData();
        var charsets = [];
        for each(var charsetList in [cmData.pinnedCharsets, cmData.otherCharsets]) {
            for each(var charsetInfo in charsetList) {
                charsets.push(charsetInfo.value);
            }
        }
        var forced_charset = yield I.minibuffer.read(
            $prompt = "Charset:",
            $completer = new prefix_completer(
                $completions = charsets,
                $get_string = function (x) x.toLowerCase()),
            $require_match,
            $space_completes);
        reload(I.buffer, false, null, "utf-8");
    });


function reload (b, bypass_cache, element, forced_charset) {
    check_buffer(b, content_buffer);
    if (element) {
        if (element instanceof Ci.nsIDOMHTMLImageElement) {
            try {
                var cache = Cc['@mozilla.org/image/cache;1']
                    .getService(Ci.imgICache);
                cache.removeEntry(make_uri(element.src));
            } catch (e) {}
        }
        element.parentNode.replaceChild(element.cloneNode(true), element);
    } else if (b.current_uri.spec != b.display_uri_string) {
        apply_load_spec(b, load_spec({ uri: b.display_uri_string,
                                       forced_charset: forced_charset }));
    } else {
        var flags = bypass_cache == null ?
            Ci.nsIWebNavigation.LOAD_FLAGS_NONE :
            Ci.nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE;

        if (! forced_charset && forced_charset_list)
            forced_charset = predicate_alist_match(forced_charset_list,
                                                   b.current_uri.spec);

        if (forced_charset) {
            try {
                b.doc_shell.charset=forced_charset;
            } catch (e) {}
        }
        b.web_navigation.reload(flags);
    }
}
