function hidePlusSign(formContext, subGridEntityName) {

    var showAddSign = true;
    var entity = formContext.data.entity.getEntityName();

    switch (subGridEntityName) {

        case 'account':
            if (entity == 'team') { showAddSign = false; }
            break;

        case 'appointment':
            if (entity == 'team') {
                showAddSign = DisplayNewByTab(formContext);
            }
            break;
        case 'task':
            if (entity == 'team') {
                showAddSign = DisplayNewByTab(formContext);
            }
            break;
        case 'phonecall':
            if (entity == 'team') {
                showAddSign = DisplayNewByTab(formContext);
            }
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

function DisplayNewByTab(formContext) {
    var showAddSign = true;
    var futureActivityTab = formContext.ui.tabs.get("Future_Activities_tab");
    var recentActivityTab = formContext.ui.tabs.get("Recent_Activities_tab");
    if (futureActivityTab != null && futureActivityTab.getDisplayState() == "expanded")
        showAddSign = true;
    else if (recentActivityTab != null && recentActivityTab.getDisplayState() == "expanded")
        showAddSign = false;

    return showAddSign;
}