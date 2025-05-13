const { database } = require('../config/firebase');

class User {
  static async create(uid, userData) {
    try {
      await database.ref(`users/${uid}`).set(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  }

  static async findById(uid) {
    try {
      const snapshot = await database.ref(`users/${uid}`).once('value');
      return snapshot.val();
    } catch (error) {
      throw error;
    }
  }

  static async update(uid, userData) {
    try {
      await database.ref(`users/${uid}`).update(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  }

  static async follow(userId, followId) {
    try {
      await database.ref(`users/${userId}/following/${followId}`).set(true);
      await database.ref(`users/${followId}/followers/${userId}`).set(true);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async unfollow(userId, followId) {
    try {
      await database.ref(`users/${userId}/following/${followId}`).remove();
      await database.ref(`users/${followId}/followers/${userId}`).remove();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;