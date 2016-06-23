// giftcardwiki.com webjump with completer

function giftcardwiki_completer () {
    keywords(arguments);
    completer.call(this, forward_keywords(arguments));
    this.get_string = function (x) x.name;
    this.get_description = function (x) (x.d*100).toFixed(1) + "% off,                    " + x.q.toFixed(0) + " cards";
}
giftcardwiki_completer.prototype = {
    constructor: giftcardwiki_completer,
    __proto__: completer.prototype,
    toString: function () "#<giftcardwiki_completer>",
    complete: function (input, pos) {
        let str = input.substring(0,pos);
        let lspec = load_spec({uri: "http://www.giftcardwiki.com/giftcards/data/searchData/"});
        let result = yield send_http_request(lspec);
        let all_data = JSON.parse(result.responseText);
        delete this.result;
        delete this.lspec;
        let c = this;
        var narrowed = all_data.filter(function (x) {
            var s = c.get_string(x);
            var regex = new RegExp(str, 'i');
            return regex.test(s);
        });
        yield co_return(new completions(this, narrowed));
    }
};

define_webjump("wikigiftcard", "http://www.giftcardwiki.com/giftcards/%s", $completer=new giftcardwiki_completer);
