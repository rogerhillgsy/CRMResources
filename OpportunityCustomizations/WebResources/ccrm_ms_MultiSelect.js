/// <reference path="../Intellisense/Xrm.Page.2013.js"/>
function formatMultiSelect(picklistField, displayField, valueField, b, height, maxSelected, previousField) {
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
            Xrm.Page.ui.getFormType() == 4 ||
            Xrm.Page.ui.getFormType() == 5 ||
            Xrm.Page.ui.getFormType() == 6) &&
        $(document)
        .ready(function () {
            var locked = Xrm.Page.getControl(displayField).getDisabled();
            if (!locked) {
                $("#" + previousField, parent.document).keydown(function (e) {
                    var keyCode = e.keyCode || e.which;
                    if (keyCode == 9) {
                        e.preventDefault();
                        renderContent(displayField, picklistField, displayField, valueField, b, height, maxSelected);
                    }
                });
                $(parent.document).keydown(function (e) {
                    if (e.target.id == displayField+"_i") {
                        e.preventDefault();
                        renderContent(displayField, picklistField, displayField, valueField, b, height, maxSelected);
                    }
                    
                });
                $(parent.document).mousedown(function (e) {
                    if (e.target.offsetParent != null) {
                        if (e.target.offsetParent.id == displayField) {
                            if (Xrm.Page.ui.getFormType() != 4) {
                                var lockedAttr = $(e.target.offsetParent).attr("data-controlmode");
                                if (lockedAttr != "locked") {
                                    if ($("#" + displayField + "popup", parent.document).is(":visible") && e.target.offsetParent.id == displayField) {
                                        ProcessSelected(displayField, valueField);
                                    } else {
                                        renderContent(e.target.offsetParent.id, picklistField, displayField, valueField, b, height, maxSelected);
                                    }
                                }
                            }
                        }
                    }
                });
                $(window).on("unload", function () {
                    $(parent.document).off('mousedown');
                    $(parent.document).off('keydown');
                });
            }
            cleanMultiselectValues(picklistField, displayField);
            $(window)
                .resize(function () {
                    $("#container_" + displayField, parent.document).width($("#" + displayField + "_d").width());
                    $("#" + displayField + "_i", parent.document).width($("#" + displayField + "_0d1").width() - 35);
                    var c = $("#" + displayField, parent.document).width() / 5,
                        b = $("#" + displayField, parent.document).width(),
                        e = $("#tdAreas", parent.document).width(),
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
function renderContent(clickedFieldId, picklistField, displayField, valueField, j, height, maxSelected) {

    var heightS1 = height.toString();
    var heightS2 = (height - 55).toString();
    if (clickedFieldId != "btn" + displayField + "close" && clickedFieldId != "btn" + displayField + "cancel") {
        Xrm.Page.getControl(displayField).setFocus();
        var g = Xrm.Page.getAttribute(displayField).getValue()
          , c = $("#" + displayField + "_d", parent.document).html();
        c = c.substring(0, c.length - 6);
        if ($("#" + displayField + "popup", parent.document).css("display") != "block")
            if ($("#" + displayField + "popup", parent.document).length == 0) {
                var e, f = $("#" + displayField, parent.document).width() / 2, d = $("#" + displayField, parent.document).width(), l = $("#tdAreas", parent.document).width(), k = $("#" + displayField, parent.document).offset().left + d + 50;
                if (k < l)
                    f = d + 8;
                var messageDiv = "<div id='" + displayField + "_mess' ></div>"
                if (g == "")
                    e = "<div id='container_" + displayField + "' style='width:" + d + "px;z-index:" + j + ";position:absolute;'>" + c + '<div style=";width:335px; left:' + f + "px; top:-45px; position:absolute;height:" + heightS1 + "px;border:solid 1px #d7d7d7;background: white;\" id='" + displayField + "popup'><div style='height:" + heightS2 + "px'><img src=\"" + Xrm.Page.context.getClientUrl() + '/WebResources/ccrm_ms_notch" width="9" height="15" alt="image" style="float:left; margin-left:-9px; margin-top:45px;" /> <div id=\'' + displayField + "_l'  style='width:97%; \theight: " + heightS1 + "px;\tbackground-color: #ffffff;\tpadding: 5px;'>" + getMultiSelectHTML(picklistField, displayField, valueField, heightS2) + "</div>" + messageDiv + "<div align='right' style='height:32px;padding-top: 13px;padding-right: 10px;background-color: rgb(248, 248, 248);'><button  type='button' id='btn" + displayField + "close' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Done'>Done</button>&nbsp;&nbsp;&nbsp;&nbsp;<button  type='button' id='btn" + displayField + "cancel' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Cancel'>Cancel</button></div></div></div></div></div>";
                else
                    e = "<div id='container_" + displayField + "' style='width:" + d + "px;z-index:" + j + ";position:absolute;'>" + c + '<div style="width:335px; height:' + heightS1 + 'px; position:absolute; left:' + f + "px; top:-45px; border:solid 1px #d7d7d7;background: white;\" id='" + displayField + "popup'><div style='height:" + heightS1 + "px'><img src=\"" + Xrm.Page.context.getClientUrl() + '/WebResources/ccrm_ms_notch" width="9" height="15" alt="image" style="float:left; margin-left:-9px; margin-top:45px;" /> <div id=\'' + displayField + "_l'  style='position: relative; width:97%; \theight: " + heightS2 + "px;\tbackground-color: #ffffff;\tpadding: 5px;'>" + getMultiSelectHTML(picklistField, displayField, valueField, heightS2) + "</div>" + messageDiv + "<div align='right' style='height:32px;padding-top: 13px;padding-right: 10px;background-color: rgb(248, 248, 248);'><button  type='button' id='btn" + displayField + "close' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Done'>Done</button>&nbsp;&nbsp;&nbsp;&nbsp;<button type='button' id='btn" + displayField + "cancel' style='border: 1px solid rgb(198, 198, 198); width: 84px; height: 20px; text-align: center; color: rgb(38, 38, 38); overflow: visible; font-size: 11px; cursor: pointer; max-width: 125px; background-image:; background-color:white' title='Cancel'>Cancel</button></div></div></div></div></div>";

                $("#" + displayField + "_d", parent.document).html(e);
                if (!!maxSelected) {
                    //                    $("#" + displayField + "_mess").text("Hello world");
                    $("ul#" + displayField + "_ul > li > label > input", parent.document).click(function () { handleSelectionLimits(displayField, maxSelected) });
                    handleSelectionLimits(displayField, maxSelected);
                }
                $("#" + displayField + "_d", parent.document).height($("#" + displayField).height());
                $("#" + displayField + "popup", parent.document).css("display", "block");
                $("#" + displayField, parent.document).removeAttr("title");
                $("#" + displayField + "_i", parent.document).attr("readonly", true);
                $("#" + displayField + "popup", parent.document).focus();
                $("#btn" + displayField + "close", parent.document).css("background-image", "none");
                $("#btn" + displayField + "cancel", parent.document).css("background-image", "none");
                $("#btn" + displayField + "close", parent.document).mouseenter(function () {
                    $(this).css("border-width", "1px");
                    $(this).css("border-color", "rgb(146, 192, 224)");
                    $(this).css("background-color", "rgb(205, 230, 247)")
                });
                $("#btn" + displayField + "close", parent.document).mouseleave(function () {
                    $(this).css("border-width", "1px");
                    $(this).css("border-color", "rgb(198, 198, 198)");
                    $(this).css("background-color", "white")
                });
                $("#btn" + displayField + "cancel", parent.document).mouseenter(function () {
                    $(this).css("border-width", "1px");
                    $(this).css("border-color", "rgb(146, 192, 224)");
                    $(this).css("background-color", "rgb(205, 230, 247)")
                });
                $("#btn" + displayField + "cancel", parent.document).mouseleave(function () {
                    $(this).css("border-width", "1px");
                    $(this).css("border-color", "rgb(198, 198, 198)");
                    $(this).css("background-color", "white")
                });
                $("#" + displayField + "_i", parent.document).val(g)
            } else {
                $("#" + displayField + "popup", parent.document).css("display", "block");
                $("#" + displayField, parent.document).removeAttr("title");
                $("#" + displayField, parent.document).children().first().css("display", "none");
                $("#" + displayField + "_i", parent.document).parent().css("display", "block");
                var g = Xrm.Page.getAttribute(displayField).getValue();
                $("#" + displayField + "_i", parent.document).val(g);
                $("#" + displayField + "_i", parent.document).height($("#" + displayField, parent.document).children().first().height());
            }
        $("#btn" + displayField + "close", parent.document).click(function () {
            ProcessSelected(displayField, valueField);
        });

        $("#btn" + displayField + "cancel", parent.document).click(function () {
            CancelSelected(displayField, valueField);
        });
    }
}

function handleSelectionLimits(displayField, selectionLimit) {
    ///<summary>Deal with any limit on the total number of selected items that may have been imposed</summary>
    /// <param name="selectionLimit">Max number of multi-selection optionns that may be selected at one time.</param>
    if (!!selectionLimit && selectionLimit > 0) {
        var checkBoxes = $("ul#" + displayField + "_ul > li > label > input", parent.document);
        var checked = checkBoxes.filter(":checked");
        if (checked.length >= selectionLimit) {
            checked.prop("disabled", false);
            //            checked.each(function(i, a) { checkBoxes[i].prop("disabled", false) });
            var unChecked = checkBoxes.not(":checked");
            unChecked.prop("disabled", true);
            //            unChecked.each(function (i, a) { checkBoxes[i].prop("disabled", true) });
            $("#" + displayField + "_mess", parent.document).text("Selection is limited to " + selectionLimit.toString() + " choices").addClass("Notifications");
        } else {
            //            checkBoxes.each(function (i, a) { checkBoxes[i].prop("disabled", false) });
            checkBoxes.prop("disabled", false);
            $("#" + displayField + "_mess", parent.document).empty();
        }
    }
}

function ProcessSelected(a, b) {
    if (a.id != null)
        a = a.id;
    if (b.id != null)
        b = b.id;
    var e = Xrm.Page.getAttribute(b).getValue()
      , c = setMultiSelect(a, b);
    Xrm.Page.getAttribute(a).setValue(c.text);
    $("#" + a, parent.document).val(c.text);
    $("#" + a, parent.document).attr("title", c.text);
    Xrm.Page.getAttribute(b).setValue(c.val);
    $("#" + b, parent.document).val(c.val);
    $("#" + a + "popup", parent.document).css("display", "none");
    if (c.text != "") {
        $("#" + a, parent.document).children().first().text(c.text);
        $("#" + a + "_i", parent.document).val(c.text)
    } else {
        $("#" + a, parent.document).children().first().text("--");
        $("#" + a + "_i", parent.document).val("")
    }
    $("#" + a + "_d", parent.document).height($("#" + a, parent.document).children().first().height() + 5);
    $("#" + a + "_i", parent.document).height($("#" + a, parent.document).children().first().height() + 5);
    $("#" + a + "_i", parent.document).parent().css("display", "none");
    $("#" + a, parent.document).children().first().css("display", "block");
    $("#" + a, parent.document).children().first().mouseenter(function () {
        $("#" + a + "popup", parent.document).css("display") != "block" && $(this).addClass("ms-crm-Inline-EditHintState")
    });
    $("#" + a, parent.document).children().first().mouseleave(function () {
        $(this).removeClass("ms-crm-Inline-EditHintState")
    });
    $("#" + a + "_c", parent.document).mouseenter(function () {
        $("#" + a + "popup", parent.document).css("display") != "block" && $("#" + a, parent.document).children().first().addClass("ms-crm-Inline-EditHintState")
    });
    $("#" + a + "_c", parent.document).mouseleave(function () {
        $("#" + a + "popup", parent.document).css("display") != "block" && $("#" + a, parent.document).children().first().removeClass("ms-crm-Inline-EditHintState")
    });
    var d = Xrm.Page.getAttribute(b).getValue();
    e != d && Xrm.Page.getAttribute(b).fireOnChange();
    if ($('#container_header_process_' + a, parent.document).children().first().text() != $("#" + a, parent.document).children().first().text()) {
        if (Xrm.Page.getAttribute(b).getValue() == null) {
            $('#container_header_process_' + a, parent.document).children().first().text("click on enter");
            $('#header_process_' + a + '_i', parent.document).val("");
        }
        else {
            $('#container_header_process_' + a, parent.document).children().first().text($("#" + a, parent.document).children().first().text());
            $('#header_process_' + a + '_i', parent.document).val($('#' + a + '_i', parent.document).val());
            $('#container_header_process_' + a, parent.document).children().first().removeClass("ms-crm-Inline-EmptyValue")
        }
        var i = Xrm.Page.getAttribute(b).getValue() != null ? Xrm.Page.getAttribute(b).getValue().split(",") : "";

        $('#header_process_' + a + '_ul li label input', parent.document).each(function () {
            if ($.inArray($(this).val(), i) != -1)
                $(this).prop("checked", true);
            else
                $(this).removeAttr("checked");
        })
    }
}
function CancelSelected(a, b) {
    if (a.id != null)
        a = a.id;
    if (b.id != null)
        b = b.id;
    $("#" + a + "popup", parent.document).css("display", "none");
    var c = Xrm.Page.getAttribute(b).getValue() != null ? Xrm.Page.getAttribute(b).getValue().split(",") : "";
    $("input[name=list_" + a + "]", parent.document).each(function () {
        if ($.inArray(this.value, c) != -1)
            this.checked = "checked";
        else
            this.checked = ""
    });
    $("#" + a, parent.document).attr("title", Xrm.Page.getAttribute(a).getValue());
    Xrm.Page.getAttribute(a).setValue(Xrm.Page.getAttribute(a).getValue());
    $("#" + a + "_i", parent.document).parent().css("display", "none");
    $("#" + a, parent.document).children().first().css("display", "block");
    $("#" + a, parent.document).children().first().mouseenter(function () {
        $("#" + a + "popup", parent.document).css("display") != "block" && $(this).addClass("ms-crm-Inline-EditHintState");
        $("#" + a + "_d", parent.document).height($("#" + a).height())
    });
    $("#" + a, parent.document).children().first().mouseleave(function () {
        $(this).removeClass("ms-crm-Inline-EditHintState")
    });
    $("#" + a + "_c", parent.document).mouseenter(function () {
        $("#" + a + "popup", parent.document).css("display") != "block" && $("#" + a).children().first().addClass("ms-crm-Inline-EditHintState")
    });
    $("#" + a + "_c", parent.document).mouseleave(function () {
        $("#" + a, parent.document).children().first().removeClass("ms-crm-Inline-EditHintState")
    })
}
function setMultiSelect(d) {
    var b = ""
      , a = "";
    $("input[name=list_" + d + "]:checked", parent.document).each(function () {
        b += this.value + ",";
        a += this.nextSibling.data + ", "
    });
    if (b.substring(b.length - 1) == ",")
        b = b.substring(0, b.length - 1);
    if (a.substring(a.length - 2) == ", ")
        a = a.substring(0, a.length - 2);
    var c = {};
    c.text = a;
    c.val = b;
    return c
}

function getMultiSelectHTML(picklistField, displayField, valueField, height) {
    var a = Xrm.Page.getAttribute(picklistField).getOptions()
      , g = "<UL id='" + displayField + "_ul' style='height: " + height + "px; overflow: auto; width: 100%; background-color: white; border: 0px solid #C4C8CE; list-style-type: none; margin: 0; padding-top: 7px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; overflow-x: hidden;'>"
      , d = 0
      , f = ""
      , j = Xrm.Page.getAttribute(picklistField).getUserPrivilege().canCreate;
    /*a.sort(function compare(a, b) {
        if (a.text == "Other") return 1;
        if (b.text == "Other") return -1;
        if (a.text < b.text)
            return -1;
        if (a.text > b.text)
            return 1;
        return 0;
    });*/
    if (Xrm.Page.ui.getFormType() == 1 && !Xrm.Page.getAttribute(picklistField).getUserPrivilege().canCreate)
        f = "disabled";
    else if ((Xrm.Page.ui.getFormType() == 2 || Xrm.Page.ui.getFormType() == 5 || Xrm.Page.ui.getFormType() == 6) && !Xrm.Page.getAttribute(picklistField).getUserPrivilege().canUpdate)
        f = "disabled";
    var i = Xrm.Page.getAttribute(valueField, height).getValue() != null ? Xrm.Page.getAttribute(valueField, height).getValue().split(",") : "";
    for (var c in a)
        if (a[c].value != null && a[c].text != "") {
            if (($.inArray(a[c].value, i) != -1) || ($.inArray(a[c].value.toString(), i) != -1))
                g += "<LI title='" + a[c].text + "' style='margin: 0; padding: 0;'><LABEL id=lbl_" + displayField + "_" + d + " style='display: block;  background-color: white; margin: 0; padding: 0; width: 100%;' for=chk_" + displayField + "_" + d + "><INPUT " + f + " checked=true id=chk_" + displayField + "_" + d + " name=list_" + displayField + " value=" + a[c].value + " type=checkbox style='width: 20px'>" + a[c].text + "</LABEL> </LI>";
            else
                g += "<LI title='" + a[c].text + "' style='margin: 0; padding: 0;'><LABEL id=lbl_" + displayField + "_" + d + " style='display: block;  background-color: white; margin: 0; padding: 0; width: 100%;' for=chk_" + displayField + "_" + d + "><INPUT " + f + " id=chk_" + displayField + "_" + d + " name=list_" + displayField + " value=" + a[c].value + " type=checkbox style='width: 20px'>" + a[c].text + "</LABEL> </LI>";
            d++
        }
    g += "</UL>";
    return g
}

function setBPFData(d, c, a) {
    var b = Xrm.Page.getAttribute(d).getValue()
      , e = Xrm.Page.getAttribute(c).getValue() != null ? Xrm.Page.getAttribute(c).getValue().split(",") : "";
    $("input[name=list_" + a + "]").each(function () {
        if ($.inArray(this.value, e) != -1)
            this.checked = "checked";
        else
            this.checked = ""
    });
    if (b != null && b != "") {
        $("#" + a + "_i", parent.document).val(b);
        $("#container_" + a, parent.document).children().first().removeClass("ms-crm-Inline-EmptyValue");
        $("#container_" + a, parent.document).children().first().text(b)
    } else {
        $("#" + a + "_i", parent.document).val("");
        $("#container_" + a, parent.document).children().first().text("click to enter")
    }
}
function clearMultiSelect(a, b) {
    $("#" + a, parent.document).children().first().text("--");
    $("#" + a + "_i", parent.document).val("");
    Xrm.Page.getAttribute(a).setValue(null);
    Xrm.Page.getAttribute(b).setValue(null);
    $("input[name=list_" + a + "]").each(function () {
        this.checked = false
    })
}
function setMultiSelectVisible(a, b) {
    if (b) {
        $("#" + a + "_c", parent.document).css("display", "block");
        $("#" + a + "_d", parent.document).css("display", "block")
    } else {
        $("#" + a + "_c", parent.document).css("display", "none");
        $("#" + a + "_d", parent.document).css("display", "none")
    }
}
function prePopulateMultiSelect(b, a, d, c) {
    $("#" + b, parent.document).children().first().text(a);
    $("#" + b + "_i", parent.document).val(a);
    $("#" + d + "_i", parent.document).val(c);
    Xrm.Page.getAttribute(b).setValue(a);
    Xrm.Page.getAttribute(d).setValue(c)
}
