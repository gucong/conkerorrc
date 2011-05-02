// full page zoom with text size retained
interactive("zoom-out-width", null,
            function (I) {
                var viewer = I.buffer.markup_document_viewer;
                viewer["fullZoom"] = viewer["fullZoom"] * 0.8;
                viewer["textZoom"] = viewer["textZoom"] * 1.25;
            });

interactive("zoom-in-width", null,
            function (I) {
                var viewer = I.buffer.markup_document_viewer;
                viewer["fullZoom"] = viewer["fullZoom"] * 1.25;
                viewer["textZoom"] = viewer["textZoom"] * 0.8;
            });

interactive("zoom-reset-width", null,
            function (I) {
                browser_zoom_set(I.buffer, false, I.p = 100);
                browser_zoom_set(I.buffer, true,  I.p = 100);
            });

define_key(content_buffer_normal_keymap, "M-+", "zoom-in-width");
define_key(content_buffer_normal_keymap, "M-=", "zoom-reset-width");
define_key(content_buffer_normal_keymap, "M--", "zoom-out-width");
