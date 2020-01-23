// Newsfeed 
function newsfeed() {
    var Name = Xrm.Page.getAttribute("name").getValue();
    var URL = "http://ps.moreover.com/page?query=%22" + Name + "%22&o=html&client_id=arup_set_ar53";

    if (URL != "") {
        //alert(URL);
        Xrm.Page.getControl("IFRAME_News").setSrc(URL);
    }
}