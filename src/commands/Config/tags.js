const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class TagsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'tags',
            alias: ['tag']
        })
    }

    async run(msg, args) {
        switch (args[0]) {
            case 'add': {

                break;
            }
            case 'edit': {

                break;
            }
            case 'delete': {

                break;
            }
        }
    }
}