function check() {
    "use strict";

    if (typeof Symbol == "undefined") return false;
    try {
        eval("var bar = (x) => x+1");
        eval("var a = [...[1,2],3]");
    } catch (e) { return false; }

    return true;
}

if (!check()) {
    alert(
        "You are using an older browser that is no longer supported for use with CRM. Please use a modern browser (such as Chrome)");
} 