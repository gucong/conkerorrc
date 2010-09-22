// load stylesheets in ./css

let (sheet = get_home_directory()) {
	sheet.appendRelativePath(".conkerorrc/stylesheets/flashblock.css");
	register_user_stylesheet(make_uri(sheet));
}