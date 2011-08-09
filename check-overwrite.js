function decompose_path(path) {
    var slash = path.lastIndexOf('/') + 1;
    var filename = path.substring(slash);
    var dot = slash + filename.lastIndexOf('.');
    if (dot <= slash) {
        return [path, ""]
    }
    else {
        return [path.substring(0, dot), path.substring(dot)]
    }
};

minibuffer.prototype.read_file_check_overwrite = function () {
    keywords(arguments);
    var initial_value = arguments.$initial_value;
    do {
        var path = yield this.read_file_path(forward_keywords(arguments),
                                             $initial_value = initial_value);
        var file = make_file(path);
        if (file.exists()) {
            var action = yield this.read_single_character_option(
                $prompt = "Existing file " + path +
                    ".  Action to perform: (o: Overwrite; f: Postfix; r: Re-input)",
                $options = ["o", "f", "r"]);
            switch (action) {
            case "o":
                yield co_return(file);
            case "f":
                var de_path = decompose_path(path);
                for (i = 1;;i++) {
                    file = make_file(de_path[0] + "(" + i.toString() + ")" + de_path[1]);
                    if (!file.exists())
                        yield co_return(file);
                }
            }
            initial_value = path;
        }
        else {
            yield co_return(file);
        }
    } while (true);
};
