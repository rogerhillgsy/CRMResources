import { IInputs } from "./generated/ManifestTypes";


export interface TagValueSource {
    /** Return a semicolon separated list of tag values via the updateTagValues callback. */
    // getAvailableTagValues( context: ComponentFramework.Context<IInputs>, updateTagValues: () => string  ) : void;
    getAvailableTagValues(context: ComponentFramework.Context<IInputs>): Promise<string>;
}
