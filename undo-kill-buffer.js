// undo kill buffer
define_variable("killed_buffer_stack", new Array(), "A stack of recently killed buffers");

add_hook("buffer_kill_before_hook",
         function (buffer) {
             killed_buffer_stack.push(buffer.display_uri_string);
             return true;
         });

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
            alternates(follow_new_buffer, follow_new_window),
            $browser_object =
            define_browser_object_class("killed-buffer", null,
                                        function (I) {
                                            var text = killed_buffer_stack.pop();
                                            if (!text) {
                                                throw interactive_error("No more killed buffer");
                                            }
                                            return text;
                                        }));

define_key(content_buffer_normal_keymap, "C-/", "undo-kill-buffer");