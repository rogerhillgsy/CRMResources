function Form_onload()
{
//  OnLoad
// POPUP 
// Routines

// Hold current list of items
var fldItems = new Array();

// Create an attribute record
/* function for the defining of the lookup item */
function fldItem(sName, sDisplay)
{
    this.Name = sName;
    this.Label = sDisplay;
}
/* end function */

function sortit(a,b)
{
    var retVal = 0;
    var aName = a.Label;
    var bName = b.Label;
    
    if (aName > bName)
    {
        retVal = 1;
    }
    
    if (aName == bName)
    {
        retVal = 0;
    }
    
    if (aName < bName)
    {
        retVal = -1;
    }
    
    return retVal;
}

createAttributePopUp=function(entityName)
{
    getAttributes(entityName);
    
    // Delete the existing Div        
    try
    {
       var node = document.getElementById('crmFlds')
       node.parentNode.removeChild(node);
    }
    catch (ex)
    {}
    
    var sortedItems = new Array();
    sortedItems = fldItems.sort(sortit);
        
    //  Create a DIV
//    var addDiv = document.createElement("<div id ='crmFlds' style='overflow-y:auto; height:280px; border:1px #6699cc solid; background-color:#ffffff;' />");  
    var addDiv = document.createElement("<div id ='crmFlds'  />");  
    var tAble = document.createElement("<TABLE id='ccrmtable' style='TABLE-LAYOUT: fixed' height='1%' cellSpacing=0 cellPadding=3 width='100%' valign='top' />");
    var tBody = document.createElement("<TBODY id='ccrmtbody' />");
    
    var fld =  crmForm.all.ccrm_fld;
    //debugger;
    fld.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(addDiv);
   
    var fldDiv = document.getElementById('crmFlds');
        
    for(var i=0; i < sortedItems.length; i++)
    {
        var tr = document.createElement("<TR />");
    
        for(var row=0; row < 4; row++)
        {
            if (row+i <= sortedItems.length-1)
            {
                var td = document.createElement("<TD/>");
            
                var addInput = document.createElement("<input type='checkbox' style='border:none; width:25px; align:left;' />" );  
                addInput.setAttribute("value",row+i);

                var addLabel = document.createElement( "<label/>");  
                addLabel.innerText = sortedItems[row+i].Label;
           
                var addBr = document.createElement( "<br/>"); 
           
                td.appendChild(addInput);  
                td.appendChild(addLabel);  
                //td.appendChild(addBr);  
                
                tr.appendChild(td);
            }
        }
        i = i+4 -1 ; // loop wil increment the 1
        
        tBody.appendChild(tr);
    }
    
    tAble.appendChild(tBody);
    fldDiv.appendChild(tAble);
    
   return false;
}

getAttributes = function(entityName)
{
        fldItems = new Array();

        var xmlObj = CreateXmlDocument(false);
        //var xmlDoc = new ActiveXObject("Microsoft.XMLDOM"); 
        xmlObj.async=false; 
        //xmlDoc.onreadystatechange=verify; 
        xmlObj.load('/ISV/ConsultCrm/Audit/Schema/' + ORG_UNIQUE_NAME + '/' + entityName + '.xml'); 
    
        // Now push to an array
        var xPath = 'attributes/attribute';
        var show;
        
        for (var entityNode=0; entityNode < xmlObj.selectNodes(xPath).length; entityNode++)
        {
            var fld = "";
            var label = "";
        
            fld = xmlObj.selectNodes(xPath).item(entityNode).getAttribute("schemaname");
            
            // Copy name to label
            label = fld;

            // Current user label
            label = xmlObj.selectNodes(xPath).item(entityNode).getAttribute("displayname");

            attribItem = new fldItem();
            attribItem.Name = fld;
            attribItem.Label = label;
            
            fldItems.push(attribItem);
                       
        }
        
 
        return true;

}

OnSave = function()  
{
    //var fldDiv = document.getElementById('crmFlds');

    //var getInput = crmForm.all.ccrm_fld.nextSibling.getElementsByTagName("input");  
    var getInput = document.getElementById('crmFlds').getElementsByTagName("input");  
    
    crmForm.all.ccrm_attributes.value = "";

    for( var i = 0; i < getInput.length; i++ )  
    {  
        if( getInput[i].checked)  
        {  
            crmForm.all.ccrm_attributes.value += fldItems[getInput[i].getAttribute("value")].Name + ",";
        }  
    }  
}  

// Populate the CheckBoxes from the stored values
populateCheckBoxes = function()
{
    var attrArray = crmForm.all.ccrm_attributes.value.split(",");
    var attrArrayLen = (attrArray.length-1);
    
    // Define the checkboxs
    var getInput = document.getElementById('crmFlds').getElementsByTagName("input");  

    // for each defined checkbox
    for( var chkBox = 0; chkBox < getInput.length; chkBox++ )  
    {  
    
        // Loop through each
        for(i=0; i<attrArrayLen; i++)
        {
           if (attrArray[i] == fldItems[getInput[chkBox].getAttribute("value")].Name)
           {
                getInput[chkBox].checked = true;
           }
        }    

    }  

}

// Main SetupCode
// Hide the "to hide section"
document.getElementById("ccrm_attributes_d").parentNode.parentNode.style.display = "none";

// Save the selected text, this filed can also be used in Advanced Find  
crmForm.attachEvent( "onsave" , OnSave);  

// Hide the fld
crmForm.all.ccrm_fld.style.display="none";


// show attributes
createAttributePopUp(crmForm.all.ccrm_entitynames.DataValue);
populateCheckBoxes();
}
function ccrm_entitynames_onchange()
{
crmForm.all.ccrm_attributes.DataValue = "";

createAttributePopUp(crmForm.all.ccrm_entitynames.DataValue);

crmForm.all.ccrm_name.DataValue = 'Audit - ' + crmForm.all.ccrm_entitynames.SelectedText;
}
function ccrm_name_onchange()
{

}
