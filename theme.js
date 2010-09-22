// load theme

let (theme_dir = get_home_directory()) {
    theme_dir.appendRelativePath(".conkerorrc/stylesheets");
    theme_load_paths.unshift(theme_dir);
}

theme_load("my-theme");