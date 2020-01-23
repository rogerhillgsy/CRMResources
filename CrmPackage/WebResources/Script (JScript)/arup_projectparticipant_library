function FormOnload() 
{

    setup_display_other_field("arup_participantrole_val", "arup_role_other_text", "770000061");
	 //setTimeout(function () { WindowSizw(); }, 2000);
	
}

function setup_display_other_field(otherNetworksVal, otherNetworksDetail, otherCodeValue, isToBeHidden) {
    /// <summary>Setup multi-select picklist so that when "other" is selected, a text field is activated to allow the user to enter the details.</summary>
    var isOtherFieldRequired = otherCodeValue;
    if (typeof (otherCodeValue) != "function") {
        isOtherFieldRequired = function (v) { return typeof (v) == "string" && v.search(otherCodeValue) > -1 || v == otherCodeValue };
    }
    isToBeHidden = isToBeHidden == null ? true : isToBeHidden;
    var attribute = Xrm.Page.getAttribute(otherNetworksVal);
    if (!!attribute) {
        attribute.addOnChange(function () {
            display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        });

        // Do this twice as header fields get their requirement level set after the onload function runs.
        display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        setTimeout(function () {
            display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        },
            1000);
    }
}
function WindowSizw() {
	$( document ).ready(function() 
	{
		var _win = window.self;
   _win.resizeTo(4000,700);
   
   //resizePage();
   
   });   //window.moveTo(5, 5);
}

function resizePage(){
    var width = 600;
    var height = 400;
    window.resizeTo(width, height);
    window.moveTo(((screen.width - width) / 2), ((screen.height - height) / 2));      
  }

function display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden) {
    var value = Xrm.Page.getAttribute(otherNetworksVal).getValue();
    var otherNetworkDetails = Xrm.Page.getControl(otherNetworksDetail);

    if (!!otherNetworkDetails) {
        if (!!value && isOtherFieldRequired(value)) {
            otherNetworkDetails.getAttribute().setRequiredLevel("required");
            otherNetworkDetails.setVisible(true);
        } else {
            otherNetworkDetails.getAttribute().setRequiredLevel("none");
            if (isToBeHidden) {
                otherNetworkDetails.setVisible(false);
            }
        }
    }
}
