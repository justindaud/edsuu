import express from 'express'
import userRoutes from './userRoutes'
import programRoutes from './programRoutes'
import mediaRoutes from './mediaRoutes'
import articleRoutes from './articleRoutes'
import authRoutes from './authRoutes'
import uploadRoutes from './uploadRoutes'
import contactRoutes from './contactRoutes'
import beEmRoutes from './beEmRoutes'
import uiMediaRoutes from './uiMediaRoutes'
import merchandiseRoutes from './merchandiseRoutes'
import mediaTBYTRoutes from './mediaTBYTRoutes'

const router = express.Router()

// Public routes (no auth required)
router.use('/programs', programRoutes)
router.use('/articles', articleRoutes)
router.use('/media', mediaRoutes)
router.use('/contact', contactRoutes)
router.use('/be-em', beEmRoutes)
router.use('/media-tbyt', mediaTBYTRoutes)

// Auth routes
router.use('/auth', authRoutes)

// Protected routes (require auth)
router.use('/users', userRoutes)
router.use('/upload', uploadRoutes)
router.use('/ui-media', uiMediaRoutes)
router.use('/merchandise', merchandiseRoutes)
export default router 