import {IInputs, IOutputs} from "./generated/ManifestTypes";
// import { TagsFromPCFValuesStore } from "./TagsFromPCFValuesStore";
import { TagsFromTagGroupDefinition } from "./tagsFromTagGroupsDefinition";
import { TagValueSource } from "./TagValueSource";
import { TestTagValues } from "./TestTagValues";

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
            this._tagValueSource = new TestTagValues();
        } else {
            this._tagValueSource = new TagsFromTagGroupDefinition("opportunity");
        }

        // Set current tag values
        let currentValues: string = context.parameters.TagValue.raw ? context.parameters.TagValue.raw : "";
        this.setCurrentTagValues(currentValues);

        // May not be necessary as updateView seems to be called immediately after init.
        // // Get available tag values
        // this._tagValueSource.getAvailableTagValues(context).then(
        //     // Resolve
        //     this.displayTags.bind(this),
        //     // Reject
        //     (error: string) => {
        //         console.log(`Error getting available tag values: ${error}`)
        //     }
        // );
        
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
    }

	/** 
	 * Called by the framework prior to a control receiving new data. 
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
        this._tagClose.removeEventListener("click", this.onClickOfClose);
        this._tagElement.removeEventListener("click", this.onClickOfAvailableTag);
	}

    ///
    /// Start of private functions that manipulate the DOM to display tag values in the UI.
    ///
    /**
     * 
     */
    private displayTags( availableTags: string ) {
        // Remove any selected tags from the list, sort and dedupe.
        this._availableTags = availableTags.split(";").filter(x => !this._taggedValues.includes(x)).sort( )
                        .filter((item,index,array) => array.indexOf(item) === index).filter( x => x != "" );
        this._availableTagContainer.innerHTML = "";
        this.loadAvailableTags();

        this._container.innerHTML = "";
        if ( !( availableTags == "" && this._currentValues == "")) {
            this._containerBox.appendChild(this._innerContainer);
            this._container.appendChild(this._containerBox);
            if (availableTags != "" ) {
                this._container.appendChild(this._spanElement);
                this._container.appendChild(this._availableTagContainer);
            }
        }
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
	}
}