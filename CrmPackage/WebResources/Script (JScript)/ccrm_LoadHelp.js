function loadHelp() {
    $.ajax({
        type: "GET",
        url: "http://crm-uat.arup.com/ArupUAT/WebResources/ccrm_OppToolTips",
        dataType: "xml",
        success: parseHelpXML
    }); //end ajax
}
function parseHelpXML(data) {
    var entity = Xrm.Page.data.entity.getEntityName().toString().toLowerCase();
    entXML = $("entity[name=" + entity + "]", data)
    $(entXML).children().each(function (i) {
        var attr = this.getAttribute("name");
        var txt = $(this).find('shorthelp').text();
        registerHelp(entity, attr, txt);
    });
}

function registerHelp(entity, attr, txt) {
    var obj = document.getElementById(attr + '_c').children[0];
    html = '<img src="/_imgs/ico/16_info.gif" alt="" width="16" height="16" /><div id="help_' + attr + '" style="visibility: hidden; position:absolute;">: ' + txt + '</div>';
    $(obj).append(html);
}