import { IInputs } from "./generated/ManifestTypes";


export interface IQuestionnaireDataSource {
    getQuestionnaireData( questionnaireName: string, context: ComponentFramework.Context<IInputs>): Promise<IQuestionnaireData>;
}

export interface IQuestionnaireData {
    readonly name : string;
    readonly headerRow : ReadonlyArray<string>;
    ForEachRow( foreach : (question: IQuestionRow) => void    ) : Promise<void>;
}

export interface IQuestionRow {
    readonly rubric : ReadonlyArray<string>;
    readonly baseAttributeName : string;
} 