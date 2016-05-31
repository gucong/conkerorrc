define_keymaps_page_mode("google-reader-mode",
    build_url_regexp($domain = "feedly",
                     $tlds = ["com"],
                     $allow_www = true),
    { normal: google_reader_keymap },
    $display_name = "feedly");

// define_keymaps_page_mode("google-reader-mode",
//     build_url_regexp($domain = "theoldreader",
//                      $tlds = ["com"],
//                      $allow_www = true),
//     { normal: google_reader_keymap },
//     $display_name = "Google Reader");
