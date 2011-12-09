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
define_webjump("aur", "https://aur.archlinux.org/packages.php?K=%s");
define_webjump("archwiki", "http://wiki.archlinux.org/index.php?search=%s");
define_webjump("taobao", "http://s.taobao.com/search?q=%s");
define_webjump("archlinux", "http://www.archlinux.org/packages/?q=%s");
define_webjump("ip", "http://www.123cha.com/ip/?q=%s");
define_webjump("simplecd", "http://www.simplecd.org/?q=%s");
define_webjump("hatrix", "http://hatrix.org/files/%s");
define_webjump("math607", "http://www.math.tamu.edu/~manshel/m607/m607.html");
define_webjump("math653", "http://www.math.tamu.edu/~stiller/courses/math653.html");
define_webjump("math641", "http://www.math.tamu.edu/~francis.narcowich/m641/f11/m641f11_hw.html");