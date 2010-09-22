// scroll with percentage
function scroll_percentage (I, percent) {
    let win = I.buffer.focused_frame;
    win.scrollBy(0, win.innerHeight * percent / 100);
};
define_key(content_buffer_normal_keymap, "C-d",
           function (I) {
               scroll_percentage(I, 50);
           });
define_key(content_buffer_normal_keymap, "M-d",
           function (I) {
               scroll_percentage(I, -50);
           });

