
let remoteStream: MediaStream;
let remotePeerConnection: RTCPeerConnection | undefined;
let receiveChannel: RTCDataChannel;

const remoteVideo: HTMLVideoElement = <HTMLVideoElement>document.querySelector('video');
// Define and add behavior to buttons.
// Define action buttons.
const roomInput: HTMLInputElement = <HTMLInputElement>document.getElementById('roomName');
const callButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('callButton');
const hangupButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('hangupButton');

// Set up initial action buttons status: disable call and hangup.
callButton.disabled = true;
hangupButton.disabled = true;

// Add click event handlers for buttons.
roomInput.addEventListener('input', enableCallButtionOnValidInput);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);

const loaderWrapper: HTMLDivElement = <HTMLDivElement>document.getElementById('loader_wrapper');
remoteVideo.onplaying = (): void => {
    remoteVideo.style.display = 'block';
    loaderWrapper.style.display = 'none';
};

function enableCallButtionOnValidInput(): void {
    if (roomInput.value.trim().length > 7) {
        callButton.disabled = false;
        hangupButton.disabled = true;
    }
}

// Handles call button action: creates peer connection.
function callAction(): void {
    room = roomInput.value.trim();
    socket.emit(SocketMessages.createOrJoinRoom, room);
    callButton.disabled = true;
    hangupButton.disabled = false;
}

// Handles hangup action: ends up call, closes connections and resets peers.
function hangupAction(): void {
    disableRemoteMouseAndKeyBoard();
    socket.emit(SocketMessages.hangUp, room);
    socket.close();
    receiveChannel.close();
    console.log(`Closed data channel with label: ${receiveChannel.label}`);
    if (remotePeerConnection !== undefined) { remotePeerConnection.close(); }
    remotePeerConnection = undefined;
    hangupButton.disabled = true;
    callButton.disabled = false;
    console.log('Ending call.');
    // tslint:disable-next-line: no-null-keyword
    remoteVideo.srcObject = null;
}

function disableRemoteMouseAndKeyBoard(): void {
    remoteVideo.removeEventListener('mousemove', (ev: MouseEvent) => {
        sendMouseMove(ev);
    });
    remoteVideo.removeEventListener('mousedown', (ev: MouseEvent) => {
        sendMouseDown(ev);
    });
    remoteVideo.removeEventListener('mouseup', (ev: MouseEvent) => {
        sendMouseUp(ev);
    });
    remoteVideo.removeEventListener('keydown', (ev: KeyboardEvent) => {
        sendKeyDown(ev);
    });
    remoteVideo.removeEventListener('keyup', (ev: KeyboardEvent) => {
        sendKeyUp(ev);
    });
    remoteVideo.removeEventListener('wheel', (ev: WheelEvent) => {
        ev.preventDefault();
        sendWheelMovement(ev);
    });
}
