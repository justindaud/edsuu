import express, { RequestHandler } from 'express'
import BeEm from '../models/BeEm'
import { authMiddleware } from '../middleware/authMiddleware'

const router = express.Router()

// GET all BE-EM items
const getAllBeEm: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const items = await BeEm.find()
      .populate('media')
      .populate('relatedPrograms')
      .populate('relatedPartyLiterasi')
      .sort({ createdAt: -1 })
      .exec()
    res.json(items)
  } catch (error) {
    console.error('Error fetching BE-EM items:', error)
    res.status(500).json({ error: 'Failed to fetch BE-EM items' })
  }
}

// GET BE-EM item by ID
const getBeEmById: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const item = await BeEm.findById(req.params.id)
      .populate('media')
      .populate('relatedPrograms')
      .populate('relatedPartyLiterasi')
      .exec()
    if (!item) {
      res.status(404).json({ error: 'BE-EM item not found' })
      return
    }
    res.json(item)
  } catch (error) {
    console.error('Error fetching BE-EM item:', error)
    res.status(500).json({ error: 'Failed to fetch BE-EM item' })
  }
}

// POST create BE-EM item (protected)
const createBeEm: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const item = await BeEm.create(req.body)
    res.status(201).json(item)
  } catch (error) {
    console.error('Error creating BE-EM item:', error)
    res.status(500).json({ error: 'Failed to create BE-EM item' })
  }
}

// PUT update BE-EM item (protected)
const updateBeEm: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const item = await BeEm.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('media')
      .populate('relatedPrograms')
      .populate('relatedPartyLiterasi')
      .exec()

    if (!item) {
      res.status(404).json({ error: 'BE-EM item not found' })
      return
    }

    res.json(item)
  } catch (error) {
    console.error('Error updating BE-EM item:', error)
    res.status(500).json({ error: 'Failed to update BE-EM item' })
  }
}

// DELETE BE-EM item (protected)
const deleteBeEm: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const item = await BeEm.findByIdAndDelete(req.params.id)
    if (!item) {
      res.status(404).json({ error: 'BE-EM item not found' })
      return
    }
    res.json({ message: 'BE-EM item deleted successfully' })
  } catch (error) {
    console.error('Error deleting BE-EM item:', error)
    res.status(500).json({ error: 'Failed to delete BE-EM item' })
  }
}

// POST add review to BE-EM item
const addReview: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const item = await BeEm.findByIdAndUpdate(
      req.params.id,
      { $push: { reviews: { ...req.body, createdAt: new Date() } } },
      { new: true, runValidators: true }
    )

    if (!item) {
      res.status(404).json({ error: 'BE-EM item not found' })
      return
    }

    res.json(item)
  } catch (error) {
    console.error('Error adding review:', error)
    res.status(500).json({ error: 'Failed to add review' })
  }
}

// Routes
router.get('/', getAllBeEm)
router.get('/:id', getBeEmById)
router.post('/', authMiddleware, createBeEm)
router.put('/:id', authMiddleware, updateBeEm)
router.delete('/:id', authMiddleware, deleteBeEm)
router.post('/:id/reviews', addReview)

export default router 