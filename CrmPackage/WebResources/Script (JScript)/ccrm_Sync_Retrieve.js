if(typeof CCrm=="undefined")CCrm={};CCrm.JSCore={RetrieveRequest:function(e,c){var d="/"+c+"(guid'"+e+"')",a=new XMLHttpRequest,b;a.open("GET",CCrm.JSHelper.getRESTUrl()+d,false);a.setRequestHeader("Accept","application/json");a.setRequestHeader("Content-Type","application/json; charset=utf-8");a.onreadystatechange=function(){b=CCrm.JSCore.RetrievedReqCallBack(this)};a.send();return b},RetrievedReqCallBack:function(a){if(a.readyState==4)if(a.status==200)return JSON.parse(a.responseText).d;else CCrm.JSHelper.errorHandler(a)}}