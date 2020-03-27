function instrumentPage() {

    var r = document, f = window, e = "head", s = "script", o = r.createElement(s);
    o.src = "https://arupdev.arup.com//WebResources/ccrm_nr_agent";
    r.getElementsByTagName(e)[0].parentNode.appendChild(o);

}

instrumentPage();
