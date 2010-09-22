
// next/previous relationship
require("follow-relationship.js");
browser_relationship_patterns[RELATIONSHIP_NEXT] =
    [/^next$/i,
	 /\u4E0B\u4E00\u9875/, //下一页 unicode
	 /\xCFC2\xD2BB\xD2B3/, //下一页 gbk
	 /\u4E0B\u4E00\u5F20/, //下一张 unicode
	 /\xCFC2\xD2BB\xD5C5/, //下一张 gbk
     new RegExp("^>$","i"),
     new RegExp("^(>>|»)$","i"),
     new RegExp("^(>|»)","i"),
     new RegExp("(>|»)$","i"),
     new RegExp("\\bnext","i")
	];

browser_relationship_patterns[RELATIONSHIP_PREVIOUS] =
    [/^(prev|previous)$/i,
	 /\u4E0A\u4E00\u9875/, //上一页 unicode
	 /\xC9CF\xD2BB\xD2B3/, //上一页 gbk
	 /\u4E0A\u4E00\u5F20/, //上一张 unicode
	 /\xC9CF\xD2BB\xD5C5/, //上一张 gbk
     new RegExp("^<$","i"),
     new RegExp("^(<<|«)$","i"),
     new RegExp("^(<|«)","i"),
     new RegExp("(<|«)$","i"),
     new RegExp("\\bprev|previous\\b","i")
    ];
