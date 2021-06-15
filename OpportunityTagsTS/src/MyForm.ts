
class MyForm {
    static OnLoad(executionContext: any) {
        const formContext = executionContext.getFormContext();

        let attrContactName: Xrm.Attributes.StringAttribute;
        attrContactName = formContext.getAttribute('firstname').getValue();

        formContext.ui.setFormNotification("My Typescript is now loaded!: this is the firstname:" + attrContactName, "INFO", "ts-msg");
    }
}