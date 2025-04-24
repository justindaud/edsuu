import express, { RequestHandler, Router } from 'express'
import Course, { ICourse } from '../models/Course'

interface CreateCourseBody {
  title: string
  description: string
  code: string
  credits: number
  organization: 'EDSU' | 'TokoBuku'
  instructor: string // MongoDB ObjectId as string
  status?: 'active' | 'inactive' | 'draft'
}

interface UpdateCourseBody extends Partial<CreateCourseBody> {}

const router: Router = express.Router()

// GET all courses
const getAllCourses: RequestHandler = async (_req, res, next): Promise<void> => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'username organization -_id')
      .exec()
    res.json(courses)
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' })
  }
}

// GET course by ID
const getCourseById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username organization -_id')
      .exec()
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }
    res.json(course)
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' })
  }
}

// POST create new course
const createCourse: RequestHandler<{}, {}, CreateCourseBody> = async (req, res, next): Promise<void> => {
  try {
    const { title, description, code, credits, organization, instructor, status } = req.body

    // Check if course code already exists for the organization
    const existingCourse = await Course.findOne({ code, organization })
    if (existingCourse) {
      res.status(400).json({ message: 'Course code already exists for this organization' })
      return
    }

    // Create new course
    const course = new Course({
      title,
      description,
      code,
      credits,
      organization,
      instructor,
      status,
    })

    await course.save()
    
    // Return course with populated instructor
    const courseResponse = await Course.findById(course._id)
      .populate('instructor', 'username organization -_id')
      .exec()
    res.status(201).json(courseResponse)
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'An error occurred' })
  }
}

// PUT update course
const updateCourse: RequestHandler<{ id: string }, {}, UpdateCourseBody> = async (req, res, next): Promise<void> => {
  try {
    const { title, description, code, credits, organization, instructor, status } = req.body

    // Check if course exists
    const course = await Course.findById(req.params.id)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    // If code or organization is being changed, check if new combination is available
    if ((code && code !== course.code) || (organization && organization !== course.organization)) {
      const existingCourse = await Course.findOne({
        code: code || course.code,
        organization: organization || course.organization,
        _id: { $ne: course._id },
      })
      if (existingCourse) {
        res.status(400).json({ message: 'Course code already exists for this organization' })
        return
      }
    }

    // Update course fields
    if (title) course.title = title
    if (description) course.description = description
    if (code) course.code = code
    if (credits) course.credits = credits
    if (organization) course.organization = organization
    if (instructor) course.instructor = instructor
    if (status) course.status = status

    await course.save()
    
    // Return updated course with populated instructor
    const updatedCourse = await Course.findById(course._id)
      .populate('instructor', 'username organization -_id')
      .exec()
    res.json(updatedCourse)
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'An error occurred' })
  }
}

// DELETE course
const deleteCourse: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }
    res.json({ message: 'Course deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' })
  }
}

router.get('/', getAllCourses)
router.get('/:id', getCourseById)
router.post('/', createCourse)
router.put('/:id', updateCourse)
router.delete('/:id', deleteCourse)

export default router 