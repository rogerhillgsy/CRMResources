/// <reference path="arup_exitFormFunctions.js"/>"/>

/**
 * @description Form onload event for Project Collaborator main form.
 * @param {any} executionContext
 */
function FormOnload(executionContext) {
    participantRole_onChange(executionContext);

}

/**
 * @description Called from the command bar exit button
 * @param {any} formContext
 */
function exitForm(formContext) {
    ArupExit.exitForm(formContext);
}

/**
 *  @description Called from CRM as on Change event on participantRole.
 *  @param {any} executionContext
 */
function participantRole_onChange(executionContext) {

    var formContext = executionContext.getFormContext();
    var valueExists = false;

    var role = formContext.getAttribute("arup_collaboratorrole").getText();
    if (role != null) { valueExists = role.indexOf('Other') !== -1; }
    switch (valueExists) {

        case true:
            formContext.getControl("arup_role_other_text").setVisible(true);
            formContext.getAttribute("arup_role_other_text").setRequiredLevel('required');
            break;

        default:
            formContext.getControl("arup_role_other_text").setVisible(false);
            formContext.getAttribute("arup_role_other_text").setRequiredLevel('none');
            formContext.getAttribute("arup_role_other_text").setValue(null);            
            break;
    }

}
