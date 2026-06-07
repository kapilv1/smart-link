const { ObjectId } = require("mongodb");

function getSafeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

function toObjectId(id) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

function createCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  getSafeUser,
  toObjectId,
  createCode,
};