// UIRecordCounter1.js
(function ($) {
    Type.registerNamespace('UIRecordCounter1');
    UIRecordCounter1.Counter = function () { }
    UIRecordCounter1.Counter.displayCount = function (locations) {
        var $0 = Xrm.Page.data.entity.getId();
        if (locations != null && locations.length > 0) {
            for (var $1 = 0; $1 < locations.length; $1++) {
                var $2 = locations[$1];
                var $3 = $2.split(':');
                var $4 = $3[0];
                var $5 = $3[1];
                var $6 = $3[2];
                var $7 = UIRecordCounter1.Counter.$1("<fetch mapping='logical' distinct='false' aggregate='true'><entity name='" + $5 + "'><attribute name='" + $6 + "' alias='count' aggregate='count' /><filter type='and'><condition attribute='statecode' operator='eq' value='0' /><condition attribute='" + $6 + "' operator='eq' value='" + $0 + "' /></filter></entity></fetch>");
                UIRecordCounter1.Counter.$0($4, $7);
            }
        }
    }
    UIRecordCounter1.Counter.$0 = function ($p0, $p1) {
        var $0 = {};
        $0.data = $p1;
        $0.async = true;
        $0.url = UIRecordCounter1.Counter.$2() + '/xrmservices/2011/organization.svc/web';
        $0.contentType = 'text/xml; charset=utf-8';
        $0.type = 'POST';
        $0.headers = {
            SOAPAction: 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute'
        };
        $0.success = function ($p1_0, $p1_1, $p1_2) {
            var $1_0 = '<b:key>count</b:key><b:value>';
            var $1_1 = $p1_2.responseText.indexOf('<b:key>count</b:key><b:value>') + $1_0.length;
            var $1_2 = $p1_2.responseText.indexOf('</b:value>', $1_1);
            var $1_3 = $p1_2.responseText.substring($1_1, $1_2);
            if (!!$1_3) {
                var $1_4 = Xrm.Page.ui.navigation.items.get($p0);
                $1_4.setLabel($1_4.getLabel() + ' (' + $1_3 + ')');
            }
        };
        $.ajax($0);
    }

    UIRecordCounter1.Counter.$1 = function ($p0) {
        var $0 = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services"><request i:type="b:RetrieveMultipleRequest" xmlns:b="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><b:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic"> <b:KeyValuePairOfstringanyType><c:key>Query</c:key><c:value i:type="b:FetchExpression"><b:Query>';
        $0 += UIRecordCounter1.Counter.$3($p0);
        $0 += '</b:Query></c:value></b:KeyValuePairOfstringanyType></b:Parameters><b:RequestId i:nil="true"/><b:RequestName>RetrieveMultiple</b:RequestName></request></Execute></s:Body></s:Envelope>';
        return $0;
    }
    UIRecordCounter1.Counter.$2 = function () {
        var $0 = Xrm.Page.context.getServerUrl();
        var $1 = window.location.href.split('/');
        var $2 = $0.split('/');
        var $3 = '';
        for (var $4 = 0; $4 < $2.length; $4++) {
            if ($4 < 3) {
                $3 += $1[$4] + '/';
            } else {
                $3 += $2[$4] + '/';
            }
        }
        return $3;
    }
    UIRecordCounter1.Counter.$3 = function ($p0) {
        $p0 = $p0.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return $p0;
    }
    UIRecordCounter1.Counter.registerClass('UIRecordCounter1.Counter');
})(jQuery); // This script was generated using Script# v0.7.4.0