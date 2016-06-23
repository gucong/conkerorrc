These are my conkeror configuration file.
(Conkeror is a mozilla based, keyboard oriented and highly programmable web browser.)
There are some dirty but featured hacks here, as well as things that I shamelessly copied from others.

*** bookmark-manipulate.js :
A command to remove a specified bookmark is available.  So you don't have to use something like sqlite to do so.

*** history-manipulate.js :
A command to clear history is available.  No more sqlite.

*** flashblock.js :
A helper to enable under conkeror the famous flashblock add-on for firefox.  Linux users may want it because flashes often hurt your CPU.  Click (or `f') to play flashes when you really really need them.

*** invisible-scrollbar.js :
The trick is to fix the isearch scrolling problem when scroll bar is not visible.

*** scroll-percentage.js :
Scrolling by a whole page sometimes is just too much.  What about an arbitrary percentage?

*** undo-kill-buffer.js :
A simple way to remember and re-open killed buffers.  Only the URLs are stored, things like buffer history, position are lost.  Note: the meaning of buffer_kill_before_hook is disputed and actually is altered here.

*** browser-relationship.js :
Add support for some Chinese version of next/previous links.

*** zoom-width.js :
Zoom pages without changing text size.  This deals with pages that do not fit my slim horizontal resolution.

*** completion-no-space.js :
I hate the SPACE automatically inserted between completion and remaining substring.

*** download-path-history.js :
When I want to download a file, I may want to save it to a directory the same as some previous download.  Unfortunately, the default way to browse history also replace the filename to a previous download.  Why not combine the parent path in history entries with current filename?

*** check-overwrite.js :
More ways to handle existing file when you want to download.  You can choose to perform 1. Overwrite, 2. Automatically append a number, 3 Re-input the filename.

*** unicode-process.js :
Modified process spawning functions to support unicode arguments.

*** hide-modeline-minibuffer.js
Better handling of modeline/minibuffer autohiding.

*** session-backup-auto-save.js
Because auto-save session file is overwritten at launch, it is easy to loose them.   Now the auto-save is copied at launch to a timestamped backup file, so that you can manually load it in case auto-save itself is corrupted.  Also implements a command to purge all backup files.
