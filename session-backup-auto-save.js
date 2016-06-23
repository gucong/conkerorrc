// 
// copy auto-save session file into timestamped backup files at launch
//


require("session.js");
session_auto_save_auto_load = "prompt";
session_auto_save_auto_load_fn = session_auto_save_load_window_current;

function session_timestamped_file_get() {
    var d = new Date();
    let f = session_dir.clone();
    f.append("cached-"+d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+"-"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());
    return f;
}

function session_auto_save_file_get() {
    if (session_auto_save_file instanceof Ci.nsIFile)
        return session_auto_save_file;
    let f = session_dir.clone();
    f.append(session_auto_save_file);
    return f;
}

add_hook("session-auto-save-mode-enable-hook",
         function () {
             let f = session_auto_save_file_get();
             var cached = f.exists() ? session_read(f) : null;
             if (cached) {
                 session_write(session_timestamped_file_get(), cached);
             }
         });

session_auto_save_mode(false);
session_auto_save_mode(true);

interactive("session-remove-backups", "Remove backup session files",
            function (I) {
                try {
                    let f = session_dir.clone();
                    var iter = f.directoryEntries;
                    while (iter.hasMoreElements()) {
                        var e = iter.getNext().QueryInterface(Ci.nsIFile);
                        if (e.leafName.substr(0,7) == "cached-") {
                            session_remove(e);
                        }
                    }
                } catch (e) {}
            });
