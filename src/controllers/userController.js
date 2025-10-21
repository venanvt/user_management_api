import pool from '../config/db.js';
import { getAllUsers, findUserById, updateUserById, deleteUserById } from '../models/userModel.js';
import { uploadToCloudinary } from '../middleware/upload.js';


export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    const authUserId = req.user.id;

    if (parseInt(id) !== authUserId)
      return res.status(403).json({ message: "You cannot update another user's account!" });

    const updatedUser = await updateUserById(id, username, email);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const authUserId = req.user.id;

    if (parseInt(id) !== authUserId)
      return res.status(403).json({ message: "You cannot delete another user's account!" });

    await deleteUserById(id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer);
    const { id } = req.user;

    await updateUserById(id, undefined, undefined); // biar updated_at ikut update
    await pool.query('UPDATE users SET avatar_url=$1 WHERE id=$2', [result.secure_url, id]);

    res.json({ message: 'Avatar uploaded successfully', url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};