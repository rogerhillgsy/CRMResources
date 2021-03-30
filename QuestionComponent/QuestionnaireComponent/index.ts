import { groupCollapsed } from "console";
import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class QuestionnaireComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _context: ComponentFramework.Context<IInputs>; // ?? Is this valid as it probably changes from one call to the next?
    private _container : HTMLDivElement;
	private _notifyOutputChanged: () => void;
	private _columnText = new Array<string>();
	private _inputField : HTMLTextAreaElement;
	private _showInputField =false;

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

		this._showInputField = context.parameters.ShowInputField.raw != "0";

		// this._questionnaireDataSource = new QuestionnaireTestSource();
		// this._questionnaireDataSource.getQuestionnaireData("Test Questionnaire",context).then( (data) => {
		// 	this._questionnaireData = data;
		// 	this.displayQuestionnaire()
		// } )
		this.addIfnotNull(this._columnText, context.parameters.Col1);
		this.addIfnotNull(this._columnText, context.parameters.Col2);
		this.addIfnotNull(this._columnText, context.parameters.Col3);
		this.addIfnotNull(this._columnText, context.parameters.Col4);
		this.addIfnotNull(this._columnText, context.parameters.Col5);
		this.displayQuestion();
	}
	addIfnotNull(  array: Array<string>, text : ComponentFramework.PropertyTypes.StringProperty ) {
		if (!!text && !!text.raw && text.raw.length !== 0 && !!text.raw.trim()) {
			array.push(text.raw);
		}
	}
	displayQuestion() {
		let table = document.createElement("table");
		table.setAttribute("class","questionnaireTable");
		this._container.appendChild(table);
		let headerRow  = table.createTHead();
		headerRow.setAttribute("class","questionTableHeaderRow")
		let header = document.createElement("th");
		header.setAttribute("class","questionTableHeader")
		header.innerHTML = this._context.parameters.Header.raw || "";
		header.colSpan =  this._columnText.length + ( this._showInputField ? 1 : 0 );
		headerRow.appendChild(header);
		
		let row = table.insertRow();
		this._columnText.forEach((r) => {
		let col = document.createElement("td");
		col.setAttribute("class", "questionTableData");
		col.innerHTML = r;
		row.appendChild(col);
		});

		if (this._showInputField) {
			let inputCol = document.createElement("td");
			inputCol.setAttribute("class", "questionTableInput");

			let growWrap = document.createElement("div");
			growWrap.setAttribute("class","grow-wrap");
			inputCol.appendChild(growWrap);

			this._inputField = document.createElement("textarea");
			this._inputField.setAttribute("class", "questionTableInput");
			this._inputField.setAttribute("onInput", "this.parentNode.dataset.replicatedValue = this.value");

			let  notifyChanged =  () => this._notifyOutputChanged();
			this._inputField.addEventListener("input",
			function(this:HTMLTextAreaElement ){
				// @ts-ignore
				this.parentNode.dataset.replicatedValue = this.value
				notifyChanged();
			})
			growWrap.appendChild(this._inputField);
			row.appendChild(inputCol);
		}
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this._context = context;
		this._inputField.value = context.parameters.Question.raw || "";
		debugger;
		this._inputField.setAttribute("disabled",context.mode.isControlDisabled.toString()  )

		// @ts-ignore
		this._inputField.parentNode.dataset.replicatedValue = this._inputField.value
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		var result = <IOutputs>{ Question : this._inputField.value };
		return result;
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}
}