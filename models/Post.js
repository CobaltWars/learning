const { database } = require('../config/firebase');
const moment = require('moment');

class Post {
  static async create(postData) {
    try {
      const newPostRef = database.ref('posts').push();
      const postId = newPostRef.key;
      
      postData.id = postId;
      postData.createdAt = moment().format();
      
      await newPostRef.set(postData);
      return postData;
    } catch (error) {
      throw error;
    }
  }

  static async findById(postId) {
    try {
      const snapshot = await database.ref(`posts/${postId}`).once('value');
      return snapshot.val();
    } catch (error) {
      throw error;
    }
  }

  static async findByUser(userId) {
    try {
      const snapshot = await database.ref('posts')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
      
      const posts = [];
      snapshot.forEach(childSnapshot => {
        posts.push(childSnapshot.val());
      });
      
      return posts;
    } catch (error) {
      throw error;
    }
  }

  static async getFeed(userId, limit = 20) {
    try {
      // Récupérer la liste des utilisateurs suivis
      const followingSnapshot = await database.ref(`users/${userId}/following`).once('value');
      const following = followingSnapshot.val() || {};
      const followingIds = Object.keys(following);
      
      // Ajouter l'utilisateur lui-même pour voir ses propres posts
      followingIds.push(userId);
      
      // Récupérer les posts des utilisateurs suivis
      const postsSnapshot = await database.ref('posts')
        .orderByChild('createdAt')
        .limitToLast(100)
        .once('value');
      
      const posts = [];
      postsSnapshot.forEach(childSnapshot => {
        const post = childSnapshot.val();
        if (followingIds.includes(post.userId)) {
          posts.push(post);
        }
      });
      
      // Trier par date décroissante
      posts.sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());
      
      // Limiter le nombre de posts
      return posts.slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  static async like(postId, userId) {
    try {
      await database.ref(`posts/${postId}/likes/${userId}`).set(true);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async unlike(postId, userId) {
    try {
      await database.ref(`posts/${postId}/likes/${userId}`).remove();
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async addComment(postId, commentData) {
    try {
      const newCommentRef = database.ref(`posts/${postId}/comments`).push();
      const commentId = newCommentRef.key;
      
      commentData.id = commentId;
      commentData.createdAt = moment().format();
      
      await newCommentRef.set(commentData);
      return commentData;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Post;