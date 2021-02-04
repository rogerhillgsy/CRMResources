import { TagValueSource } from "./TagValueSource";



/**
 * Tag value source used for testing - this just returns a fixed list of tags.
 */
export class TestTagValues implements TagValueSource {
    constructor() {
    }

    public getAvailableTagValues(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve("Tag4;Tag2;Tag1;Tag2;Tag3");
        });
    }
}
