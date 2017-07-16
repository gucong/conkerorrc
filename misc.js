// use vi as external editor.
editor_shell_command = "$EDITOR";

// view source in your editor.
view_source_use_external_editor = true;

// don't kill last buffer.
can_kill_last_buffer = false;

// show buffer count
remove_hook("mode_line_hook", mode_line_adder(clock_widget));
add_hook("mode_line_hook", mode_line_adder(loading_count_widget), true);
add_hook("mode_line_hook", mode_line_adder(buffer_count_widget), true);

// key bindings
key_bindings_ignore_capslock = true;
define_key(content_buffer_normal_keymap, "d", "follow-new-buffer-background");
define_key(content_buffer_normal_keymap, "delete", "delete");
define_key(content_buffer_normal_keymap, "* f", "browser-object-file");
undefine_key(default_global_keymap, "C-x C-c");

// extension compatibility
user_pref("extensions.checkCompatibility", false);
user_pref("extensions.checkUpdateSecurity", false);
user_pref("general.useragent.compatMode.firefox", true);

// user agent
set_user_agent("Mozilla/5.0 (X11; Linux x86_64; rv:45.9) Gecko/20100101 Goanna/3.2 Firefox/45.9 PaleMoon/27.4.0 conkeror/1.0.3");

// page modes
require("google-search-results");
require("github");
require("gmail");
require("feedly");
define_keymaps_page_mode("feedly-mode",
    build_url_regexp($domain = "feedly",
                     $tlds = ["com"],
                     $allow_www = true),
    { normal: feedly_keymap },
    $display_name = "Feedly");

// new buffer position
new_buffer_position = buffer_position_end_by_type;
new_buffer_with_opener_position = buffer_position_end_by_type;
special_buffer.prototype.default_position = buffer_position_end_by_type;

// default completion
url_completion_use_bookmarks = false;
url_completion_use_history = false;
url_completion_use_webjumps = true;

// download target
download_buffer_automatic_open_target = OPEN_NEW_BUFFER;

// smooth scrolling
user_pref("general.smoothScroll", false);

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
