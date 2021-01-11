module.exports = class ReadyEvent {
    constructor(client) {
        this.client = client;
        this.name = 'ready';
    }
    async run() {
        console.log(`DJS >> Inicié sesión como: ${this.client.user.tag}`)
    }
}