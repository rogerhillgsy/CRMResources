//call the saveMultiSelect function of the Multiselect html web resource on save of the form.
function multiSelectOnSave(executionObject) {
    Xrm.Page.getControl(executionObject).getObject().contentWindow.window.saveMultiSelect();
}