import express, { RequestHandler } from 'express'
import { Program } from '../models/Program'
import { authMiddleware } from '../middleware/authMiddleware'

const router = express.Router()

// GET all programs
const getPrograms: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { public: isPublic } = req.query
    
    // Query for public programs (only filter out drafts)
    const query = isPublic === 'true' ? {
      isPublic: true,
      status: { $ne: 'draft' }
    } : {}

    const programs = await Program.find(query)
      .sort({ startDate: -1 })
      .populate('media')
      .populate({
        path: 'articles',
        select: 'title content excerpt createdAt author',
        populate: {
          path: 'author',
          select: 'username -_id'
        }
      })
      .exec()

    // Update status based on dates before sending response
    const now = new Date()
    const updatedPrograms = programs.map(program => {
      const doc = program.toObject()
      const startDate = new Date(doc.startDate)
      const endDate = new Date(doc.endDate)

      if (doc.status !== 'cancelled') {
        if (now < startDate) {
          doc.status = 'scheduled'
        } else if (now >= startDate && now <= endDate) {
          doc.status = 'ongoing'
        } else if (now > endDate) {
          doc.status = 'completed'
        }
      }

      return doc
    })

    res.json(updatedPrograms)
  } catch (error) {
    console.error('Error fetching programs:', error)
    res.status(500).json({ error: 'Failed to fetch programs' })
  }
}

// GET program by ID
const getProgramById: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { id } = req.params
    const { public: isPublic } = req.query

    const query = isPublic === 'true' ? { _id: id, isPublic: true } : { _id: id }
    const program = await Program.findOne(query)
      .populate('media')
      .populate({
        path: 'articles',
        select: 'title content excerpt createdAt author',
        populate: {
          path: 'author',
          select: 'username -_id'
        }
      })
      .exec()

    if (!program) {
      res.status(404).json({ error: 'Program not found' })
      return
    }

    // For public requests, check if program is public and not draft
    if (isPublic === 'true' && (!program.isPublic || program.status === 'draft')) {
      res.status(404).json({ error: 'Program not found' })
      return
    }

    res.json(program)
  } catch (error) {
    console.error('Error fetching program:', error)
    res.status(500).json({ error: 'Failed to fetch program' })
  }
}

// POST create program (protected)
const createProgram: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const data = req.body

    // Validate dates
    if (new Date(data.endDate) < new Date(data.startDate)) {
      res.status(400).json({ error: 'End date cannot be before start date' })
      return
    }

    const program = await Program.create(data)
    res.status(201).json(program)
  } catch (error) {
    console.error('Error creating program:', error)
    res.status(500).json({ error: 'Failed to create program' })
  }
}

// PUT update program (protected)
const updateProgram: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { id } = req.params
    const data = req.body

    // Validate dates
    if (new Date(data.endDate) < new Date(data.startDate)) {
      res.status(400).json({ error: 'End date cannot be before start date' })
      return
    }

    const program = await Program.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!program) {
      res.status(404).json({ error: 'Program not found' })
      return
    }

    res.json(program)
  } catch (error) {
    console.error('Error updating program:', error)
    res.status(500).json({ error: 'Failed to update program' })
  }
}

// DELETE program (protected)
const deleteProgram: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { id } = req.params
    const program = await Program.findByIdAndDelete(id)

    if (!program) {
      res.status(404).json({ error: 'Program not found' })
      return
    }

    res.json({ message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Error deleting program:', error)
    res.status(500).json({ error: 'Failed to delete program' })
  }
}

// Public routes
router.get('/', getPrograms)
router.get('/:id', getProgramById)

// Protected routes
router.post('/', authMiddleware, createProgram)
router.put('/:id', authMiddleware, updateProgram)
router.delete('/:id', authMiddleware, deleteProgram)

export default router 