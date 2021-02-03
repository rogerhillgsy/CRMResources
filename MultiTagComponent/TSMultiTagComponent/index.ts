import { isArray } from "util";
import {IInputs, IOutputs} from "./generated/ManifestTypes";

interface Popup extends ComponentFramework.FactoryApi.Popup.Popup {
    popupStyle: object;
    //shadowStyle: object;
}

interface TagValueSource {
    /** Return a semicolon separated list of tag values via the updateTagValues callback. */
    // getAvailableTagValues( context: ComponentFramework.Context<IInputs>, updateTagValues: () => string  ) : void;
    getAvailableTagValues( context: ComponentFramework.Context<IInputs> ) : Promise<string>;
}

class testTagValues implements TagValueSource {
    constructor(){
    }

    public getAvailableTagValues( ) : Promise<string> {
        return new Promise<string> ((resolve,reject) => {
            resolve("Tag4;Tag2;Tag1;Tag2;Tag3");
        });
    }
}
/**
 * Get tag values from the arup_pcfstore entity.
 */
class tagsFromPCFValuesStore implements TagValueSource {
    private _availableTagValues: string = "";
    private _currentDependentFieldValue = "";
    private readonly _pcfDependentEntity: string;
    private readonly _pcfValueStoreEntity = "arup_pcfvaluesstore";
    constructor(entityName: string) {
        this._pcfDependentEntity = entityName;
    }

    public getAvailableTagValues(context: ComponentFramework.Context<IInputs>): Promise<string> {
        // let fieldname: string = "arup_pcfvalues";
        // let entityTypeName = "arup_pcfvaluesstore";
        // Get a semicolon separated list of services for which we will obtain available tag values
        const services = context.parameters.DependentField.raw;

        return new Promise<string>((resolve, reject) => {
            if (this._currentDependentFieldValue.localeCompare(services) == -1) {
                // Dependent field value unchanges, so return existing tag value list.
                resolve(this._availableTagValues)
            } else {
                // The dependent field contains a semicolon separated list of values. 
                // For each value in the list we will get the related list of available tag values
                // from arup_pcfvaluesstore
                // The combined set of tags from the value store will be returned.
                this._currentDependentFieldValue = services;

                let pcfDependentEntity = this._pcfDependentEntity;
                let pcfDependentFieldName = context.parameters.TagValue.attributes?.LogicalName;
                let dependentFieldValueFilter = this._currentDependentFieldValue.split(';').
                    map(function (val: string) { return "arup_pcfdependentfieldvalue eq '" + encodeURIComponent(val) + "'" }).
                    join(" or ");

                let queryString: string = "?$select=arup_pcfvalues&$filter=arup_dependententity eq '" + pcfDependentEntity + "' and arup_name eq '" + pcfDependentFieldName + "' and (" + dependentFieldValueFilter + ")";

                context.webAPI.retrieveMultipleRecords(this._pcfValueStoreEntity, queryString).then(
                    (response) => {
                        // TODO: dedupe the list of tags.
                        this._availableTagValues = response.entities.map(function (v) { return v.arup_pcfvalues }).join(";");
                        resolve(  this._availableTagValues);
                    },
                    function (errorResponse: any) {
                        reject("ERROR::" + errorResponse.message);
                    }
                );
            } 
        });
    }
}

export class ArupMultiTagComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _context: ComponentFramework.Context<IInputs>; // ?? Is this valid as it probably changes from one call to the next?
    private _container : HTMLDivElement;
    private _tagValueSource : TagValueSource;

    private _containerBox: HTMLDivElement;
    private _innerContainer: HTMLDivElement;
    private _spanElement: HTMLSpanElement;
    private _tagElement: HTMLDivElement;
    private _tagContent: HTMLDivElement;
    private _tagClose: HTMLAnchorElement;
    private _taggedValues: string[];
    private _currentValues: string;
    private _availableValues: string;
    private _availableTags: string[];
    private _tagValueFieldName: string;
    private _dependentField: any;
    private _dependentFieldValue: string;
	private _notifyOutputChanged: () => void;
    //private _popUpService: ComponentFramework.FactoryApi.Popup.PopupService;
    private _availableTagContainer: HTMLDivElement;
	//private _entity: ComponentFramework.EntityReference;

	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
        // Save context
		this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;

        // Get current tag list
        if (context.mode.label == "TestLabel") {
            this._tagValueSource = new testTagValues();
        } else {
            this._tagValueSource = new tagsFromPCFValuesStore("opportunity");
        }

        // Set current tag values
        let currentValues: string = context.parameters.TagValue.raw ? context.parameters.TagValue.raw : "";
        this.setCurrentTagValues(currentValues);

        // // Get available tag values
        // this._tagValueSource.getAvailableTagValues(context).then(
        //     // Resolve
        //     this.displayTags.bind(this),
        //     // Reject
        //     (error: string) => {
        //         console.log(`Error getting available tag values: ${error}`)
        //     }
        // );
        

        // // @ts-ignore         
        // this._tagValueFieldName = this._context.parameters.TagValue.attributes.LogicalName;
        // let fieldname: string = "arup_pcfvalues";//this._tagValueFieldName;
        // let dependentFieldValue = context.parameters.DependentField.raw;
        // let dependentFieldType = typeof (dependentFieldValue);

        // if (dependentFieldType == "object") {
        //     this._dependentField = context.parameters.DependentField.raw[0].TypeName ? context.parameters.DependentField.raw[0].TypeName : "";
        //     this._dependentFieldValue = context.parameters.DependentField.raw[0].Name;

        // let queryString: string = "?$select=" + fieldname+"&$filter=arup_name eq '" + this._dependentField + "' and " + "arup_pcfdependentfieldvalue eq '" + encodeURIComponent(this._dependentFieldValue) + "'";
        // let currentValues: string = context.parameters.TagValue.raw ? context.parameters.TagValue.raw : "";

        //(<any>context.mode).contextInfo.entityId;
        // let entityTypeName = "arup_pcfvaluesstore";//(<any>context.mode).contextInfo.entityTypeName;
        //this.getAvailableTags(entityTypeName, queryString);
        // let entityTypeName="opportunity",queryString="";
		// context.webAPI.retrieveMultipleRecords(entityTypeName, queryString).then(
        //     (response) => {
        //         this._availableValues = response.entities.map( function(v ) { return v.arup_pcfvalues}).join(";");

        //         this.setCurrentTagValues( currentValues);
                
        //         this._availableTags = this._availableValues.split(";").filter(x => !this._taggedValues.includes(x));
        //         this._availableTagContainer.innerHTML = "";
        //         this.loadAvailableTags();
        //         //this._inputElement.addEventListener("click", this.onClick.bind(this));
        //         this._containerBox.appendChild(this._innerContainer);
        //         //this._containerBox.appendChild(this._inputElement);
        //         this._container.appendChild(this._containerBox);
        //         this._container.appendChild(this._spanElement);
        //         this._container.appendChild(this._availableTagContainer);
		// 	},
		// 	function(errorResponse: any) {
		// 		console.log("ERROR::" + errorResponse.message);
		// 	}
        // );
        // } else {
        //     this._dependentField = this._tagValueFieldName;
        //     this._dependentFieldValue = dependentFieldValue;
        //     this.UpdateDependentFieldTypeString(context, this._dependentFieldValue)
        // }
    }

    	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
        /*let entityId = (<any>context.mode).contextInfo.entityId;
        let entityTypeName = (<any>context.mode).contextInfo.entityTypeName;*/
        this._context = context;
        //console.log("=========>>"+context.updatedProperties.toString());
        let dependentFieldType = typeof(context.parameters.DependentField.raw);

          // Set current tag values
          let currentValues: string = context.parameters.TagValue.raw ? context.parameters.TagValue.raw : "";
          this.setCurrentTagValues(currentValues);
  
          // Get available tag values
          this._tagValueSource.getAvailableTagValues(context).then(
              // Resolve
              this.displayTags.bind(this),
              // Reject
              (error: string) => {
                  console.log(`Error getting available tag values: ${error}`)
              }
          );

        // if (dependentFieldType == "object" && context.updatedProperties.indexOf("DependentField") != -1) {
        //     if (this._dependentFieldValue.localeCompare(context.parameters.DependentField.raw[0].Name) != 0) {
        //         this._dependentFieldValue = context.parameters.DependentField.raw[0].Name;
        //         let fieldname: string = "arup_pcfvalues";
        //         let entityTypeName = "arup_pcfvaluesstore";
        //         let queryString: string = "?$select=" + fieldname+"&$filter=arup_name eq '" + this._dependentField + "' and " + "arup_pcfdependentfieldvalue eq '" + encodeURIComponent(this._dependentFieldValue) + "'";
        //         context.webAPI.retrieveMultipleRecords(entityTypeName, queryString).then(
        //             (response) => {
        //                 this._availableValues = response.entities.map( function(v ) { return v.arup_pcfvalues}).join(";");

        //                 if (!this._currentValues) {
        //                     this._taggedValues = [];
        //                     this._innerContainer.classList.add("hideBlock");
        //                 }
        //                 else {
        //                     this._innerContainer.classList.add("displayBlock");
        //                     this._taggedValues = this._currentValues.split(";").filter(x => this._availableValues.includes(x));
        //                     this.loadTags();
        //                 }
        
        //                 this._availableTags = this._availableValues.split(";").filter(x => !this._taggedValues.includes(x));
        //                 this._availableTagContainer.innerHTML = "";
        //                 this.loadAvailableTags();

        //                 this._containerBox.appendChild(this._innerContainer);
        //                 //this._containerBox.appendChild(this._inputElement);
        //                 this._container.appendChild(this._containerBox);
        //                 this._container.appendChild(this._spanElement);
        //                 this._container.appendChild(this._availableTagContainer);
        //             },
        //             function(errorResponse: any) {
        //                 console.log("ERROR::" + errorResponse.message);
        //             }

        //         );
        //     }
        // }      
        // if (dependentFieldType == "string" && context.updatedProperties.indexOf("DependentField") != -1) {
        //     const trigger = context.parameters.DependentField.raw;
        //     this.UpdateDependentFieldTypeString(context, trigger);
        // }
    }

    // private UpdateDependentFieldTypeString(context: ComponentFramework.Context<IInputs>, currentServices: string) {
    //     if (this._dependentFieldValue.localeCompare(currentServices) != 0) {
    //         this._dependentFieldValue = currentServices;
    //         let fieldname: string = "arup_pcfvalues";
    //         let entityTypeName = "arup_pcfvaluesstore";
    //         let dependentFieldValueFilter = this._dependentFieldValue.split(';').
    //             map( function(val: string ) { return "arup_pcfdependentfieldvalue eq '" + encodeURIComponent(val) + "'"}).
    //             join( " or ");

    //         let queryString: string = "?$select=" + fieldname + "&$filter=arup_name eq '" + this._dependentField + "' and (" +dependentFieldValueFilter + ")";
    //         context.webAPI.retrieveMultipleRecords(entityTypeName, queryString).then(
    //             (response) => {
    //                 this._availableValues = response.entities.map( function(v ) { return v.arup_pcfvalues}).join(";");

    //                 var currentValues = context.parameters.TagValue.raw;
    //                 this.setCurrentTagValues(currentValues);

    //                 this._availableTags = this._availableValues.split(";").filter(x => !this._taggedValues.includes(x));
    //                 this._availableTagContainer.innerHTML = "";
    //                 this.loadAvailableTags();
    //                 this._containerBox.appendChild(this._innerContainer);
    //                 //this._containerBox.appendChild(this._inputElement);
    //                 this._container.appendChild(this._containerBox);
    //                 this._container.appendChild(this._spanElement);
    //                 this._container.appendChild(this._availableTagContainer);
    //             },
    //             function (errorResponse: any) {
    //                 console.log("ERROR::" + errorResponse.message);
    //             }

    //         );
    //     }
    //}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		var result = <IOutputs>{ TagValue: this._taggedValues.join(";") };
        return result;
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		//this._inputElement.removeEventListener("keypress", this.onKeyPress);
        this._tagClose.removeEventListener("click", this.onClickOfClose);
        //this._inputElement.removeEventListener("click", this.onClick);
        this._tagElement.removeEventListener("click", this.onClickOfAvailableTag);
        //this._popUpService.deletePopup('AvailableTagsPopup');
	}

    /// Start of private functions that manipulate the DOM to display tag values in the UI.

    /**
     * 
     */
    private displayTags( availableTags: string ) {
        // Remove any selected tags from the list, sort and dedupe.
        this._availableTags = availableTags.split(";").filter(x => !this._taggedValues.includes(x)).sort( )
                        .filter((item,index,array) => array.indexOf(item) === index);
        this._availableTagContainer.innerHTML = "";
        this.loadAvailableTags();

        this._container.innerHTML = "";
        this._containerBox.appendChild(this._innerContainer);
        this._container.appendChild(this._containerBox);
        this._container.appendChild(this._spanElement);
        this._container.appendChild(this._availableTagContainer);
    }

    private setCurrentTagValues( currentValues: string | null ) : void {
        // @ts-ignore 
        this._currentValues = currentValues;
        this._containerBox = document.createElement("div");
        this._containerBox.setAttribute("class", "container");
        this._innerContainer = document.createElement("div");
        this._innerContainer.setAttribute("class", "innerDiv");
        this._spanElement = document.createElement("span");
        this._spanElement.innerHTML = "Choose available tags below - ";
        this._availableTagContainer = document.createElement("div");
        this._availableTagContainer.setAttribute("class", "innerDiv");
        this._availableTagContainer.classList.add("displayBlock", "availableTagContainer");

        if (!this._currentValues) {
            this._taggedValues = [];
            this._innerContainer.classList.add("hideBlock");
        }
        else {
            this._innerContainer.classList.add("displayBlock");
            this._taggedValues = this._currentValues.split(";");
            this.loadTags();
        }
    }

	private loadTags(): void {
        for (var i = 0; i < this._taggedValues.length; i++) {
            this._tagElement = document.createElement("div");
            this._tagElement.setAttribute("class", "customTag selectedTag");
            this._tagContent = document.createElement("div");
            this._tagContent.innerHTML = this._taggedValues[i];
            this._tagClose = document.createElement("a");
            this._tagClose.innerHTML = "X";
            this._tagClose.addEventListener("click", this.onClickOfClose.bind(this));
            this._tagClose.setAttribute("class", "closeTag");
            this._tagElement.append(this._tagContent);
            this._tagElement.appendChild(this._tagClose);
            this._innerContainer.appendChild(this._tagElement);
        }
	}

    private loadAvailableTags(): void {
        for (var i=0; i<this._availableTags.length; i++) {
            this._tagElement = document.createElement("div");
            this._tagElement.setAttribute("class", "customTag");
            this._tagContent = document.createElement("div");
            this._tagContent.innerHTML = this._availableTags[i];
            this._tagElement.append(this._tagContent);
            this._tagElement.addEventListener("click", this.onClickOfAvailableTag.bind(this));
            this._availableTagContainer.appendChild(this._tagElement);
        }
    }

    private onClickOfAvailableTag(e: any): void {
        if (!this._innerContainer.classList.contains("displayBlock") && this._innerContainer.classList.contains("hideBlock")) {
            this._innerContainer.classList.add("displayBlock");
            this._innerContainer.classList.remove("hideBlock");
        }
        this._taggedValues.push(e.target.childNodes[0].textContent);
        this._tagElement = document.createElement("div");
        this._tagElement.setAttribute("class", "customTag selectedTag");
        this._tagContent = document.createElement("div");
        this._tagContent.setAttribute("class", "tagContent");
        this._tagContent.innerHTML = e.target.childNodes[0].textContent;
        this._tagClose = document.createElement("a");
        this._tagClose.innerHTML = "X";
        this._tagClose.addEventListener("click", this.onClickOfClose.bind(this));
        this._tagClose.setAttribute("class", "closeTag");
        this._tagElement.append(this._tagContent);
        this._tagElement.appendChild(this._tagClose);
        this._innerContainer.appendChild(this._tagElement);
        //this._inputElement.value = "";
        this._availableTags.splice(this._availableTags.indexOf(e.target.childNodes[0].textContent), 1);
        if (e.target.parentElement.className == "customTag") {
            e.target.parentElement.remove();
        }
        else if (e.target.className == "customTag") {
            e.target.remove();
        }
        this._notifyOutputChanged();
    }

    /**
	 * Function called On click of remove Tag
	 */
    private onClickOfClose(e: any): void {
        this._taggedValues.splice(this._taggedValues.indexOf(e.target.previousSibling.textContent), 1);
        //this._availableTags.push(e.target.previousSibling.textContent);
        this._tagElement = document.createElement("div");
        this._tagElement.setAttribute("class", "customTag");
        this._tagContent = document.createElement("div");
        this._tagContent.innerHTML = e.target.previousSibling.textContent;
        this._tagElement.append(this._tagContent);
        this._tagElement.addEventListener("click", this.onClickOfAvailableTag.bind(this));
        this._availableTagContainer.appendChild(this._tagElement);
        e.target.parentElement.remove();
        if (this._taggedValues.length && this._innerContainer.classList.contains("hideBlock") && !this._innerContainer.classList.contains("displayBlock")) {
            this._innerContainer.classList.remove("hideBlock");
            this._innerContainer.classList.add("displayBlock");
        }
        else if (!this._taggedValues.length && !this._innerContainer.classList.contains("hideBlock") && this._innerContainer.classList.contains("displayBlock")) {
            this._innerContainer.classList.remove("displayBlock");
            this._innerContainer.classList.add("hideBlock");
        }
        this._notifyOutputChanged();
        //this._popUpService.closePopup('AvailableTagsPopup');
	}
}