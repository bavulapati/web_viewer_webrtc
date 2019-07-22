console.log('Launching Viewer');

let room: string;
// tslint:disable-next-line: no-http-string
const socket: SocketIOClient.Socket = io('http://ec2-52-221-240-156.ap-southeast-1.compute.amazonaws.com:8080');

// Define initial start time of the call (defined as connection between peers).
let startTime: number | undefined;

const remoteVideo: HTMLVideoElement = <HTMLVideoElement>document.querySelector('video');

let remoteStream: MediaStream;

let remotePeerConnection: RTCPeerConnection | undefined;
let receiveChannel: RTCDataChannel;
/**
 * List of messages to use with Socket
 */
class SocketMessages {
    public readonly message: string = 'message';
    public readonly iceCandidate: string = 'ice-candidate';
    public readonly offer: string = 'offer';
    public readonly answer: string = 'answer';
    public readonly startCall: string = 'start-call';
    public readonly hangUp: string = 'hang-up';
    public readonly createOrJoinRoom: string = 'create or join';
    public readonly created: string = 'created';
    public readonly joined: string = 'joined';
    public readonly join: string = 'join';
    public readonly ready: string = 'ready';
    public readonly full: string = 'full';
}

const socketMessages: SocketMessages = new SocketMessages();

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

// Handles hangup action: ends up call, closes connections and resets peers.
function hangupAction(): void {
    disableRemoteMouseAndKeyBoard();
    socket.emit(socketMessages.hangUp, room);
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

socket.on('connect', () => {
    console.log('socket connected');
});

socket.on(socketMessages.message, (statement: string) => { console.log(statement); });

socket.on(socketMessages.created, (roomName: string) => {
    console.log(`Created a room as ${roomName} and joined`);
    callButton.disabled = false;  // Enable call button.
    callThePeer();
});

socket.on(socketMessages.full, (roomName: string) => {
    console.log(`Message from client: Room ${roomName} is full :^(`);
});

socket.on(socketMessages.joined, (roomName: string) => {
    console.log(`viewer Joined room ${roomName}`);
    callButton.disabled = false;  // Enable call button.
    callThePeer();
});

socket.on(socketMessages.iceCandidate, (iceCandidate: IIceCandidateMsg) => {
    console.log(`viewer received ${socketMessages.iceCandidate} as : `, iceCandidate);
    receivedRemoteIceCandidate(iceCandidate);
});

socket.on(socketMessages.offer, (description: RTCSessionDescriptionInit) => {
    console.log(`viewer received ${socketMessages.offer} as : `, description);
    receivedRemoteOffer(description);
});

// Define MediaStreams callbacks.

// Handles remote MediaStream success by adding it as the remoteVideo src.
function gotRemoteMediaStream(event: RTCTrackEvent): void {
    const mediaStream: MediaStream = event.streams[0];
    if (remoteVideo.srcObject === null) {
        remoteVideo.srcObject = mediaStream;
        remoteStream = mediaStream;
        console.log('viewer Remote peer connection received remote stream.');
    }
}

function sendMouseMove(event: MouseEvent): void {
    const remoteCoordinates: IMouseCoordinates = calculateRemoteCoordinates(event.offsetX, event.offsetY);
    const eventData: IEventData = {
        button: 0,
        keyCode: '0',
        eventType: 'mousemove',
        x: remoteCoordinates.x,
        y: remoteCoordinates.y
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendMouseDown(event: MouseEvent): void {
    const remoteCoordinates: IMouseCoordinates = calculateRemoteCoordinates(event.offsetX, event.offsetY);
    const eventData: IEventData = {
        button: event.button,
        keyCode: '0',
        eventType: 'mousedown',
        x: remoteCoordinates.x,
        y: remoteCoordinates.y
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendMouseUp(event: MouseEvent): void {
    const remoteCoordinates: IMouseCoordinates = calculateRemoteCoordinates(event.offsetX, event.offsetY);
    const eventData: IEventData = {
        button: event.button,
        keyCode: '0',
        eventType: 'mouseup',
        x: remoteCoordinates.x,
        y: remoteCoordinates.y
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendKeyDown(event: KeyboardEvent): void {
    const eventData: IEventData = {
        button: 0,
        keyCode: event.key.toLowerCase(),
        eventType: 'keydown',
        x: 0,
        y: 0
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendKeyUp(event: KeyboardEvent): void {
    const eventData: IEventData = {
        button: 0,
        keyCode: event.key.toLowerCase(),
        eventType: 'keyup',
        x: 0,
        y: 0
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
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
        console.log('wheel');
    });
}

function enableRemoteMouseAndKeyBoard(): void {
    remoteVideo.addEventListener('mousemove', (ev: MouseEvent) => {
        sendMouseMove(ev);
    });
    remoteVideo.addEventListener('mousedown', (ev: MouseEvent) => {
        sendMouseDown(ev);
    });
    remoteVideo.addEventListener('mouseup', (ev: MouseEvent) => {
        sendMouseUp(ev);
    });
    // document.addEventListener("keyup", (ev) => {
    //     ev.preventDefault();
    //     mProxy.sendKeyCode(ev.code, KeyAction.UP);
    // }, true);
    document.addEventListener('keydown', (ev: KeyboardEvent) => {
        ev.preventDefault();
        console.log('keydown ', ev.key);
        sendKeyDown(ev);
    },                        true);
    document.addEventListener('keyup', (ev: KeyboardEvent) => {
        ev.preventDefault();
        sendKeyUp(ev);
    },                        true);
    remoteVideo.addEventListener('wheel', (ev: WheelEvent) => {
        console.log('wheel');
    });
}

function calculateRemoteCoordinates(videoOffsetX: number, videoOffsetY: number): IMouseCoordinates {
    const vWidth: number = remoteVideo.offsetWidth;
    const vHeight: number = remoteVideo.offsetHeight;

    return {
        x: Math.round(remoteVideo.videoWidth / vWidth * videoOffsetX),
        y: Math.round(remoteVideo.videoHeight / vHeight * videoOffsetY)

    };
}

function callThePeer(): void {
    console.log('Starting call.');

    socket.emit(socketMessages.startCall, room);   // Send a message to host for initializing call

    startTime = window.performance.now();

    // Allows for RTC server configuration.
    const servers: RTCConfiguration = {
        iceServers: [{
            //  urls: ['stun:stun.l.google.com:19302']
            urls: ['turn:ec2-54-169-187-87.ap-southeast-1.compute.amazonaws.com:3478'],
            username: 'bmr-turn-user',
            credential: 'insecure-key'
        }]
    };

    // Create peer connections and add behavior.

    remotePeerConnection = new RTCPeerConnection(servers);
    console.log('Created remote peer connection object remotePeerConnection.');

    remotePeerConnection.ondatachannel = receiveChannelCallback;

    remotePeerConnection.addEventListener('icecandidate', handleConnection);
    remotePeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);
    remotePeerConnection.addEventListener('track', gotRemoteMediaStream);
}

function enableCallButtionOnValidInput(): void {
    if (roomInput.value.trim().length > 7) {
        callButton.disabled = false;
        hangupButton.disabled = true;
    }
}

// Handles call button action: creates peer connection.
function callAction(): void {
    room = roomInput.value.trim();
    socket.emit(socketMessages.createOrJoinRoom, room);
    callButton.disabled = true;
    hangupButton.disabled = false;
}

function receiveChannelCallback(event: RTCDataChannelEvent): void {
    console.log('Receive Channel Callback');
    receiveChannel = event.channel;
    receiveChannel.onmessage = onReceiveMessageCallback;
    receiveChannel.onopen = onReceiveChannelStateChange;
    receiveChannel.onclose = onReceiveChannelStateChange;
    enableRemoteMouseAndKeyBoard();
}

function onReceiveMessageCallback(event: MessageEvent): void {
    console.log('Received Message from channel', event.data);
}

function onReceiveChannelStateChange(): void {
    const readyState: RTCDataChannelState = receiveChannel.readyState;
    console.log(`Receive channel state is: ${readyState}`);
}

// Define RTC peer connection behavior.

// Connects with new peer candidate.
function handleConnection(event: RTCPeerConnectionIceEvent): void {
    const iceCandidate: RTCIceCandidate | null = <RTCIceCandidate>event.candidate;

    if (iceCandidate !== null && iceCandidate.sdpMid !== null && iceCandidate.sdpMLineIndex !== null) {
        const candidateMsg: IIceCandidateMsg = {
            candidate: iceCandidate.candidate,
            id: iceCandidate.sdpMid,
            label: iceCandidate.sdpMLineIndex
        };

        socket.emit(socketMessages.iceCandidate, candidateMsg, room);

        console.log(`viewer ICE candidate:\n${iceCandidate.candidate}.`);
    }
}

function receivedRemoteIceCandidate(rTCIceCandidateInit: IIceCandidateMsg): void {
    if (rTCIceCandidateInit !== undefined) {

        const newIceCandidate: RTCIceCandidate = new RTCIceCandidate({
            candidate: rTCIceCandidateInit.candidate,
            sdpMLineIndex: rTCIceCandidateInit.label,
            sdpMid: rTCIceCandidateInit.id
        });

        if (remotePeerConnection !== undefined) {
            remotePeerConnection.addIceCandidate(newIceCandidate)
                .then(() => {
                    handleConnectionSuccess();
                })
                .catch((error: Error) => {
                    handleConnectionFailure(error);
                });
        }
        console.log(`recieved ICE candidate:\n ${rTCIceCandidateInit.candidate}.`);
    }
}

// Logs that the connection succeeded.
function handleConnectionSuccess(): void {
    console.log(`viewer addIceCandidate success.`);
}

// Logs that the connection failed.
function handleConnectionFailure(error: Error): void {
    console.log(`viewer failed to add ICE Candidate:\n ${error.toString()}.`);
}

// Logs changes to the connection state.
function handleConnectionChange(event: Event): void {
    const peerConnection: RTCPeerConnection | null = <RTCPeerConnection>event.target;
    console.log('viewer ICE state change event: ', event);
    console.log(`viewer ICE state: ` +
        `${peerConnection.iceConnectionState}.`);
}

// Define helper functions.console.log("received ice-candidate as : ", iceCandidate);

// Logs a message with the id and size of a video element.
function logVideoLoaded(event: Event): void {
    const video: HTMLVideoElement | null = <HTMLVideoElement>event.target;
    console.log(`videoWidth: ${video.videoWidth}px, videoHeight: ${video.videoHeight}px.`);
}

function logResizedVideo(event: Event): void {
    logVideoLoaded(event);

    if (startTime !== undefined) {
        const elapsedTime: number = window.performance.now() - startTime;
        startTime = undefined;
        console.log(`Setup time: ${elapsedTime.toFixed(3)}ms.`);
    }
}

remoteVideo.addEventListener('loadedmetadata', logVideoLoaded);
remoteVideo.addEventListener('onresize', logResizedVideo);

// Logs offer creation and sets peer connection session descriptions.
function receivedRemoteOffer(description: RTCSessionDescriptionInit): void {
    console.log('remotePeerConnection setRemoteDescription start.');
    if (remotePeerConnection !== undefined) {
        remotePeerConnection.setRemoteDescription(new RTCSessionDescription(description))
            .then(() => {
                if (remotePeerConnection !== undefined) { setRemoteDescriptionSuccess(); }
            })
            .catch(setSessionDescriptionError);
    }
    console.log('remotePeerConnection createAnswer start.');
    if (remotePeerConnection !== undefined) {
        remotePeerConnection.createAnswer()
            .then(createdAnswer)
            .catch(setSessionDescriptionError);
    }
}

// Logs answer to offer creation and sets peer connection session descriptions.
function createdAnswer(description: RTCSessionDescriptionInit): void {
    console.log(`Answer from remotePeerConnection:\n${description.sdp}.`);

    console.log('remotePeerConnection setLocalDescription start.');
    if (remotePeerConnection !== undefined) {
        remotePeerConnection.setLocalDescription(description)
            .then(() => {
                if (remotePeerConnection !== undefined) { setLocalDescriptionSuccess(); }
            })
            .catch(setSessionDescriptionError);
    }

    socket.emit(socketMessages.answer, description, room);
}

// Logs success when setting session description.
function setDescriptionSuccess(functionName: string): void {
    console.log(` ${functionName} complete.`);
}

// Logs success when localDescription is set.
function setLocalDescriptionSuccess(): void {
    setDescriptionSuccess('setLocalDescription');
}

// Logs error when setting session description fails.
function setSessionDescriptionError(error: Error): void {
    console.log(`Failed to create session description: ${error.toString()}.`);
}
// Logs success when remoteDescription is set.
function setRemoteDescriptionSuccess(): void {
    setDescriptionSuccess('setRemoteDescription');
}
