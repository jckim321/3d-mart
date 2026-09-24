// Firebase Integration for Client-Side
// This file handles Firebase operations in the browser

class FirebaseManager {
  constructor() {
    this.db = null;
    this.storage = null;
    this.auth = null;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    
    try {
      // Firebase is already initialized in app.js
      this.storage = firebase.storage();
      this.initialized = true;
      console.log('Firebase Manager initialized');
    } catch (error) {
      console.error('Firebase Manager initialization error:', error);
    }
  }

  // Upload file to Firebase Storage
  async uploadFile(file, path) {
    if (!this.initialized) this.initialize();
    
    try {
      const storageRef = this.storage.ref(path);
      const snapshot = await storageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      console.log('File uploaded successfully:', downloadURL);
      return { success: true, url: downloadURL, path };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // Download file from Firebase Storage
  async downloadFile(path) {
    if (!this.initialized) this.initialize();
    
    try {
      const storageRef = this.storage.ref(path);
      const downloadURL = await storageRef.getDownloadURL();
      
      console.log('File download URL:', downloadURL);
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('File download error:', error);
      return { success: false, error: error.message };
    }
  }

  // List files in a directory
  async listFiles(path) {
    if (!this.initialized) this.initialize();
    
    try {
      const storageRef = this.storage.ref(path);
      const listResult = await storageRef.listAll();
      
      const files = listResult.items.map(itemRef => ({
        name: itemRef.name,
        fullPath: itemRef.fullPath
      }));
      
      console.log('Files listed:', files);
      return { success: true, files };
    } catch (error) {
      console.error('List files error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete file from Firebase Storage
  async deleteFile(path) {
    if (!this.initialized) this.initialize();
    
    try {
      const storageRef = this.storage.ref(path);
      await storageRef.delete();
      
      console.log('File deleted successfully:', path);
      return { success: true };
    } catch (error) {
      console.error('File delete error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
const firebaseManager = new FirebaseManager();

// Make it available globally
window.firebaseManager = firebaseManager;