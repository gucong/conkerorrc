{
   let _save_path = get_home_directory();

   function update_save_path(info) {
       _save_path = info.target_file.parent.path;
   }

   add_hook("download_added_hook", update_save_path);

   suggest_save_path_from_file_name = function (filename, buffer) {
       let file = make_file(_save_path);
       file.append(filename);
       return file.path;
   }
}