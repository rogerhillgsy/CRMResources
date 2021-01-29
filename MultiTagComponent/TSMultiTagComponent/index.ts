import { isArray } from "util";
import {IInputs, IOutputs} from "./generated/ManifestTypes";

interface Popup extends ComponentFramework.FactoryApi.Popup.Popup {
    popupStyle: object;
    //shadowStyle: object;
}

export class ArupMultiTagComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _containerBox: HTMLDivElement;
    private _innerContainer: HTMLDivElement;
    private _spanElement: HTMLSpanElement;
    private _tagElement: HTMLDivElement;
    private _tagContent: HTMLDivElement;
    private _tagClose: HTMLAnchorElement;
    private _taggedValues: string[];
    private _context: ComponentFramework.Context<IInputs>;
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
		this._context = context;
		
        this._notifyOutputChanged = notifyOutputChanged;
        // @ts-ignore         
        this._tagValueFieldName = this._context.parameters.TagValue.attributes.LogicalName;
        let fieldname: string = "arup_pcfvalues";//this._tagValueFieldName;
        let dependentFieldType = typeof(context.parameters.DependentField.raw);

        if (dependentFieldType == "object") {
            this._dependentField = context.parameters.DependentField.raw[0].TypeName ? context.parameters.DependentField.raw[0].TypeName : "";
            this._dependentFieldValue = context.parameters.DependentField.raw[0].Name;
        }
        else {
            this._dependentField = this._tagValueFieldName;
            this._dependentFieldValue = "Default";
        }

        let queryString: string = "?$select=" + fieldname+"&$filter=arup_name eq '" + this._dependentField + "' and " + "arup_pcfdependentfieldvalue eq '" + encodeURIComponent(this._dependentFieldValue) + "'";
        let currentValues: string = context.parameters.TagValue.raw ? context.parameters.TagValue.raw : "";

        //(<any>context.mode).contextInfo.entityId;
        let entityTypeName = "arup_pcfvaluesstore";//(<any>context.mode).contextInfo.entityTypeName;
        //this.getAvailableTags(entityTypeName, queryString);
		context.webAPI.retrieveMultipleRecords(entityTypeName, queryString).then(
            (response) => {
                this._availableValues = response.entities[0].arup_pcfvalues;

                // @ts-ignore 
                this._currentValues = currentValues;//Xrm.Page.getAttribute(this._tagValueFieldName).getValue();
                this._containerBox = document.createElement("div");
                this._containerBox.setAttribute("class", "container");
                this._innerContainer = document.createElement("div");
                this._innerContainer.setAttribute("class", "innerDiv");
                this._spanElement = document.createElement("span");
                this._spanElement.innerHTML = "Choose available tags below - ";
                this._availableTagContainer = document.createElement("div");
                this._availableTagContainer.setAttribute("class", "innerDiv");
                this._availableTagContainer.classList.add("displayBlock", "availableTagContainer");
                /*this._inputElement = document.createElement("input");
                this._inputElement.setAttribute("id", "inputTag");
                this._inputElement.setAttribute("type", "text");
                //this._inputElement.addEventListener("keypress", this.onKeyPress.bind(this));*/
                
                if (!this._currentValues) {
                    this._taggedValues = [];
                    this._innerContainer.classList.add("hideBlock");
                }
                else {
                    this._innerContainer.classList.add("displayBlock");
                    this._taggedValues = this._currentValues.split(";");
                    this.loadTags();
                }

                this._availableTags = this._availableValues.split(";").filter(x => !this._taggedValues.includes(x));
                this.loadAvailableTags();
                //this._inputElement.addEventListener("click", this.onClick.bind(this));
                this._containerBox.appendChild(this._innerContainer);
                //this._containerBox.appendChild(this._inputElement);
                container.appendChild(this._containerBox);
                container.appendChild(this._spanElement);
                container.appendChild(this._availableTagContainer);
			},
			function(errorResponse: any) {
				console.log("ERROR::" + errorResponse.message);
			}
        );
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

    /*private onClick(e: any): void {
        //this._popUpService.openPopup('AvailableTagsPopup');
    }*/

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

        if (dependentFieldType == "object" && context.updatedProperties.indexOf("DependentField") != -1) {
            if (this._dependentFieldValue.localeCompare(context.parameters.DependentField.raw[0].Name) != 0) {
                this._dependentFieldValue = context.parameters.DependentField.raw[0].Name;
                let fieldname: string = "arup_pcfvalues";
                let entityTypeName = "arup_pcfvaluesstore";
                let queryString: string = "?$select=" + fieldname+"&$filter=arup_name eq '" + this._dependentField + "' and " + "arup_pcfdependentfieldvalue eq '" + encodeURIComponent(this._dependentFieldValue) + "'";
                context.webAPI.retrieveMultipleRecords(entityTypeName, queryString).then(
                    (response) => {
                        this._availableValues = response.entities[0].arup_pcfvalues;

                        if (!this._currentValues) {
                            this._taggedValues = [];
                            this._innerContainer.classList.add("hideBlock");
                        }
                        else {
                            this._innerContainer.classList.add("displayBlock");
                            this._taggedValues = this._currentValues.split(";").filter(x => this._availableValues.includes(x));
                            this.loadTags();
                        }
        
                        this._availableTags = this._availableValues.split(";").filter(x => !this._taggedValues.includes(x));
                        this._availableTagContainer.innerHTML = "";
                        this.loadAvailableTags();
                    },
                    function(errorResponse: any) {
                        console.log("ERROR::" + errorResponse.message);
                    }

                );
            }
        }
	}

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
}