class Room {
    constructor() {
        this.count = 0;
        this.latest = '';
        this.users = {};
    }

    getCount() {
        return this.count;
    }

    incrementCount() {
        this.count = this.count + 1;
    }

    resetCount() {
        this.count = 0;
    }

    getLatest() {
        return this.latest;
    }

    setLatest(latest) {
        this.latest = latest;
    }

    getUser(id) {
        if (id in this.users) {
            return this.users[id];
        } else {
            return new Error('User not found');
        }
    }

    setUser(id, data) {
        this.users[id] = data;
    }

    deleteUser(id) {
        delete this.users[id];
    }

    getUsers() {
        return Object.values(this.users);
    }

    reset() {
        this.count = 0;
        this.latest = "";
    }

    doesUserExist(id) {
        return (id in this.users);
    }
}

module.exports = Room;
