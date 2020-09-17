var JSON;
if (!JSON) JSON = {};
(function () {
    "use strict";

    function c(a) {
        return a < 10 ? "0" + a : a
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function () {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + c(this.getUTCMonth() + 1) + "-" + c(this.getUTCDate()) + "T" + c(this.getUTCHours()) + ":" + c(this.getUTCMinutes()) + ":" + c(this.getUTCSeconds()) + "Z" : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
            return this.valueOf()
        }
    }
    var h = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        f = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        a, d, i = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        },
        b;

    function g(a) {
        f.lastIndex = 0;
        return f.test(a) ? '"' + a.replace(f, function (a) {
            var b = i[a];
            return typeof b === "string" ? b : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + a + '"'
    }

    function e(m, n) {
        var i, j, h, k, l = a,
            f, c = n[m];
        if (c && typeof c === "object" && typeof c.toJSON === "function") c = c.toJSON(m);
        if (typeof b === "function") c = b.call(n, m, c);
        switch (typeof c) {
            case "string":
                return g(c);
            case "number":
                return isFinite(c) ? String(c) : "null";
            case "boolean":
            case "null":
                return String(c);
            case "object":
                if (!c) return "null";
                a += d;
                f = [];
                if (Object.prototype.toString.apply(c) === "[object Array]") {
                    k = c.length;
                    for (i = 0; i < k; i += 1) f[i] = e(i, c) || "null";
                    h = f.length === 0 ? "[]" : a ? "[\n" + a + f.join(",\n" + a) + "\n" + l + "]" : "[" + f.join(",") + "]";
                    a = l;
                    return h
                }
                if (b && typeof b === "object") {
                    k = b.length;
                    for (i = 0; i < k; i += 1) {
                        j = b[i];
                        if (typeof j === "string") {
                            h = e(j, c);
                            h && f.push(g(j) + (a ? ": " : ":") + h)
                        }
                    }
                } else
                    for (j in c)
                        if (Object.hasOwnProperty.call(c, j)) {
                            h = e(j, c);
                            h && f.push(g(j) + (a ? ": " : ":") + h)
                        } h = f.length === 0 ? "{}" : a ? "{\n" + a + f.join(",\n" + a) + "\n" + l + "}" : "{" + f.join(",") + "}";
                a = l;
                return h
        }
    }
    if (typeof JSON.stringify !== "function") JSON.stringify = function (h, c, f) {
        var g;
        a = "";
        d = "";
        if (typeof f === "number")
            for (g = 0; g < f; g += 1) d += " ";
        else if (typeof f === "string") d = f;
        b = c;
        if (c && typeof c !== "function" && (typeof c !== "object" || typeof c.length !== "number")) throw new Error("JSON.stringify");
        return e("", {
            "": h
        })
    };
    if (typeof JSON.parse !== "function") JSON.parse = function (a, c) {
        var b;

        function d(f, g) {
            var b, e, a = f[g];
            if (a && typeof a === "object")
                for (b in a)
                    if (Object.hasOwnProperty.call(a, b)) {
                        e = d(a, b);
                        if (e !== undefined) a[b] = e;
                        else delete a[b]
                    } return c.call(f, g, a)
        }
        a = String(a);
        h.lastIndex = 0;
        if (h.test(a)) a = a.replace(h, function (a) {
            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        });
        if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
            b = eval("(" + a + ")");
            return typeof c === "function" ? d({
                "": b
            }, "") : b
        }
        throw new SyntaxError("JSON.parse");
    }
})()