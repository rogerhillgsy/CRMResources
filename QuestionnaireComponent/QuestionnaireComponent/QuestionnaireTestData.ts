import { SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG } from "constants";
import { IInputs } from "./generated/ManifestTypes";
import { IQuestionnaireDataSource, IQuestionnaireData, IQuestionRow} from "./IQuestionnaireData";

export class QuestionnaireTestSource implements IQuestionnaireDataSource {
    private _questionnaireData : IQuestionnaireData = new QuestionnaireTestData("Test questionnaire");
    getQuestionnaireData( questionnaireName : string, context: ComponentFramework.Context<IInputs>): Promise<IQuestionnaireData> {
        return new Promise<IQuestionnaireData>( (resolve, reject) => {
            resolve(this._questionnaireData)
        })
    }
}


export class QuestionnaireTestData implements IQuestionnaireData {
    constructor(name : string) {
        this.name = name;
        let questions = new Array<IQuestionRow>();
        questions.push( new QuestionnaireTestRow(["Sustainable Development","Has the client made a public commitment to one or more UN SDGs?...","Are there reputational risks to Arup now, or in the foreseeable future, ..."],"arup_sustainabledevelopment"));
        questions.push( new QuestionnaireTestRow(["Business Alignment","Is the opportunity of strategic importance? Why?...",""],"arup_businessalignment"));
        this.questions = [...questions];
    }

    readonly questions : ReadonlyArray<IQuestionRow>;
    readonly name : string;
    readonly headerRow = ["DiscussionTopics", "Opportunity Assessment","Risk Assessment","Notes of Discussion"];

    ForEachRow(foreach: ( question: IQuestionRow) => void): Promise<void> {
        return new Promise( (resolve, rejecet) => {
            this.questions.forEach((q) => {
                foreach(q);
            });
            resolve();
        })
    }
}

export class QuestionnaireTestRow implements IQuestionRow {
    constructor( rubric: Array<string>, baseAttribute : string ) {
        this.rubric = [...rubric];
        this.baseAttributeName = baseAttribute;
    }

    readonly  rubric : ReadonlyArray<string>;
    readonly baseAttributeName : string;


}