function clearSpaceForLegal() {
    //debugger;
    //remove the crmFormHeader Element..
    var crmformHead = parent.document.getElementById("crmFormHeader")
    if (crmformHead != undefined && crmformHead != null) {
        crmformHead.parentNode.removeChild(crmformHead);
    }

    //var legalFormTitleHeader= window.parent.document.getElementById("FormTitle").innerHTML;
    //if (legalFormTitleHeader != undefined) {
    //    window.parent.document.getElementById("FormTitle").innerHTML ="<style: padding-bottom:15px>";
    //}

    var legalFormTabCon = window.parent.document.getElementById("crmFormTabContainer");
    if (legalFormTabCon != undefined && legalFormTabCon != null) {
        window.parent.document.getElementById("crmFormTabContainer").style.marginTop = "0px";
    }

    var corTab = window.parent.document.getElementsByName("tab_tabs")[0];
    if (corTab != undefined && corTab != null) {
        //window.parent.document.getElementsByName("tab_tabs")[0].style.padding = "0px";
        window.parent.document.getElementsByName("tab_tabs")[0].style.margin = "0px";
    }

    var corTabP = window.parent.document.getElementsByName("tab_18_section_5")[0];
    if (corTabP != undefined && corTabP != null) {
        window.parent.document.getElementsByName("tab_18_section_5")[0].style.padding = "0px";
        window.parent.document.getElementsByName("tab_18_section_5")[0].style.margin = "0px";
    }
}

function clearSpace() {
    //  debugger;
    //remove the crmFormHeader Element..
    var crmformHead = parent.document.getElementById("crmFormHeader")
    if (crmformHead != undefined) {
        crmformHead.parentNode.removeChild(crmformHead);
    }
    var corTab = window.parent.document.getElementsByName("ClientOverview_column_1_section_1")[0];
    if (corTab != undefined) {
        window.parent.document.getElementsByName("ClientOverview_column_1_section_1")[0].style.padding = "0px";
        window.parent.document.getElementsByName("ClientOverview_column_1_section_1")[0].style.margin = "0px";
    }

    var corTabP = window.parent.document.getElementsByName("ClientOverview")[0];
    if (corTabP != undefined) {
        window.parent.document.getElementsByName("ClientOverview")[0].style.margin = "0px";
    }

    var corTab2 = window.parent.document.getElementsByName("tab_Relationship_management")[0];
    if (corTab2 != undefined) {
        window.parent.document.getElementsByName("tab_Relationship_management")[0].style.padding = "0px";
        window.parent.document.getElementsByName("tab_Relationship_management")[0].style.margin = "0px";
    }

    var corTabP2 = window.parent.document.getElementsByName("Interactions")[0];
    if (corTabP2 != undefined) {
        window.parent.document.getElementsByName("Interactions")[0].style.margin = "0px";
    }

    var corTabP3 = window.parent.document.getElementsByName("tab_Address_Contact_details")[0];
    if (corTabP3 != undefined) {
        window.parent.document.getElementsByName("tab_Address_Contact_details")[0].style.padding = "0px";
    }

    var corTabP4 = window.parent.document.getElementsByName("tab_Address_section")[0];
    if (corTabP4 != undefined) {
        window.parent.document.getElementsByName("tab_Address_section")[0].style.padding = "0px";
    }

    var corTabP5 = window.parent.document.getElementsByName("section_LocalAddress")[0];
    if (corTabP5 != undefined) {
        window.parent.document.getElementsByName("section_LocalAddress")[0].style.padding = "0px";
    }

    var corTabP6 = window.parent.document.getElementsByName("tab_Company_Details")[0];
    if (corTabP6 != undefined) {
        window.parent.document.getElementsByName("tab_Company_Details")[0].style.padding = "0px";
    }

    var corTabP7 = window.parent.document.getElementsByName("tab_Address_section_2")[0];
    if (corTabP7 != undefined) {
        window.parent.document.getElementsByName("tab_Address_section_2")[0].style.padding = "0px";
    }

    var corTabP8 = window.parent.document.getElementsByName("Relationship_Interactions")[0];
    if (corTabP8 != undefined) {
        window.parent.document.getElementsByName("Relationship_Interactions")[0].style.padding = "0px";
        window.parent.document.getElementsByName("Relationship_Interactions")[0].style.marginTop = "0px";
    }

    var corTabP9 = window.parent.document.getElementsByName("tab_Recent_Activities")[0];
    if (corTabP9 != undefined) {
        window.parent.document.getElementsByName("tab_Recent_Activities")[0].style.padding = "0px";
        //  window.parent.document.getElementsByName("tab_Recent_Activities")[0].style.marginTop = "0px";
    }

    var corTabP10 = window.parent.document.getElementsByName("tab_Upcoming_Activities")[0];
    if (corTabP10 != undefined) {
        window.parent.document.getElementsByName("tab_Upcoming_Activities")[0].style.padding = "0px";
        //    window.parent.document.getElementsByName("tab_Upcoming_Activities")[0].style.marginTop = "0px";
    }

    var corTabP11 = window.parent.document.getElementsByName("tab_Frameworks")[0];
    if (corTabP11 != undefined) {
        window.parent.document.getElementsByName("tab_Frameworks")[0].style.padding = "0px";
        window.parent.document.getElementsByName("tab_Frameworks")[0].style.marginTop = "0px";
    }

    var corTabP12 = window.parent.document.getElementsByName("tab_WonLost_Opportunities")[0];
    if (corTabP12 != undefined) {
        window.parent.document.getElementsByName("tab_WonLost_Opportunities")[0].style.padding = "0px";
        window.parent.document.getElementsByName("tab_WonLost_Opportunities")[0].style.marginTop = "0px";
    }

    var corTabP13 = window.parent.document.getElementsByName("tab_Open_Opportunities")[0];
    if (corTabP13 != undefined) {
        window.parent.document.getElementsByName("tab_Open_Opportunities")[0].style.padding = "0px";
        window.parent.document.getElementsByName("tab_Open_Opportunities")[0].style.marginTop = "0px";
    }

    var corTabP14 = window.parent.document.getElementsByName("client_management_tab")[0];
    if (corTabP14 != undefined) {
        window.parent.document.getElementsByName("client_management_tab")[0].style.padding = "0px";

    }

    var corTabP15 = window.parent.document.getElementsByName("tab_Relationship_management_section_3")[0];
    if (corTabP15 != undefined) {
        window.parent.document.getElementsByName("tab_Relationship_management_section_3")[0].style.padding = "0px";
    }

    var corTabP16 = window.parent.document.getElementsByName("tab_Relationship_management_column_10_section_1")[0];
    if (corTabP16 != undefined) {
        window.parent.document.getElementsByName("tab_Relationship_management_column_10_section_1")[0].style.padding = "0px";
    }

    var corTabP17 = window.parent.document.getElementsByName("ACCOUNT_INFORMATION")[0];
    if (corTabP17 != undefined) {
        window.parent.document.getElementsByName("ACCOUNT_INFORMATION")[0].style.padding = "0px";
    }

    var corTabP18 = window.parent.document.getElementsByName("Section_Organisation_Parents")[0];
    if (corTabP18 != undefined) {
        window.parent.document.getElementsByName("Section_Organisation_Parents")[0].style.padding = "0px";
    }

    var corTabP19 = window.parent.document.getElementsByName("SUMMARY_TAB_section_8")[0];
    if (corTabP19 != undefined) {
        window.parent.document.getElementsByName("SUMMARY_TAB_section_8")[0].style.padding = "0px";
    }

    var corTabP20 = window.parent.document.getElementsByName("tab_Openleads")[0];
    if (corTabP20 != undefined) {
        window.parent.document.getElementsByName("tab_Openleads")[0].style.padding = "0px";
        window.parent.document.getElementsByName("tab_Openleads")[0].style.marginTop = "0px";
    }
}