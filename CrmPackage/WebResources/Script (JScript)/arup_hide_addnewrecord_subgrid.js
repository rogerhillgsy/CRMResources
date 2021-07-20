function hidePlusSign(formContext, subGridEntityName) {

    var showAddSign = true;
    var entity = formContext.data.entity.getEntityName();

    switch (subGridEntityName) {

        case 'account':
            if (entity == 'team') { showAddSign = false; }
            break;

        //case 'lead':
        //    if (entity == 'account') { showAddSign = false; }
        //    break;

        //case 'contact':
        //    if (entity == 'account') { showAddSign = false; }
        //    break;

        case 'opportunity':
            if (entity == 'account') { showAddSign = true; }
            else if (entity == 'arup_framework') { showAddSign = false; }
            break;

        case 'systemuser':
            if (entity == 'team') {

            var securityTeam = formContext.getAttribute("arup_securityteam").getValue() == null ? false : formContext.getAttribute("arup_securityteam").getValue();
            var teamAdmin = formContext.getAttribute("administratorid").getValue()[0].id.replace('{', '').replace('}', '').toUpperCase();
            var currentUser = formContext.context.getUserId().replace('{', '').replace('}', '').toUpperCase();
            securityRoles = ['arup support enterprise', 'system administrator'];
            var isSecuredUser = userWithRole(securityRoles);
            showAddSign = securityTeam == false || teamAdmin == currentUser || isSecuredUser == true ? true : false;
            
            break;

            }
    }

    return showAddSign;
}

function userWithRole(securityRoles) {

    var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
    if (roles === null) return false;

    var hasRole = false;

    roles.forEach(function (item) {

        if (securityRoles.includes(item.name.toLowerCase())) { hasRole = true; }
        
    });

    return hasRole;
}