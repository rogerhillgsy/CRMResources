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
    }




    return showAddSign;
}

