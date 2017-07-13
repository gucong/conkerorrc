// fix minibuffer completion with suffix
// fix minibuffer completion common prefix handling

function minibuffer_complete (window, count) {
    var m = window.minibuffer;
    var s = m.current_state;

    if (! (s instanceof text_entry_minibuffer_state))
        throw new Error("Invalid minibuffer state");
    if (! s.completer)
        return;
    var just_completed_manually = false;
    if (! s.completions_valid || s.completions === undefined) {
        if (s.completions_timer_ID == null)
            just_completed_manually = true;
        //XXX: may need to use ignore_input_events here
        s.update_completions(false /* not auto */, true /* update completions display */);
        // If the completer is a coroutine, nothing we can do here
        if (! s.completions_valid)
            return;
    }

    var c = s.completions;

    if (! c || c.count == 0)
        return;

    var e = s.completions_display_element;
    var new_index = -1;
    var common_prefix;

    if (count == 1 &&
        (common_prefix = c.common_prefix_input_state) &&
        (m._input_text != common_prefix[0]) &&
        (new RegExp(m._input_text,"i").test(common_prefix[0])))
    {
        //XXX: may need to use ignore_input_events here
        if (c.suffix) {
            m.set_input_state([common_prefix[0]+c.suffix,common_prefix[1],common_prefix[2]]);
        } else {
            m.set_input_state(common_prefix);
        }
        s.applied_common_prefix = true;
    } else if (!just_completed_manually) {
        if (e.currentIndex != -1) {
            new_index = (e.currentIndex + count) % c.count;
            if (new_index < 0)
                new_index += c.count;
        } else {
            new_index = (count - 1) % c.count;
            if (new_index < 0)
                new_index += c.count;
        }
    }

    if (new_index != -1) {
       try {
            m.ignore_input_events = true;
            s.select_completion(new_index);
        } finally {
            m.ignore_input_events = false;
        }
    }
}
