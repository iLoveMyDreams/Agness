module.exports = class MessageUpdateEvent {
    constructor(client) {
        this.client = client;
        this.name = 'messageUpdate';
    }

    async run(oldMsg, newMsg) {
        if(oldMsg.content === newMsg.content) return;
        this.client.emit('message', newMsg);
    }
};