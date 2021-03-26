import { groupCollapsed } from "console";
import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { IQuestionnaireData, IQuestionnaireDataSource } from "./IQuestionnaireData";
import { QuestionnaireTestSource } from "./QuestionnaireTestData";

export class QuestionnaireComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _context: ComponentFramework.Context<IInputs>; // ?? Is this valid as it probably changes from one call to the next?
    private _container : HTMLDivElement;
	private _notifyOutputChanged: () => void;

	private _questionnaireDataSource: IQuestionnaireDataSource;
	private _questionnaireData : IQuestionnaireData;

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

		this._questionnaireDataSource = new QuestionnaireTestSource();
		this._questionnaireDataSource.getQuestionnaireData("Test Questionnaire",context).then( (data) => {
			this._questionnaireData = data;
			this.displayQuestionnaire()
		} )
	}
	displayQuestionnaire() {
		debugger;
		this._container.innerHTML = "Hello World \"" + this._questionnaireData.name + "\"";
		let table = document.createElement("table");
		table.setAttribute("class","questionnaireTable");
		this._container.appendChild(table);
		let headerRow  = table.createTHead();
		headerRow.setAttribute("class","questionTableHeaderRow")
		let header = document.createElement("th");
		header.setAttribute("class","questionTableHeader")
		header.innerHTML = this._questionnaireData.headerRow[0];
		header.colSpan =  this._questionnaireData.headerRow.length - 1;
		headerRow.appendChild(header);
		
		table = document.createElement("table");
		table.setAttribute("class","questionnaireTable");
		this._container.appendChild(table);
		headerRow  = table.createTHead();

		 headerRow = table.createTHead();
		headerRow.setAttribute("class","questionTableHeaderRow")
		this._questionnaireData.headerRow.forEach((h, i) => {
			if (i > 0) {
				let header = document.createElement("th");
				header.setAttribute("class","questionTableHeader")
				header.innerHTML = h;
				headerRow.appendChild(header);
			}
		});

		this._questionnaireData.ForEachRow((r) => {
			let row = table.insertRow();
			let col : HTMLTableCellElement = document.createElement("td");
			col.setAttribute("class", "questionTableData");
			col.colSpan = this._questionnaireData.headerRow.length - 1;
			col.innerHTML = r.rubric[0];
			row.appendChild(col);			
		
			row = table.insertRow();
			r.rubric.forEach( (r,i) => {
				if (i > 0 ) {
				let col = document.createElement("td");
				col.setAttribute("class", "questionTableData");
				col.innerHTML = r;
				row.appendChild(col);			
				}
			});
			let inputCol = document.createElement("td");
			inputCol.setAttribute("class", "questionTableInput");
			let input1 : HTMLTextAreaElement =  document.createElement("textarea");
			inputCol.appendChild(input1);
			row.appendChild(inputCol)
		})

	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
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