/**
 * Listeners for socket messages
 */
class SocketListeners {
    private static socketListenersInstance: SocketListeners;
    // private readonly webrtc: WebRTC;
    private readonly bmrRoom: string;

    private constructor(bmrKey: string) {
        // this.webrtc = WebRTC.GET_INSTANCE();
        this.bmrRoom = bmrKey;
    }

    public static GET_INSTANCE(bmrKey?: string): SocketListeners {
        if (this.socketListenersInstance === undefined && bmrKey !== undefined) {
            this.socketListenersInstance = new SocketListeners(bmrKey);
        }

        return this.socketListenersInstance;
    }

    /**
     * Add all listeners
     */
    public addAll(socket: SocketIOClient.Socket): void {
        console.log('adding all socket listeners');

        socket.on('connect', this.connectListener);
        socket.on('disconnect', this.disConnectListener);
        socket.on(SocketMessages.message, this.messageListener);
        socket.on(SocketMessages.serverList, this.serverListListener);
        socket.on(SocketMessages.created, this.roomCreatedListener);
        socket.on(SocketMessages.full, this.fullListener);
        socket.on(SocketMessages.joined, this.joinedListener);
        socket.on(SocketMessages.iceCandidate, this.iceCandidateListener);
        socket.on(SocketMessages.offer, this.offerListener);
    }

    public removeAll(socket: SocketIOClient.Socket): void {
        socket.off('connect', this.connectListener);
        socket.off('disconnect', this.disConnectListener);
        socket.off(SocketMessages.message, this.messageListener);
        socket.off(SocketMessages.serverList, this.serverListListener);
        socket.off(SocketMessages.created, this.roomCreatedListener);
        socket.off(SocketMessages.full, this.fullListener);
        socket.off(SocketMessages.joined, this.joinedListener);
        socket.off(SocketMessages.iceCandidate, this.iceCandidateListener);
        socket.off(SocketMessages.offer, this.offerListener);

        console.log('removed listeners');
    }

    private readonly roomCreatedListener = (roomName: string): void => {
        if (roomName === this.bmrRoom) {
            console.log(`Created a room as ${roomName} and joined`);
            callButton.disabled = false;  // Enable call button.
            callThePeer();
        }
    }

    private readonly connectListener = (): void => { console.log('socket connected'); };
    private readonly disConnectListener = (): void => { console.log('socket disconnected.'); };
    private readonly messageListener = (statement: string): void => { console.log(statement); };
    private readonly serverListListener = (servers: IBmrServer[]): void => {
        console.log('on serverlist');
        console.log(JSON.stringify(servers));
    }
    private readonly fullListener = (roomName: string): void => {
        if (roomName === this.bmrRoom) {
            console.log(`Message from client: Room ${roomName} is full :^(`);
        }
    }
    private readonly joinedListener = (roomName: string): void => {
        if (roomName === this.bmrRoom) {
            console.log(`viewer Joined room ${roomName}`);
            callButton.disabled = false;  // Enable call button.
            callThePeer();
        }
    }
    private readonly iceCandidateListener = (roomName: string, iceCandidate: IIceCandidateMsg): void => {
        if (roomName === this.bmrRoom) {
            console.log(`viewer received ${SocketMessages.iceCandidate} as : `, iceCandidate);
            receivedRemoteIceCandidate(iceCandidate);
        }
    }
    private readonly offerListener = (roomName: string, description: RTCSessionDescriptionInit): void => {
        if (roomName === this.bmrRoom) {
            console.log(`viewer received ${SocketMessages.offer} as : `, description);
            receivedRemoteOffer(description);
        }
    }
}
