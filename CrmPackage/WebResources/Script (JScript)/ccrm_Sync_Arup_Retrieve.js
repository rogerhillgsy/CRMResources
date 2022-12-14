if (typeof CCrm == "undefined") CCrm = {};
CCrm.JSCore = {
    RetrieveRequest: function (e, c, s) {
        var a = CCrm.JSCore.getHTTPRequest(),
            b, d;
        if (s != null) d = "/" + c + "(guid'" + e + "')?$select=" + s;
        else d = "/" + c + "(guid'" + e + "')";
        if (a != false) {
            a.open("GET", CCrm.JSHelper.getRESTUrl() + d, false);
            a.setRequestHeader("Accept", "application/json");
            a.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            a.onreadystatechange = function () {
                b = CCrm.JSCore.RetrievedReqCallBack(this)
            };
            a.send()
        }
        return b
    },
    RetrievedReqCallBack: function (a) {
        if (a.readyState == 4)
            if (a.status == 200) return JSON.parse(a.responseText).d;
            else CCrm.JSHelper.errorHandler(a)
    },
    RetrieveMultipleRequest: function (c) {
        var a = CCrm.JSCore.getHTTPRequest(),
            b;
        if (a != false) {
            a.open("GET", CCrm.JSHelper.getRESTUrl() + c, false);
            a.setRequestHeader("Accept", "application/json");
            a.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            a.onreadystatechange = function () {
                b = CCrm.JSCore.RetrievedMultipleReqCallBack(this)
            };
            a.send()
        }
        return b
    },
    RetrievedMultipleReqCallBack: function (a) {
        if (a.readyState == 4)
            if (a.status == 200) return JSON.parse(a.responseText).d;
            else CCrm.JSHelper.errorHandler(a)
    },
    getHTTPRequest: function () {
        var a;
        if (typeof XMLHttpRequest != "undefined") try {
            a = new XMLHttpRequest
        } catch (c) {
            a = false
        }
        if (!a) try {
            a = new ActiveXObject("Msxml2.XMLHTTP")
        } catch (c) {
            try {
                a = new ActiveXObject("Microsoft.XMLHTTP")
            } catch (b) {
                a = false
            }
        }
        if (!a && window.createRequest) try {
            a = window.createRequest()
        } catch (c) {
            a = false
        }
        return a
    }
}