// undo kill buffer

var killed_buffer_urls = [];
var killed_buffer_histories = [];

add_hook("buffer_kill_before_hook",
         function (buffer) {
             var hist = buffer.web_navigation.sessionHistory;
             if (buffer.display_uri_string && hist) {
                 killed_buffer_histories.push(hist);
                 killed_buffer_urls.push(buffer.display_uri_string);
             }
             return true;
         });

// add hook running when killing a buffer
function kill_buffer (buffer, force) {
    if (!buffer)
        return;
    var buffers = buffer.window.buffers;
    if (buffers.count == 1 && buffer == buffers.current) {
        if (can_kill_last_buffer || force) {
            delete_window(buffer.window);
            return;
        } else
            throw interactive_error("Can't kill last buffer.");
    }
    buffer_kill_before_hook.run(buffer);
    buffers.kill_buffer(buffer);
}

interactive("undo-kill-buffer", "Re-open a recently killed buffer",
    function restore_killed_buffer (I) {
        if (killed_buffer_urls.length !== 0) {
            var url;
            if (I.prefix_argument) {
                url = yield I.minibuffer.read(
                    $prompt = "Restore killed url:",
                    $completer = new all_word_completer($completions = killed_buffer_urls),
                    $default_completion = killed_buffer_urls[killed_buffer_urls.length - 1],
                    $auto_complete = "url",
                    $auto_complete_initial = true,
                    $auto_complete_delay = 0,
                    $require_match = true);
            } else {
                url = killed_buffer_urls[killed_buffer_urls.length-1];
            }
            var window = I.window;
            var creator = buffer_creator(content_buffer);
            var idx = killed_buffer_urls.indexOf(url);

            // Create the buffer
            var buf = creator(window, null);

            // Recover the history
            buf.web_navigation.sessionHistory = killed_buffer_histories[idx];

            // This line may seem redundant, but it's necessary.
            var original_index = buf.web_navigation.sessionHistory.index;
            buf.web_navigation.gotoIndex(original_index);

            // Focus the new tab
            window.buffers.current = buf;

            // Remove revived from cemitery
            killed_buffer_urls.splice(idx,1);
            killed_buffer_histories.splice(idx,1);
        } else {
            I.window.minibuffer.message("No more killed buffer");
        }
    });

define_key(content_buffer_normal_keymap, "C-/", "undo-kill-buffer");
