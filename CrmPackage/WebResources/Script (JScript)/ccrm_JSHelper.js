if (typeof CCrm == "undefined") CCrm = {};
CCrm.JSHelper = {
    getRESTUrl: function () {
        var b = "/XRMServices/2011/organizationdata.svc",
            a = "";
        if (typeof GetGlobalContext == "function") {
            var c = GetGlobalContext();
            a = c.getServerUrl()
        } else if (typeof Xrm.Page.context == "object") a = Xrm.Page.context.getServerUrl();
        else throw new Error("Unable to access the server URL");
        if (a.match(/\/$/)) a = a.substring(0, a.length - 1);
        return a + b
    },
    errorHandler: function (a) {
        var b = "Unable to parse error message";
        try {
            b = JSON.parse(a.responseText).error.message.value
        } catch (c) { }
        alert("Error : " + a.status + ": " + a.statusText + ": " + b)
    }
}