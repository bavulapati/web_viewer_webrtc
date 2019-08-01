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

interface IBmrUtilityResponse {
    user_name: string;
    bmr_serial_key: string;
    access_token: string;
    remote_disabled: number;
}

interface IConnectionQuery {
    accessToken: string;
    userName: string;
}
