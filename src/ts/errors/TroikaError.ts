export class TroikaError extends Error {

    constructor(public uiMsg: string) {
        super();
    }

}