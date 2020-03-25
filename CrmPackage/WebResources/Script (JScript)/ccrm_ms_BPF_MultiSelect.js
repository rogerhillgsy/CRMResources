/// <reference path="../Intellisense/Xrm.Page.2013.js"/>

function formatBPFMultiSelect(displayField, valueField, b, picklistField, height) {
    /// <summary>Called from onload to set up Javascript intellisense</summary>

    //multi select option sets do not work on mobile forms
    if (Xrm.Page.context.client.getClient() == "Mobile") return;

    if (!height) {
        height = 250;
    }

    if (b == null)
        b = 9999;
    (Xrm.Page.ui.getFormType() == 1 ||
        Xrm.Page.ui.getFormType() == 2 ||
        Xrm.Page.ui.getFormType() == 5 ||
        Xrm.Page.ui.getFormType() == 6) &&
        $(document)
            .ready(function () {

                $("#" + displayField, parent.document)
                    .click(function (e) {
                        if (!!e.ctrlKey) {
                            debugger;
                        }
                        $("#" + displayField, parent.document).off("focusin");
                        showHideMultiselectBox(e, displayField, valueField, picklistField, b, height);
                    });
                $("#" + displayField, parent.document).focusin(function (e) {
                    $("#" + displayField, parent.document).off("focusin");
                    showHideMultiselectBox(e, displayField, valueField, picklistField, b, height);
                    //              }
                });
                $(parent.document).mousedown(function (e) {
                    if (e.target.parentElement.offsetParent != null) {
                        if (e.target.parentElement.offsetParent.id == displayField) {
                            //$('#container_header_process_ccrm_disciplinesname',parent.document).length
                            var len = $('#container_' + displayField, parent.document).length;
                            if (len != 1) {
                                $("#" + displayField, parent.document).off("focusin");
                                showHideMultiselectBox(e, displayField, valueField, picklistField, b, height);
                            }
                        }
                    }
                });


                $(parent.document).keydown(function (e) {
                    if (e.target.id == displayField + "_i") {
                        e.preventDefault();
                        showHideMultiselectBox(e, displayField, valueField, picklistField, b, height);
                    }

                });
                cleanMultiselectValues(picklistField, displayField);
                $(window)
                    .resize(function () {
                        $("#container_" + displayField, parent.document).width($("#" + displayField, parent.document).width());
                        $("#" + displayField + "_i", parent.document).width($("#" + displayField, parent.document).width() - 35);
                        var c = $("#" + displayField, parent.document).width() / 5,
                            b = $("#" + displayField, parent.document).width(),
                            e = $("#processControlCollapsibleArea", parent.document).width(),
                            d = $("#" + displayField, parent.document).offset().left + b + 50;
                        if (d < e)
                            c = b + 8;
                        $("#" + displayField + "popup", parent.document)
                            .css({
                                top: -45,
                                left: c
                            });
                    });
                // Hide warning icon
                $("#" + displayField + "_warn", parent.document).hide();
            });
}
function showHideMultiselectBox(e, displayField, valueField, picklistField, b, height) {
    if ($("#" + displayField + "popup", parent.document).is(":visible") && (e.target.offsetParent.id == displayField || e.target.offsetParent.id == displayField || e.target.offsetParent.textContent == "click to enter")) {
        ProcessBPFSelected(displayField, valueField);
    } else {
        //$("#processControlScrollPane",parent.document).css("overflow", "visible");
        renderBPFContent(e.target.id, picklistField, displayField, valueField, b, height);
        $("#" + displayField + "_c + .processStepLabelMask", parent.document).parent().parent().find(".processStepLabelMask").css("width", "0px");
    }
}
function cleanMultiselectValues(picklistField, displayField) {
    ///<summary>Ensure that the display field only contains values allowed by the picklist.</summary>
    var displayValueAttr = Xrm.Page.getAttribute(displayField);
    if (!!displayValueAttr) {
        var displayValue = displayValueAttr.getValue() || "";

        var pickListField = Xrm.Page.getAttribute(picklistField);
        var optionValues = {};
        $.map(pickListField.getOptions(), function (e, i) { optionValues[e.text] = 1; });

        var displayValues = displayValue.split(", ");
        var filteredValues = [];
        $.map(displayValues,
            function (e, i) {
                if (!!optionValues[e]) {
                    filteredValues.push(e);
                }
            });
        displayValue = filteredValues.join(", ");
        if (!!displayValue) {
            displayValueAttr.setValue(displayValue);
        }
    }
}


function renderBPFContent(clickedFieldId, picklistField, displayField, valueField, q, height) {

    //$("#"+displayField,parent.document).parent().css("display", "none");
    //$("#" + displayField + "_i",parent.document).parent().text("click to enter");

    var heightS1 = height.toString();
    var heightS2 = (height - 55).toString();
    if (clickedFieldId != "btn" + displayField + "close" && clickedFieldId != "btn" + displayField + "cancel" && clickedFieldId != displayField + "_l" && clickedFieldId != displayField + "_ul" && clickedFieldId.indexOf("chk_" + displayField) == -1 && clickedFieldId.indexOf("lbl_" + displayField) == -1) {
        $("#" + displayField + " .ms-crm-Inline-Validation", parent.document).remove();
        $("#" + displayField + " .ms-crm-Inline-ErrorArrowIcon.ms-crm-VerticalFlipMargin", parent.document).remove();
        $("#" + displayField + " .ms-crm-Inline-ErrorArrowIcon", parent.document).remove();

        var k = Xrm.Page.getControl(displayField).getAttribute().getValue() // Xrm.Page.getAttribute(l).getValue()
            , p = $("#" + displayField, parent.document).parent().parent().parent().width()
            , b = $("#" + displayField, parent.document).html()
            , j = true
            , o = b.substring(b.length, b.length - 8)
            , f = "";
        if (o.indexOf("span") != -1) {
            j = false;
            b = b.substring(0, b.length - 8);
            f = "</span>";
        } else
            b = b.substring(0, b.length - 7);
        if ($("#" + displayField + "popup", parent.document).css("display") != "block")
            if ($("#" + displayField + "popup", parent.document).length == 0) {
                var g, h = $("#" + displayField, parent.document).width() / 2, e = $("#" + displayField, parent.document).width(), n = $("#processControlScrollPane", parent.document).width(), m = $("#" + displayField, parent.document).offset().left + e + 50;
                if (m < n)
                    h = e + 8;
                $("#" + displayField, parent.document).parent().css({
                    "z-index": q,
                    position: "absolute"
                });
                if (k == "")
                    g = "<div id='container_" + displayField + "' style='width:" + e + "px;'>" + b + '<div style=";width:335px; left:' + h + "px; top:-45px; position:absolute;height:" + heightS1 + "px;border:solid 1px #d7d7d7;background: white;\" id='" + displayField + "popup'><div style='height:" + heightS1 + "px'><img src=\"" + Xrm.Page.context.getClientUrl() + '/WebResources/ccrm_ms_notch" width="9" height="15" alt="image" style="float:left; margin-left:-9px; margin-top:45px;" /> <div id=\'' + displayField + "_l'  style='width:97%; \theight: " + heightS2 + "px;\tbackground-color: #ffffff;\tpadding: 5px;'>" + getBPFMultiSelectHTML(picklistField, displayField, valueField, heightS2) + "</div><div align='right' style='height:32px;padding-top: 13px;padding-right: 10px;background-color: rgb(248, 248, 248);'><button type='button' id='btn" + displayField + "close' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Done'>Done</button>&nbsp;&nbsp;&nbsp;&nbsp;<button  type='button' id='btn" + displayField + "cancel' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Cancel'>Cancel</button></div></div></div></div>" + f + "</div>";
                else
                    g = "<div id='container_" + displayField + "' style='width:" + e + "px;'>" + b + '<div style="width:335px; height:' + heightS1 + 'px; position:absolute; left:' + h + "px; top:-45px; border:solid 1px #d7d7d7;background: white;\" id='" + displayField + "popup'><div style='height:" + heightS1 + "px'><img src=\"" + Xrm.Page.context.getClientUrl() + '/WebResources/ccrm_ms_notch" width="9" height="15" alt="image" style="float:left; margin-left:-9px; margin-top:45px;" /> <div id=\'' + displayField + "_l'  style='position: relative; width:97%; \theight: " + heightS2 + "px;\tbackground-color: #ffffff;\tpadding: 5px;'>" + getBPFMultiSelectHTML(picklistField, displayField, valueField, heightS2) + "</div><div align='right' style='height:32px;padding-top: 13px;padding-right: 10px;background-color: rgb(248, 248, 248);'><button type='button' id='btn" + displayField + "close' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Done'>Done</button>&nbsp;&nbsp;&nbsp;&nbsp;<button type='button' id='btn" + displayField + "cancel' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Cancel'>Cancel</button></div></div></div></div>" + f + "</div>";

                /* if (k == "")
                    g = "<div id='container_" + displayField + "' style='width:" + e + "px;'>" + b + '<div style=";width:335px; left:' + h + "px; top:-45px; position:absolute;height:"+heightS1+"px;border:solid 1px #d7d7d7;background: white;\" id='" + displayField + "popup'><div style='height:"+heightS1+"px'><img src=\"" + Xrm.Page.context.getClientUrl() + '/WebResources/ccrm_ms_notch" width="9" height="15" alt="image" style="float:left; margin-left:-9px; margin-top:45px;" /> <div id=\'' + displayField + "_l'  style='width:97%; \theight: "+heightS2+"px;\tbackground-color: #ffffff;\tpadding: 5px;'>" + getBPFMultiSelectHTML(picklistField, displayField, valueField, heightS2) + "</div><div align='right' style='height:32px;padding-top: 13px;padding-right: 10px;background-color: rgb(248, 248, 248);'><button onclick='ProcessBPFSelected(" + displayField + "," + valueField + ")' type='button' id='btn" + displayField + "close' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Done'>Done</button>&nbsp;&nbsp;&nbsp;&nbsp;<button onclick='CancelBPFSelected(" + displayField + "," + valueField + ")' type='button' id='btn" + displayField + "cancel' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Cancel'>Cancel</button></div></div></div></div>" + f + "</div>";
                else
                    g = "<div id='container_" + displayField + "' style='width:" + e + "px;'>" + b + '<div style="width:335px; height:'+heightS1+'px; position:absolute; left:' + h + "px; top:-45px; border:solid 1px #d7d7d7;background: white;\" id='" + displayField + "popup'><div style='height:"+heightS1+"px'><img src=\"" + Xrm.Page.context.getClientUrl() + '/WebResources/ccrm_ms_notch" width="9" height="15" alt="image" style="float:left; margin-left:-9px; margin-top:45px;" /> <div id=\'' + displayField + "_l'  style='position: relative; width:97%; \theight: "+heightS2+"px;\tbackground-color: #ffffff;\tpadding: 5px;'>" + getBPFMultiSelectHTML(picklistField, displayField, valueField,heightS2) + "</div><div align='right' style='height:32px;padding-top: 13px;padding-right: 10px;background-color: rgb(248, 248, 248);'><button onclick='ProcessBPFSelected(" + displayField + "," + valueField + ")' type='button' id='btn" + displayField + "close' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Done'>Done</button>&nbsp;&nbsp;&nbsp;&nbsp;<button onclick='CancelBPFSelected(" + displayField + "," + valueField + ")' type='button' id='btn" + displayField + "cancel' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Cancel'>Cancel</button></div></div></div></div>" + f + "</div>";
             */
                $("#" + displayField, parent.document).html(g);
                $(document).ready(function () {
                    $("#btn" + displayField + "close", parent.document).click(function () {
                        ProcessBPFSelected(displayField, valueField);
                    });

                    $("#btn" + displayField + "cancel", parent.document).click(function () {
                        CancelBPFSelected(displayField, valueField);
                    });
                });

                $("#container_" + displayField, parent.document).parent().css("top", "2px");
                !j && $("#" + displayField + "popup", parent.document).parent().children().first().css("display", "none");
                $("#" + displayField + "_i", parent.document).height($("#container_" + displayField, parent.document).children().first().height());
                $("#" + displayField, parent.document).height($("#container_" + displayField, parent.document).children().first().height());
                $("#" + displayField + "popup", parent.document).css("display", "block");
                $("#" + displayField + "popup", parent.document).parent().css("display", "block");
                $("#" + displayField, parent.document).removeAttr("title");
                $("#" + displayField + "_i", parent.document).attr("readonly", true);
                $("#" + displayField + "popup", parent.document).focus();
                $("#btn" + displayField + "close", parent.document).css("background-image", "none");
                $("#btn" + displayField + "cancel", parent.document).css("background-image", "none");
                $("#btn" + displayField + "close", parent.document).mouseenter(function () {
                    $(this, parent.document).css("border-width", "1px");
                    $(this, parent.document).css("border-color", "rgb(146, 192, 224)");
                    $(this, parent.document).css("background-color", "rgb(205, 230, 247)");
                });
                $("#btn" + displayField + "close", parent.document).mouseleave(function () {
                    $(this, parent.document).css("border-width", "1px");
                    $(this, parent.document).css("border-color", "rgb(198, 198, 198)");
                    $(this, parent.document).css("background-color", "white");
                });
                $("#btn" + displayField + "cancel", parent.document).mouseenter(function () {
                    $(this, parent.document).css("border-width", "1px");
                    $(this, parent.document).css("border-color", "rgb(146, 192, 224)");
                    $(this, parent.document).css("background-color", "rgb(205, 230, 247)");
                });
                $("#btn" + displayField + "cancel", parent.document).mouseleave(function () {
                    $(this, parent.document).css("border-width", "1px");
                    $(this, parent.document).css("border-color", "rgb(198, 198, 198)");
                    $(this, parent.document).css("background-color", "white");
                });
                $("#" + displayField + "_i", parent.document).val(k);
                $("#" + displayField, parent.document).parent().parent().parent().width(p);
                //parent.document.getElementById("btn"+displayField+"cancel").onclick=CancelBPFSelected(displayField,valueField);

                $("#processControlScrollPane", parent.document).css("overflow", "visible");
            }
            else {
                $("#" + displayField + "popup", parent.document).css("display", "block");
                $("#" + displayField, parent.document).removeAttr("title");
                $("#container_" + displayField, parent.document).children().first().css("display", "none");
                $("#" + displayField + "_i", parent.document).parent().css("display", "block");
                $("#processControlScrollPane", parent.document).css("overflow", "visible");
            }
    }
}


function ProcessBPFSelected(a, b) {
    $("#processControlScrollPane", parent.document).css("overflow", "scroll");
    if (a.id != null)
        a = a.id;
    if (b.id != null)
        b = b.id;
    var f = Xrm.Page.getAttribute(b).getValue()
        , c = setBPFMultiSelect(a, b);
    $("#" + a + "_i", parent.document).value = c.text;
    $("#" + a + "_i", parent.document).attr("title", c.text);
    $("#" + a, parent.document).attr("title", c.text);
    var targetAttribute = Xrm.Page.getControl(a).getAttribute();
    targetAttribute.setValue(c.text);
    Xrm.Page.getAttribute(b).setValue(c.val);
    $("#" + b, parent.document).val(c.val);
    $("#" + a + "popup", parent.document).fadeOut(400);
    if (c.text != "") {
        $("#container_" + a, parent.document).children().first().text(c.text);
        $("#container_" + a, parent.document).children().first().removeClass("ms-crm-Inline-EmptyValue");
        $("#" + a + "_i", parent.document).val(c.text);
    } else {
        $("#container_" + a, parent.document).children().first().text("click to enter");
        $("#container_" + a, parent.document).children().first().addClass("ms-crm-Inline-EmptyValue");
        $("#" + a + "_i", parent.document).val("");
    }
    $("#" + a + "_i", parent.document).parent().css("display", "none");
    $("#container_" + a, parent.document).children().first().css("display", "block");

    $("#" + a, parent.document).mouseenter(function () {
        $("#" + a + "popup", parent.document).css("display") != "block" &&
            $("#container_" + a, parent.document).children().first().addClass("ms-crm-Inline-EditHintState");
    });
    $("#" + a, parent.document).mouseleave(function () {
        $("#container_" + a, parent.document).children().first().removeClass("ms-crm-Inline-EditHintState");
    });
    $("#" + a + "_c", parent.document).mouseenter(function () {
        $("#" + a + "popup", parent.document).css("display") != "block" &&
            $("#" + a, parent.document).children().first().addClass("ms-crm-Inline-EditHintState");
    });
    $("#" + a + "_c", parent.document).mouseleave(function () {
        $("#" + a + "popup", parent.document).css("display") != "block" &&
            $("#" + a, parent.document).children().first().removeClass("ms-crm-Inline-EditHintState");
    });
    var e = Xrm.Page.getAttribute(b).getValue();
    if (f != e) {
        Xrm.Page.getAttribute(b).fireOnChange();
        setParentDispFieldData(a, b, targetAttribute.getName());
    }
    //New from April Release
    var otherField, lastLetter = a.substring(a.length - 1);
    if (lastLetter == "1") {
        otherField = a.substring(0, a.length - 1);
    }
    else {
        otherField = a + "1";
    }
    if ($('#container_' + a, parent.document).children().first().text() != $('#container_' + otherField, parent.document).children().first().text()) {
        $('#container_' + otherField, parent.document).children().first().text($('#container_' + a, parent.document).children().first().text());
        $('#' + otherField + '_i', parent.document).val($('#' + a + '_i', parent.document).val());
        if (Xrm.Page.getAttribute(b).getValue() == null)
            $('#container_' + otherField, parent.document).children().first().removeClass("ms-crm-Inline-EmptyValue")
        var i = Xrm.Page.getAttribute(b).getValue() != null ? Xrm.Page.getAttribute(b).getValue().split(",") : "";
        $('#' + otherField + '_ul li label input', parent.document).each(function () {
            if ($.inArray($(this).val(), i) != -1)
                $(this).prop("checked", true);
            else
                $(this).removeAttr("checked");
        })
    }
}

function CancelBPFSelected(a, b) {
    $("#processControlScrollPane", parent.document).css("overflow", "scroll");
    if (a[0].id != null)
        a = a[0].id;
    if (b[0].id != null)
        b = b[0].id;
    $("#" + a + "popup", parent.document).css("display", "none");
    var d = Xrm.Page.getAttribute(b).getValue() != null ? Xrm.Page.getAttribute(b).getValue().split(",") : "";
    $("input[name=list_" + a + "]", parent.document).each(function () {
        if ($.inArray(this.value, d) != -1)
            this.checked = "checked";
        else
            this.checked = "";

    });
    $("#" + a, parent.document).attr("title", $("#" + a + "_i", parent.document).value);
    var c = Xrm.Page.getControl(a).getAttribute()
        , e = $("#" + a + "_i", parent.document).val();
    c.setValue(e);
    $("#" + a + "_i", parent.document).parent().css("display", "none");
    $("#container_" + a, parent.document).children().first().css("display", "block");

}
function setBPFMultiSelect(d) {
    var b = ""
        , a = "";
    $("input[name=list_" + d + "]:checked", parent.document).each(function () {
        b += this.value + ",";
        a += this.nextSibling.data + ", ";
    });
    if (b.substring(b.length - 1) == ",")
        b = b.substring(0, b.length - 1);
    if (a.substring(a.length - 2) == ", ")
        a = a.substring(0, a.length - 2);
    var c = {};
    c.text = a;
    c.val = b;
    return c;
}

function getBPFMultiSelectHTML(picklistField, displayField, valueField, height) {
    var a = Xrm.Page.getAttribute(picklistField).getOptions()
        , g = "<UL id='" + displayField + "_ul' style='height: " + height + "px; overflow: auto; width: 100%; background-color: white; border: 0px solid #C4C8CE; list-style-type: none; margin: 0; padding-top: 7px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; overflow-x: hidden;'>"
        , d = 0
        , f = ""
        , k = Xrm.Page.getAttribute(picklistField).getUserPrivilege().canCreate;
    a.sort(function compare(a, b) {
        if (a.text < b.text)
            return -1;
        if (a.text > b.text)
            return 1;
        return 0;
    });
    if (Xrm.Page.ui.getFormType() == 1 && !Xrm.Page.getAttribute(picklistField).getUserPrivilege().canCreate)
        f = "disabled";
    else if ((Xrm.Page.ui.getFormType() == 2 || Xrm.Page.ui.getFormType() == 5 || Xrm.Page.ui.getFormType() == 6) && !Xrm.Page.getAttribute(picklistField).getUserPrivilege().canUpdate)
        f = "disabled";
    var i = Xrm.Page.getAttribute(valueField).getValue() != null ? Xrm.Page.getAttribute(valueField).getValue().split(",") : "";
    for (var c in a)
        if (a[c].value != null && a[c].text != "") {
            if (($.inArray(a[c].value, i) != -1) || ($.inArray(a[c].value.toString(), i) != -1))
                g += "<LI title='" + a[c].text + "' style='margin: 0; padding: 0;'><LABEL id=lbl_" + displayField + "_" + d + " style='display: block;  background-color: white; margin: 0; padding: 0; width: 100%;' for=chk_" + displayField + "_" + d + "><INPUT " + f + " checked=true id=chk_" + displayField + "_" + d + " name=list_" + displayField + " value=" + a[c].value + " type=checkbox style='width: 20px'>" + a[c].text + "</LABEL> </LI>";
            else
                g += "<LI title='" + a[c].text + "' style='margin: 0; padding: 0;'><LABEL id=lbl_" + displayField + "_" + d + " style='display: block;  background-color: white; margin: 0; padding: 0; width: 100%;' for=chk_" + displayField + "_" + d + "><INPUT " + f + " id=chk_" + displayField + "_" + d + " name=list_" + displayField + " value=" + a[c].value + " type=checkbox style='width: 20px'>" + a[c].text + "</LABEL> </LI>";
            d++;
        }
    g += "</UL>";
    return g;
}

function setParentDispFieldData(c, d, a) {
    var b = $("#" + c + "_i", parent.document).val();
    if (b != null && b != "") {
        Xrm.Page.getAttribute(a).setValue(b);
        $("#" + a, parent.document).children().first().text(b);
    } else {
        Xrm.Page.getAttribute(a).setValue(null);
        $("#" + a, parent.document).children().first().text("--");
    }
    var e = Xrm.Page.getAttribute(d).getValue() != null ? Xrm.Page.getAttribute(d).getValue().split(",") : "";
    $("input[name=list_" + a + "]", parent.document).each(function () {
        if ($.inArray(this.value, e) != -1)
            this.checked = "checked";
        else
            this.checked = "";
    });
    $("#" + a, parent.document).attr("title", $("#" + c + "_i", parent.document).val());
}
function clearBPFMultiSelect(a, c, b) {
    $("#" + a, parent.document).children().first().text("click to enter");
    $("#" + a + "_i", parent.document).val("");
    Xrm.Page.getAttribute(c).setValue(null);
    Xrm.Page.getAttribute(b).setValue(null);
    $("input[name=list_" + a + "]", parent.document).each(function () {
        this.checked = false;
    });
}
function setBPFMultiSelectVisible(a, b) {
    if (b)
        $("#" + a, parent.document).parent().parent().css("display", "none");
    else
        $("#" + a, parent.document).parent().parent().css("display", "block");
}
function prePopulateBPFMultiSelect(a, b, d, c) {
    $("#" + a, parent.document).children().first().text(b);
    $("#" + a + "_i", parent.document).val(b);
    $("#container_" + a, parent.document).children().first().text(b);
    $("#container_" + a, parent.document).children().first().removeClass("ms-crm-Inline-EmptyValue");
    Xrm.Page.getAttribute(d).setValue(c);
}

