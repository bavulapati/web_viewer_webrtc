console.log('Launching Viewer');

const bmrUtilityResponse: IBmrUtilityResponse = {
    user_name: 'vinaybmr@myworld.com',
    bmr_serial_key: 'BMR-SERIAL-KEY30',
    access_token: 'lifetime_host_access_token',
    remote_disabled: 0
};

const connectionQuery: IConnectionQuery = {
    accessToken: bmrUtilityResponse.access_token,
    userName: bmrUtilityResponse.user_name,
    isHost: false
};

let room: string;
const socket: SocketIOClient.Socket = io('https://bmrsignal.idrivelite.com', { query: connectionQuery });

SocketListeners.GET_INSTANCE(/*bmrUtilityResponse.bmr_serial_key*/)
    .addAll(socket);

window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
    console.log('before dialog');
    event.returnValue = 'Do you want to close the session?..';
  });
window.addEventListener('unload', (event: Event) => {
    console.log('after dialog');
    SocketListeners.GET_INSTANCE()
    .removeAll(socket);
    hangupAction();
  });
