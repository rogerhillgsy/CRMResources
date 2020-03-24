//CRM Subscription Service jscript
function HideFields() {
    Xrm.Page.ui.tabs.get("{7591ef5a-60a0-4186-a285-68551329aca8}").sections.get("section_2").setVisible(false);
}


function myIEVersion()
{
 var strBuffer = navigator.appVersion;
 var IECodeName = "MSIE";
 var Separator = ";";
 var IECodeNameLocation = strBuffer.indexOf(IECodeName);
 
 strBuffer = strBuffer.substr(IECodeNameLocation + 5, strBuffer.length - IECodeNameLocation)

 var SeparatorLocation = strBuffer.indexOf(Separator);
 var StringVersion = strBuffer.substr(0,SeparatorLocation);
 return parseFloat(StringVersion);
}


function getFetchXml() {
    return ' <fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">' +
                '<entity name="postfollow">' +
                    '<attribute name="regardingobjectid"/>' +
                    '<attribute name="ownerid"/>' +
             '<filter type="and">' +
                '<condition operator="eq-userid" attribute="ownerid"/>' +
             '</filter>' +
             '<link-entity name="contact" alias="a_d44fcc87621f11e0834f1cc1de634cfe" link-type="outer" visible="false" to="regardingobjectid" from="contactid">' +
                 '<attribute name="emailaddress1"/>' +
             '</link-entity>' +
             '</entity>' +
             '</fetch>';
}

function getLayoutXml() {
    // grid layout, you can get easily from Customization.xml file
    return  '<grid name="resultset" object="8003" jump="0" select="1" icon="1" preview="1">' +
			' <row name="result" id="postfollowid">' +
			'   <cell name="regardingobjectid" width="350"  />' +
			'   <cell name="ownerid" width="150"  />' +
			' </row>' +
			' </grid>';
}

function FetchViewer(iframeId) {
    var Instance = this;
    var vDynamicForm;
    var m_iframeTab;
    var m_iframeDoc;

    Instance.Entity = "";
    Instance.Iframe = null;
    Instance.FetchXml = "";
    Instance.QueryId = "";
    Instance.LayoutXml = "";

    Instance.RegisterOnTab = function (tabIndex) {
        Instance.Iframe = document.getElementById(iframeId);

        if (!Instance.Iframe)
            return alert("Iframe " + iframeId + " is undefined");

        m_iframeDoc = getIframeDocument();
        var loadingGifHTML = "<table height='100%' width='100%' style='cursor:wait'>";
        loadingGifHTML += "<tr>";
        loadingGifHTML += "<td valign='middle' align='center'>";
        loadingGifHTML += "<img alt='' src='/_imgs/AdvFind/progress.gif'/>";
        loadingGifHTML += "<div/><b>Loading View...</b>";
        loadingGifHTML += "</td></tr></table>";
        m_iframeDoc.body.innerHTML = loadingGifHTML;

        Instance.Refresh();

    }

    function RefreshOnReadyStateChange() {

        if (Instance.Iframe.readyState != 'complete')
            return;

        Instance.Refresh();
    }

    Instance.Refresh = function () {

        if (!Instance.Iframe)
            return alert("Iframe " + iframeId + " is undefined");

        m_iframeDoc = getIframeDocument();

        Instance.Iframe.detachEvent("onreadystatechange", RefreshOnReadyStateChange);

        var create = m_iframeDoc.createElement;
        var append1 = m_iframeDoc.appendChild;
        vDynamicForm = create("<FORM name='vDynamicForm' method='post'>");

        var append2 = vDynamicForm.appendChild;
        append2(create("<INPUT type='hidden' name='FetchXml'>"));
        append2(create("<INPUT type='hidden' name='LayoutXml'>"));
        append2(create("<INPUT type='hidden' name='EntityName'>"));
        append2(create("<INPUT type='hidden' name='DefaultAdvFindViewId'>"));
        append2(create("<INPUT type='hidden' name='ViewType'>"));
        append1(vDynamicForm);

        vDynamicForm.action = prependOrgName("/AdvancedFind/fetchData.aspx");
        vDynamicForm.FetchXml.value = Instance.FetchXml;
        vDynamicForm.LayoutXml.value = Instance.LayoutXml;
        vDynamicForm.EntityName.value = Instance.Entity;
        vDynamicForm.DefaultAdvFindViewId.value = Instance.QueryId;
        vDynamicForm.ViewType.value = 1039;
        vDynamicForm.submit();
	
		if (navigator.appName == "Microsoft Internet Explorer" && myIEVersion() <= 8)	
			Instance.Iframe.attachEvent("onreadystatechange", OnViewReady);
		else 
			Instance.addEventListener("onreadystatechange", OnViewReady);
			
    }

    function OnViewReady() {
        if (Instance.Iframe.readyState != 'complete') return;

        Instance.Iframe.style.border = 0;
        Instance.Iframe.detachEvent("onreadystatechange", OnViewReady);
        m_iframeDoc = getIframeDocument();
        m_iframeDoc.body.scroll = "no";
        m_iframeDoc.body.style.padding = "0px";
    }

    function getIframeDocument() {
        return Instance.Iframe.contentWindow.document;
    }

}


function gFocusGrid(tabName, gridName)
{
    var tabState = Xrm.Page.ui.tabs.get(tabName).getDisplayState();
    if (tabState == 'expanded')
    {
        try
        {
            document.getElementById(gridName).getElementsByTagName('a')[0].focus();
        }
        catch (err)
        {
            throw (err.Message());
        }
    }
}


function onLoad() {
    try {
        setTimeout('focusGrid("MyCRMSubscriptions")', 300);
    }
    catch (err) {
        // alert('OnLoad exception: ' + err.Message);
        setTimeout("onLoad()", 300);
    }
}

function focusGrid(gridName) {
    try {
        document.getElementById(gridName).getElementsByTagName('a')[0].focus();
    }
    catch (err) {
        // alert('focusGrid exception: ' + err.Message());
        throw (err.Message());
    }
}

function onHide() {
	Xrm.Page.ui.controls.get("ownerid").setVisible(false);
}
function newMySubscriptions()
{
    Xrm.Utility.openEntityForm("ccrm_crmeventschedule");
}