// --- utils/user.js ---

let users = [];

const addUser = (userData) => {
  users = users.filter((u) => u.socketId !== userData.socketId);
  users.push(userData);
  return getUsersInRoom(userData.roomId);
};

const getUsers = () => users;

const getUsersInRoom = (roomId) => {
  return users.filter((user) => user.roomId === roomId);
};

const removeUserFromRoom = (socketId, roomId = null) => {
  const user = users.find((u) => u.socketId === socketId);
  if (!user) return [];

  users = users.filter((u) => u.socketId !== socketId);

  if (roomId) {
    return { roomId, user, users: getUsersInRoom(roomId) };
  } else {
    const affectedRooms = [...new Set(users.map((u) => u.roomId))];
    return affectedRooms.map((roomId) => ({
      roomId,
      user,
    }));
  }
};

module.exports = {
  addUser,
  getUsers,
  getUsersInRoom,
  removeUserFromRoom,
};
