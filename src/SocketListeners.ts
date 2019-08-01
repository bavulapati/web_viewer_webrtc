/**
 * Listeners for socket messages
 */
class SocketListeners {
    private static socketListenersInstance: SocketListeners;
    // private readonly webrtc: WebRTC;

    private constructor() {
        // this.webrtc = WebRTC.GET_INSTANCE();
    }

    public static GET_INSTANCE(): SocketListeners {
        if (this.socketListenersInstance === undefined) {
            this.socketListenersInstance = new SocketListeners();
        }

        return this.socketListenersInstance;
    }

    /**
     * Add all listeners
     */
    public addAll(socket: SocketIOClient.Socket, room: string): void {
        console.log('adding all socket listeners');

        socket.on(SocketMessages.message, (statement: string) => { console.log(statement); });

        socket.on(SocketMessages.serverList, (servers: IBmrServer[]) => {
            console.log('on serverlist');
            console.log(JSON.stringify(servers));
        });

        socket.on(SocketMessages.created, (roomName: string) => {
            console.log(`Created a room as ${roomName} and joined`);
            callButton.disabled = false;  // Enable call button.
            callThePeer();
        });

        socket.on(SocketMessages.full, (roomName: string) => {
            console.log(`Message from client: Room ${roomName} is full :^(`);
        });

        socket.on(SocketMessages.joined, (roomName: string) => {
            console.log(`viewer Joined room ${roomName}`);
            callButton.disabled = false;  // Enable call button.
            callThePeer();
        });

        socket.on(SocketMessages.iceCandidate, (iceCandidate: IIceCandidateMsg) => {
            console.log(`viewer received ${SocketMessages.iceCandidate} as : `, iceCandidate);
            receivedRemoteIceCandidate(iceCandidate);
        });

        socket.on(SocketMessages.offer, (description: RTCSessionDescriptionInit) => {
            console.log(`viewer received ${SocketMessages.offer} as : `, description);
            receivedRemoteOffer(description);
        });
    }
}
