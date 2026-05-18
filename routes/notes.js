const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const protect = require('../middleware/protect');
const { body, validationResult } = require('express-validator');

const validateNote =[
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body is required')
]

router.get('/', protect, async (req, res, next) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const [notes, total] = await Promise.all([
            Note.find({ user: req.userId })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Note.countDocuments({ user: req.userId })
        ]);

        res.json({
            notes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', protect, async (req, res, next) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.userId });
        if (!note) {
            const err = new Error('Note not found');
            err.statusCode = 404;
            throw err;
        }
        res.json(note);
    } catch (err) {
        next(err);
    }
});

router.post('/', protect, validateNote, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, body } = req.body;
        const newNote = new Note({ title, body, user: req.userId });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', protect, validateNote, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { title: req.body.title, body: req.body.body },
            { new: true }
        );
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json(note);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', protect, async (req, res, next) => {
    try {
        const note = await Note.findOneAndDelete(
            { _id: req.params.id, user: req.userId }
        );
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;