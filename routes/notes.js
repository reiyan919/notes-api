const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const protect = require('../middleware/protect');

// GET all notes
router.get('/', protect, async (req, res) => {
    const notes = await Note.find({ user: req.userId });
    res.json(notes);
});

// POST create note
router.post('/', protect, async (req, res) => {
    const { title, body } = req.body;
    const newNote = new Note({ title, body, user: req.userId });
    await newNote.save();
    res.status(201).json(newNote);
});

// PUT update note
router.put('/:id', protect, async (req, res) => {
    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { title: req.body.title, body: req.body.body },
        { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
});

// DELETE note
router.delete('/:id', protect, async (req, res) => {
    const note = await Note.findOneAndDelete(
        { _id: req.params.id, user: req.userId }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
});

module.exports = router;