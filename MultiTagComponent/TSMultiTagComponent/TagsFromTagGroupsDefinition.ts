import { IInputs } from "./generated/ManifestTypes";
import { TagValueSource } from "./TagValueSource";

/**
 * Get tag values from the arup_taggroupdefinition entity.
 * The tag values available are based on the entity (opportunity), the tag value field (arup_advisoryservicestags) and the contents of the DependentField (arup_tagstrigger)
 */
export class TagsFromTagGroupDefinition implements TagValueSource {
    private _availableTagValues: string = "";
    private _currentDependentFieldValue = "";
    private readonly _pcfDependentEntity: string;
    private readonly _pcfValueStoreEntity = "arup_taggroupdefinition";
    constructor(entityName: string) {
        this._pcfDependentEntity = entityName;
    }

    /**
     * Returns a Promise that will be resolved when the list of tag values is available (fetched asynchronously from the CRM server)
     * @param context PCF context value.
     * @param tagGroups  A comma separaated .
     */
    public getAvailableTagValues(context: ComponentFramework.Context<IInputs>, dependentFieldValue : string ): Promise<string> {
        // Has a semicolon separated list of services for which we will obtain available tag values
        // const services = context.parameters.DependentField.raw;

        return new Promise<string>((resolve, reject) => {
            if (this._currentDependentFieldValue.localeCompare(dependentFieldValue ?? "") == 0) {
                // Dependent field value unchanged, so return existing tag value list.
                resolve(this._availableTagValues);
            } else {
                // The dependent field contains a semicolon separated list of values. 
                // For each value in the list we will get the related list of available tag values
                // from arup_pcfvaluesstore.
                // The combined set of tags from the value store will be returned.
                this._currentDependentFieldValue = dependentFieldValue ?? "";

                if (this._currentDependentFieldValue == "") {
                    resolve("");
                } else {
                    let pcfDependentEntity = this._pcfDependentEntity;
                    let pcfDependentFieldName = context.parameters.TagValue.attributes?.LogicalName;
                    let dependentFieldValueFilter = this._currentDependentFieldValue.split(';').
                        map(function (val: string) { return "arup_taggroupname eq '" + encodeURIComponent(val) + "'"; }).
                        join(" or ");

                    let queryString: string = "?$select=arup_taglist&$filter=arup_targetentity eq '" + pcfDependentEntity + "' and arup_targetfield eq '" + pcfDependentFieldName + "' and (" + dependentFieldValueFilter + ") and statecode eq 0";

                    context.webAPI.retrieveMultipleRecords(this._pcfValueStoreEntity, queryString).then(
                        (response) => {
                            // TODO: dedupe the list of tags.
                            this._availableTagValues = response.entities.map(function (v) { return v.arup_taglist; }).join(";");
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
