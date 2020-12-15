//
// Ensure that the javascript commands required in arup_FrameworkButtons.html are accessible.
//
// Normally javascript functions are not visible from the Web resource in an iframe.
// By attaching them to Parent, they are then visible and callable from within the iframe.
//
// The main entry points to the button functionality that are important in this file are: -
// - DisplayTab
// - OnTabStateChange
//
// DisplayTab-This is called when the page first loads (FormOnLoad, as defined in the form properties)
// OnTabStateChange is called when the displayed BPF stage change. It is called to refresh 
//  any buttons that may be displayed are updated(to change visibility, etc.)

Arup = (
    function () {
        Log = console.log.bind(window.console);
        var tabStateChangeCallbackAdded = false;
        var buttonChangeCallbacks = {};


        var obj = {
            ButtonState: {
                ActiveTab: "Summary"
            },

            // Functions related to specific buttons ---------------------

          
            OpenSecuredFramework: function (formContext) {
                openSecuredFramework(formContext);
            },

            OpenFrameworkRecord: function (formContext) {
                OpenFrameworkRecord(formContext);
            },
          
            // General Utility functions ----------------------
         
            GetTabNumber: function (formContext, tabName) {
                var tabs = formContext.ui.tabs.get();
                var tabNum = null;
                for (var t in tabs) {
                    var tab = tabs[t];
                    if (tab.getName() == tabName) {
                        tabNum = t;
                    }
                }
                return tabNum;
            },


            // Entry point from the form properties.
            // This is set up as en event handler to be called from the Framework form.
            // Display the active tab according to the current stage.
            DisplayTab: function (executionContext, tabName) {
                var formContext = executionContext.getFormContext();
                var tab = formContext.ui.tabs.get(tabName);
                tab.setFocus();
                tab.setVisible(true);
                var tabDisplayState = tab.getDisplayState();
                if (tabDisplayState != "expanded")
                    tab.setDisplayState("expanded");

                if (buttonChangeCallbacks[tabName] != null) {
                    buttonChangeCallbacks[tabName]();
                }
                Arup.ActiveTabName = tabName;
                return tabName;
            },

            OnDisplayingTab: function (formContext, tabName, callback) {
                buttonChangeCallbacks[tabName] = callback;
                if (!tabStateChangeCallbackAdded) {
                    tabStateChangeCallbackAdded = true;
                    var tabs = formContext.ui.tabs.get();
                    for (var t in tabs) {
                        var tab = tabs[t];
                        tab.addTabStateChange(OnTabStateChange);
                    }
                }

            },
        };



        function OnTabStateChange(e) {
            var source = e.getEventSource();
            var formContext = e.getFormContext();
            if (source.getDisplayState() == "collapsed") {
                Arup.PreviousTab = source.getName();
            }
            if (source.getDisplayState() == "expanded") {
                var tabName = source.getName();
                Log("Tab expanded :" + tabName);
                if (buttonChangeCallbacks[tabName] != null) {
                    buttonChangeCallbacks[tabName]();
                }
            }
        }

        return obj;
    })();

parent.Arup = Arup;



