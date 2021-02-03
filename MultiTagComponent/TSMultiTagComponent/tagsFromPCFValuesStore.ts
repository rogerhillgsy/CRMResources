import { IInputs } from "./generated/ManifestTypes";
import { TagValueSource } from "./TagValueSource";

/**
 * Get tag values from the arup_pcfstore entity.
 * The tag values available are based on the entity (opportunity), the tag value field (arup_advisoryservicestags) and the contents of the DependentField (arup_tagstrigger)
 */
export class TagsFromPCFValuesStore implements TagValueSource {
    private _availableTagValues: string = "";
    private _currentDependentFieldValue = "";
    private readonly _pcfDependentEntity: string;
    private readonly _pcfValueStoreEntity = "arup_pcfvaluesstore";
    constructor(entityName: string) {
        this._pcfDependentEntity = entityName;
    }

    public getAvailableTagValues(context: ComponentFramework.Context<IInputs>): Promise<string> {
        // Has a semicolon separated list of services for which we will obtain available tag values
        const services = context.parameters.DependentField.raw;

        return new Promise<string>((resolve, reject) => {
            if (this._currentDependentFieldValue.localeCompare(services) == 0) {
                // Dependent field value unchanges, so return existing tag value list.
                resolve(this._availableTagValues);
            } else {
                // The dependent field contains a semicolon separated list of values. 
                // For each value in the list we will get the related list of available tag values
                // from arup_pcfvaluesstore
                // The combined set of tags from the value store will be returned.
                this._currentDependentFieldValue = services ?? "";

                if (this._currentDependentFieldValue == "") {
                    resolve("");
                } else {
                    let pcfDependentEntity = this._pcfDependentEntity;
                    let pcfDependentFieldName = context.parameters.TagValue.attributes?.LogicalName;
                    let dependentFieldValueFilter = this._currentDependentFieldValue.split(';').
                        map(function (val: string) { return "arup_pcfdependentfieldvalue eq '" + encodeURIComponent(val) + "'"; }).
                        join(" or ");

                    let queryString: string = "?$select=arup_pcfvalues&$filter=arup_dependententity eq '" + pcfDependentEntity + "' and arup_name eq '" + pcfDependentFieldName + "' and (" + dependentFieldValueFilter + ")";

                    context.webAPI.retrieveMultipleRecords(this._pcfValueStoreEntity, queryString).then(
                        (response) => {
                            // TODO: dedupe the list of tags.
                            this._availableTagValues = response.entities.map(function (v) { return v.arup_pcfvalues; }).join(";");
                            resolve(this._availableTagValues);
                        },
                        function (errorResponse: any) {
                            reject("ERROR::" + errorResponse.message);
                        }
                    );
                }
            }
        });
    }
}
