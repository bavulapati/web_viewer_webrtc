interface IIceCandidateMsg {
    label: number;
    id: string;
    candidate: string;
}

interface IMouseCoordinates {
    x: number;
    y: number;
}

interface IEventData extends IMouseCoordinates {
    eventType: string;
    button: number;
    keyCode: string;
}
