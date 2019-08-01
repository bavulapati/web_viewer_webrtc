/**
 * List of messages to use with Socket
 */
enum SocketMessages {
    message = 'message',
    iceCandidate = 'ice-candidate',
    offer = 'offer',
    answer = 'answer',
    startCall = 'start-call',
    hangUp = 'hang-up',
    createOrJoinRoom = 'create or join',
    created = 'created',
    joined = 'joined',
    join = 'join',
    ready = 'ready',
    full = 'full',
    serverList = 'server-list'
}

enum ServerStatus {
    online,
    offline,
    insession,
    disabled
}
