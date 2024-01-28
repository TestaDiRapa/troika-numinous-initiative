export class TroikaWarning extends Error {

    constructor(public uiMsg: string) {
        super();
    }

}