module.exports = class MessageUpdateEvent {
    constructor(client) {
        this.client = client;
        this.name = 'messageUpdate';
    }

    async run(oldMsg, newMsg) {
        this.client.emit('message', newMsg);
    }
}