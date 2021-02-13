var Room = require('./Room');

class House {
    constructor() {
        this.house = {};
    }

    getRoom(room) {
        // If room exists, return it, else throw an error
        if (this.house[room]) {
            return this.house[room];
        } else {
            return new Error('Room not found');
        }
    }

    createRoom(room) {
        this.house[room] = new Room();
    }

    destroyRoom(room) {
        delete this.house[room];
    }

    doesRoomExist(room) {
        return (room in this.house);
    }
};

module.exports = House;
