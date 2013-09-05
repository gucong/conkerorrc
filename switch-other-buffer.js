interactive("switch-to-other-buffer",
            "Switch to the previously open buffer",
            function (I) {
                var blist = I.window.buffers.buffer_history;
                if (blist.length > 1)
                    switch_to_buffer(I.window, blist[1]);
            });

define_key(content_buffer_normal_keymap, "'", "switch-to-other-buffer");