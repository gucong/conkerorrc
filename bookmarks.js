// bookmark url

define_browser_object_class(
    "bookmarks", null,
    function (I, prompt) {
        check_buffer (I.buffer, content_buffer);
        var result = yield I.buffer.window.minibuffer.read_url(
            $prompt = prompt,  $use_webjumps = false, $use_history = false, $use_bookmarks = true);
        yield co_return (result);
    },
    $hint = "choose from Bookmarks");

define_key(content_buffer_normal_keymap, "* b", "browser-object-bookmarks");

// remove a bookmark

interactive("remove-bookmark", "Remove a bookmark",
	function delete_bookmark (I) {
		var spec = yield read_browser_object(I);
		var uri_string = load_spec_uri_string(spec);
		try {
			var items = nav_bookmarks_service.getBookmarkIdsForURI(make_uri(uri_string), {});
			for (i in items) {
				nav_bookmarks_service.removeItem(items[i]);
			}
		} catch (e) {}
	},
	$browser_object = browser_object_bookmarks
);

