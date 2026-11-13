const prisma = require('../config/db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/notes
 * Scoped strictly to req.user.id
 */
const getNotes = asyncHandler(async (req, res) => {
  const notes = await prisma.personalNote.findMany({
    where: { userId: req.user.id },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
  });

  res.status(200).json({
    success: true,
    count: notes.length,
    notes,
  });
});

/**
 * POST /api/notes
 * Create personal sticky note for current user
 */
const createNote = asyncHandler(async (req, res) => {
  const { title, content, pinned = false, color = 'yellow' } = req.body;

  const note = await prisma.personalNote.create({
    data: {
      userId: req.user.id,
      title: title || null,
      content,
      pinned,
      color,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Personal note saved.',
    note,
  });
});

/**
 * PATCH /api/notes/:id
 * Update personal note (owner only)
 */
const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const note = await prisma.personalNote.findUnique({
    where: { id },
  });

  if (!note) {
    throw new AppError('Note not found.', 404);
  }

  if (note.userId !== req.user.id) {
    throw new AppError('Access forbidden: You can only edit your own notes.', 403);
  }

  const updatedNote = await prisma.personalNote.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: 'Note updated.',
    note: updatedNote,
  });
});

/**
 * DELETE /api/notes/:id
 * Delete personal note (owner only)
 */
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const note = await prisma.personalNote.findUnique({
    where: { id },
  });

  if (!note) {
    throw new AppError('Note not found.', 404);
  }

  if (note.userId !== req.user.id) {
    throw new AppError('Access forbidden: You can only delete your own notes.', 403);
  }

  await prisma.personalNote.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully.',
  });
});

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};

