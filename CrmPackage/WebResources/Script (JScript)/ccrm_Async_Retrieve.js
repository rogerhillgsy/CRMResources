if (typeof CCrm == "undefined") CCrm = {}; CCrm.JSCore = { RetrieveRequest: function (b, a) { $.ajax({ type: "GET", contentType: "application/json; charset=utf-8", datatype: "json", url: CCrm.JSHelper.getRESTUrl() + "/" + a + "(guid'" + b + "')", beforeSend: function (a) { a.setRequestHeader("Accept", "application/json") }, success: function (a) { CCrm.JSCore.processRetrieved(a.d) }, error: function (a, b) { alert("Error : " + b + ": " + a.statusText) } }) }, processRetrieved: function () { } }