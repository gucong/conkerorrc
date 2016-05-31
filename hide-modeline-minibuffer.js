///
/// toggle Minibuffer
///

var minibuffer_hide_with_mode_line = true;
var minibuffer_visible = true;

function hide_minibuffer (window) {
    minibuffer_visible = false;
    window.minibuffer.element.collapsed = true;
    if (minibuffer_hide_with_mode_line && window.mode_line)
        window.mode_line.container.collapsed = true;
}

function show_minibuffer (window) {
    minibuffer_visible = true;
    window.minibuffer.element.collapsed = false;
    if (minibuffer_hide_with_mode_line && window.mode_line)
        window.mode_line.container.collapsed = false;
}

// add_hook("window_initialize_hook", hide_minibuffer);
// for_each_window(hide_minibuffer); // initialize existing windows

interactive("toggle-minibuffer",
            "Show or hide minibuffer",
            function (I) {
                if (minibuffer_visible) {
                    hide_minibuffer(I.window);
                }
                else {
                    show_minibuffer(I.window);
                }
            });

define_key(content_buffer_normal_keymap, "b", "toggle-minibuffer");

minibuffer_autohide_message_timeout = 1000;
minibuffer_autohide_timer = null;

var old_minibuffer_restore_state = (old_minibuffer_restore_state ||
                                    minibuffer.prototype._restore_state);
minibuffer.prototype._restore_state = function () {
    if (minibuffer_autohide_timer) {
        timer_cancel(minibuffer_autohide_timer);
        minibuffer_autohide_timer = null;
    }
    if (this.current_state)
        show_minibuffer(this.window);
    else
        hide_minibuffer(this.window);
    old_minibuffer_restore_state.call(this);
};

var old_minibuffer_show = (old_minibuffer_show || minibuffer.prototype.show);
minibuffer.prototype.show = function (str, force) {
    var w = this.window;
    show_minibuffer(w);
    old_minibuffer_show.call(this, str, force);
    if (minibuffer_autohide_timer) {
        timer_cancel(minibuffer_autohide_timer);
        minibuffer_autohide_timer = null;
    }
};

var old_minibuffer_clear = (old_minibuffer_clear || minibuffer.prototype.clear);
minibuffer.prototype.clear = function () {
    var w = this.window;
    if (minibuffer_autohide_timer) {
        timer_cancel(minibuffer_autohide_timer);
        minibuffer_autohide_timer = null;
    }
    if (! this.current_state) {
        minibuffer_autohide_timer = call_after_timeout(
            function () { hide_minibuffer(w); },
            minibuffer_autohide_message_timeout);
    }
    old_minibuffer_clear.call(this);
};

