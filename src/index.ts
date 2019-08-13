console.log('Launching Viewer');

const bmrUtilityResponse: IBmrUtilityResponse = {
    user_name: 'vinaybmr@myworld.com',
    bmr_serial_key: 'BMR-SERIAL-KEY30',
    access_token: 'lifetime_host_access_token',
    remote_disabled: 0
};

const connectionQuery: IConnectionQuery = {
    accessToken: bmrUtilityResponse.access_token,
    userName: bmrUtilityResponse.user_name
};

let room: string;
const socket: SocketIOClient.Socket = io('https://bmrsignal.idrivelite.com', { query: connectionQuery });

SocketListeners.GET_INSTANCE()
    .addAll(socket, bmrUtilityResponse.bmr_serial_key);

window.onbeforeunload = (event: BeforeUnloadEvent): void => {
    console.log('before unload event received');
    SocketListeners.GET_INSTANCE()
    .removeAll(socket);
};
