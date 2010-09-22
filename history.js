// history url

define_browser_object_class(
    "history", null,
    function (I, prompt) {
        check_buffer (I.buffer, content_buffer);
        var result = yield I.buffer.window.minibuffer.read_url(
            $prompt = prompt,  $use_webjumps = false, $use_history = true, $use_bookmarks = false);
        yield co_return (result);
    },
    $hint = "choose from History");

define_key(content_buffer_normal_keymap, "* h", "browser-object-history");

// clear history

function history_clear () {
    var history = Cc["@mozilla.org/browser/nav-history-service;1"]
        .getService(Ci.nsIBrowserHistory);
    history.removeAllPages();
};

interactive("history-clear",
    "Clear the history.",
    history_clear);
