if (typeof CCrm == "undefined") CCrm = {}; CCrm.JSCore = { RetrieveAssociatedRequest: function (f, c, d) { var e = "/" + d + "(guid'" + f + "')/$links/" + c, a = new XMLHttpRequest, b; a.open("GET", CCrm.JSHelper.getRESTUrl() + e, false); a.setRequestHeader("Accept", "application/json"); a.setRequestHeader("Content-Type", "application/json; charset=utf-8"); a.onreadystatechange = function () { b = CCrm.JSCore.associateReqCallBack(this) }; a.send(); return b }, associateReqCallBack: function (a) { if (a.readyState == 4) if (a.status == 200) return JSON.parse(a.responseText).d; else CCrm.JSHelper.errorHandler(a) } }