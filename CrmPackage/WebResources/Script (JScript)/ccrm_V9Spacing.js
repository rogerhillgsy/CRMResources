function testspacing()
{
if (!window.parent.document.querySelector('style#v9removepadding')) {
    var style = window.parent.document.createElement('style');
    style.id = "v9removepadding";
    style.innerText = ".acwallEmailView .emailexpandedaccordion { margin:0; width:100% } TABLE.ms-crm-FormSection td { padding: 4px 1px 1px 16px !important; min-height: 26px; }";
    window.parent.document.body.appendChild(style);
}
}