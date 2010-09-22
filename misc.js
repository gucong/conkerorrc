// use vi as external editor.
editor_shell_command = "$EDITOR";

// view source in your editor.
view_source_use_external_editor = true;

// show buffer count
remove_hook("mode_line_hook", mode_line_adder(clock_widget));
add_hook("mode_line_hook", mode_line_adder(loading_count_widget), true);
add_hook("mode_line_hook", mode_line_adder(buffer_count_widget), true);

// key bindings
key_bindings_ignore_capslock = true;
define_key(content_buffer_normal_keymap, "d", "follow-new-buffer-background");

// extension compatibility
user_pref("extensions.checkCompatibility", false);
user_pref("extensions.checkUpdateSecurity", false);

// page modes
require("page-modes/google-search-results.js");
require("page-modes/gmail.js");
require("page-modes/google-maps.js");

// session management
require("session.js");

// user agent
default_pref("general.useragent.extra.firefox", "firefox/3.6");

// default completion
url_completion_use_bookmarks = false;
url_completion_use_history = false;
url_completion_use_webjumps = true;

// test
// define_key(content_buffer_normal_keymap, "C-w",
//         function (I) {
//             I.window.minibuffer.message(
//                 I.buffer.display_uri_string)
//         });

// // disable scrollbars
// function disable_scrollbars (buffer) {
//     buffer.browser.contentWindow.scrollbars.visible = false;
// }
// add_hook ("content_buffer_location_change_hook", disable_scrollbars);
// remove_hook ("content_buffer_location_change_hook", disable_scrollbars);


