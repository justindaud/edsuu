import { Router, RequestHandler, NextFunction, Response } from 'express'
import Article from '../models/Article'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

interface ArticleBody {
  title: string
  content: string
  media?: string[]
}

type AuthRequestHandler<P = {}, ResBody = any, ReqBody = any> = 
  (req: AuthRequest & { params: P } & { body: ReqBody }, res: Response<ResBody>, next: NextFunction) => Promise<void>

// GET all articles
const getAllArticles: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username')
      .exec()
    res.json(articles)
  } catch (error) {
    next(error)
  }
}

// GET article by ID
const getArticleById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'username')
      .populate('media')
      .exec()
    if (!article) {
      res.status(404).json({ error: 'Article not found' })
      return
    }
    res.json(article)
  } catch (error) {
    next(error)
  }
}

// POST create article (protected)
const createArticle: AuthRequestHandler<{}, any, ArticleBody> = async (req, res, next): Promise<void> => {
  try {
    const article = await Article.create({
      ...req.body,
      author: req.user?.id
    })
    res.status(201).json(article)
  } catch (error) {
    next(error)
  }
}

// PUT update article (protected)
const updateArticle: AuthRequestHandler<{ id: string }, any, Partial<ArticleBody>> = async (req, res, next): Promise<void> => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('author', 'username')
      .populate('media')
      .exec()

    if (!article) {
      res.status(404).json({ error: 'Article not found' })
      return
    }

    res.json(article)
  } catch (error) {
    next(error)
  }
}

// DELETE article (protected)
const deleteArticle: AuthRequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id)
    if (!article) {
      res.status(404).json({ error: 'Article not found' })
      return
    }
    res.json({ message: 'Article deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Routes
router.get('/', getAllArticles)
router.get('/:id', getArticleById)
router.post('/', authMiddleware, createArticle as RequestHandler)
router.put('/:id', authMiddleware, updateArticle as RequestHandler)
router.delete('/:id', authMiddleware, deleteArticle as RequestHandler)

export default router 