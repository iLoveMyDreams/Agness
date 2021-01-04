module.exports = class ReadyEvent{
    constructor(client) {
      this.client = client;
      this.name = 'ready';
    }
  async run() {
        console.log(`DJS >> Inicie sesión como: ${this.client.user.tag}`)
    }
  }