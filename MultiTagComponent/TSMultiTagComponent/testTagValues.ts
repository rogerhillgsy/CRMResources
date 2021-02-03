import { TagValueSource } from "./TagValueSource";

export class testTagValues implements TagValueSource {
    constructor() {
    }

    public getAvailableTagValues(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve("Tag4;Tag2;Tag1;Tag2;Tag3");
        });
    }
}
