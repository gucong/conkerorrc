// webjumps url

// define_browser_object_class(
//     "webjumps", null,
//     function (I, prompt) {
//         check_buffer (I.buffer, content_buffer);
//         var result = yield I.buffer.window.minibuffer.read_url(
//             $prompt = prompt,  $use_webjumps = true, $use_history = false, $use_bookmarks = false);
//         yield co_return (result);
//     },
//     $hint = "choose from Webjumps");

// define_key(content_buffer_normal_keymap, "* w", "browser-object-webjumps");

// webjumps
define_webjump("reader", "https://reader.google.com");
define_webjump("mldonkey", "http://localhost:4080");
define_webjump("aur", "http://aur.archlinux.org/packages.php?K=%s");
define_webjump("archwiki", "http://wiki.archlinux.org/index.php?search=%s");
define_webjump("taobao", "http://s.taobao.com/search?q=%s");
define_webjump("archlinux", "http://www.archlinux.org/packages/?q=%s");
define_webjump("ip", "http://www.123cha.com/ip/?q=%s");