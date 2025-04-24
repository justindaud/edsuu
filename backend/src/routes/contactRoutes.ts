import express, { RequestHandler } from 'express'
import ContactSubmission from '../models/ContactSubmission'
import { authMiddleware } from '../middleware/authMiddleware'

const router = express.Router()

// POST submit contact form
const submitContact: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const submission = await ContactSubmission.create(req.body)
    res.status(201).json(submission)
  } catch (error) {
    console.error('Error submitting contact form:', error)
    res.status(500).json({ error: 'Failed to submit contact form' })
  }
}

// GET all submissions (protected)
const getAllSubmissions: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const submissions = await ContactSubmission.find()
      .sort({ createdAt: -1 })
      .exec()
    res.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
}

// DELETE submission (protected)
const deleteSubmission: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id)
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' })
      return
    }
    res.json({ message: 'Submission deleted successfully' })
  } catch (error) {
    console.error('Error deleting submission:', error)
    res.status(500).json({ error: 'Failed to delete submission' })
  }
}

// Routes
router.post('/', submitContact)
router.get('/', authMiddleware, getAllSubmissions)
router.delete('/:id', authMiddleware, deleteSubmission)

export default router 