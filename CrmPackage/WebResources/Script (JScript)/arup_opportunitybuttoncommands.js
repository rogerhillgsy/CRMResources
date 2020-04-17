//
// Ensure that the javascript commands required in arup_opportunitybuttons.html are accessible.
//
// Normally javascript functions are not visible from the Web resource in an iframe.
// By attaching them to Xrm.Page, they are then visible and callable from within the iframe.

Xrm.Page.Arup = {};

Xrm.Page.Arup.BidDicisionConfirmation = function() {
    BidDicisionConfirmation();
}

Xrm.Page.Arup.BPFMoveNext= function () {
    BPFMoveNext();
}