var MyForm = (function () {
    function MyForm() {
    }
    MyForm.OnLoad = function (executionContext) {
        var formContext = executionContext.getFormContext();
        var attrContactName;
        attrContactName = formContext.getAttribute('firstname').getValue();
        formContext.ui.setFormNotification("My Typescript is now loaded!: this is the firstname:" + attrContactName, "INFO", "ts-msg");
    };
    return MyForm;
}());
//# sourceMappingURL=MyForm.js.map