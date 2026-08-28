from pydantic import BaseModel, EmailStr, Field
from typing import Any, Dict, Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
    MODERATOR = "moderator"


# ============= User Schemas =============
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    student_class: str = Field(default="", max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

    class Config:
        from_attributes = True


# ============= Course Schemas =============
class CourseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    content: Optional[str] = None
    thumbnail_url: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Lesson Schemas =============
class LessonBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    content: Optional[str] = None
    model_3d_url: Optional[str] = None
    order: int = 0


class LessonCreate(LessonBase):
    course_id: int


class LessonResponse(LessonBase):
    id: int
    course_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Question Schemas =============
class QuestionOptionBase(BaseModel):
    text: str
    is_correct: bool = False
    order: int = 0


class QuestionOptionResponse(QuestionOptionBase):
    id: int

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    text: str
    question_type: str = "multiple_choice"
    difficulty: str = "medium"
    points: float = 1.0


class QuestionCreate(QuestionBase):
    lesson_id: int
    options: Optional[List[QuestionOptionBase]] = Field(default_factory=list)


class QuestionResponse(QuestionBase):
    id: int
    lesson_id: int
    options: List[QuestionOptionResponse] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class QuizQuestionOptionResponse(BaseModel):
    id: int
    text: str
    order: int = 0

    class Config:
        from_attributes = True


class QuizQuestionResponse(QuestionBase):
    id: int
    lesson_id: int
    options: List[QuizQuestionOptionResponse] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Quiz Result Schemas =============
class QuizResultBase(BaseModel):
    question_id: int
    attempt_id: Optional[int] = None
    selected_answer: Optional[str] = None
    time_spent_seconds: int = 0


class QuizResultCreate(QuizResultBase):
    pass


class QuizResultResponse(QuizResultBase):
    id: int
    user_id: int
    is_correct: bool
    points_earned: float
    created_at: datetime

    class Config:
        from_attributes = True


class QuizAttemptResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    total_questions: int
    correct_answers: int
    total_points: float
    points_earned: float
    score_percent: float
    time_spent_seconds: int
    status: str
    started_at: datetime
    submitted_at: datetime
    results: List[QuizResultResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class QuizAttemptCreate(BaseModel):
    lesson_id: int


class QuizAttemptFinalize(BaseModel):
    client_event_id: Optional[str] = Field(default=None, min_length=8, max_length=80)


# ============= Chat History Schemas =============
class ChatMessageBase(BaseModel):
    user_message: str
    lesson_id: Optional[int] = None
    session_id: Optional[str] = Field(default=None, max_length=64)


class ChatMessageCreate(ChatMessageBase):
    client_event_id: Optional[str] = Field(default=None, min_length=8, max_length=80)


class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    ai_response: Optional[str] = None
    response_mode: str = "fallback"
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Personalized Learning Schemas =============
class LearningEventCreate(BaseModel):
    lesson_id: Optional[int] = None
    client_event_id: Optional[str] = Field(default=None, min_length=8, max_length=80)
    event_type: str = Field(..., min_length=1, max_length=50)
    duration_seconds: int = Field(default=0, ge=0)
    score: Optional[float] = Field(default=None, ge=0, le=100)
    payload: Optional[Dict[str, Any]] = None
    occurred_at: Optional[datetime] = None


class LearningEventResponse(LearningEventCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LessonProgressUpdate(BaseModel):
    status: Optional[str] = None
    progress_percent: Optional[float] = Field(default=None, ge=0, le=100)
    time_spent_seconds: int = Field(default=0, ge=0)
    quiz_score: Optional[float] = Field(default=None, ge=0, le=100)
    activity_type: Optional[str] = None


class LessonProgressResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    status: str
    progress_percent: float
    view_count: int
    simulation_count: int
    assistant_question_count: int
    quiz_attempt_count: int
    best_quiz_score: float
    average_quiz_score: float
    time_spent_seconds: int
    last_activity_type: Optional[str] = None
    last_accessed_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LearningRecommendation(BaseModel):
    lesson_id: int
    title: str
    reason: str
    priority: str
    suggested_action: str
    mastery_score: Optional[float] = 0
    risk_score: Optional[float] = 0
    knowledge_unit: Optional[str] = None
    type: Optional[str] = None
    label: Optional[str] = None
    to: Optional[str] = None


class LearningDashboardResponse(BaseModel):
    user_id: int
    total_lessons: int
    completed_lessons: int
    in_progress_lessons: int
    average_progress: float
    average_quiz_score: float
    total_time_spent_seconds: int
    assistant_questions: int
    recent_events: List[LearningEventResponse] = Field(default_factory=list)
    lesson_progress: List[LessonProgressResponse] = Field(default_factory=list)
    recommendations: List[LearningRecommendation] = Field(default_factory=list)
    mastery_score: float = 0
    engagement_score: float = 0
    risk_score: float = 0
    risk_level: str = "low"
    weak_alerts: List[LearningRecommendation] = Field(default_factory=list)
    learning_path: List[LearningRecommendation] = Field(default_factory=list)
    intervention_plan: List[str] = Field(default_factory=list)


# ============= Reference Material Schemas =============
class ReferenceMaterialResponse(BaseModel):
    id: int
    title: str
    description: str = ""
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    file_name: str
    file_type: str = ""
    file_size: int = 0
    file_checksum: Optional[str] = None
    uploader: str = "Giáo viên"
    uploader_user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Auth Schemas =============
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None


# ============= Classroom Schemas =============
class ClassroomPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1)
    post_type: str = "announcement"
    status: str = "published"
    course_id: Optional[int] = None
    author: str = "Giáo viên"
    author_user_id: Optional[int] = None


class ClassroomPostResponse(ClassroomPostCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AssignmentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    status: str = "published"
    due_at: Optional[datetime] = None
    created_by: str = "Giáo viên"
    created_by_user_id: Optional[int] = None


class AssignmentResponse(AssignmentCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    submission_count: int = 0

    class Config:
        from_attributes = True


class AssignmentSubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_user_id: Optional[int] = None
    student_name: str
    content: str = ""
    file_name: Optional[str] = None
    file_type: str = ""
    file_size: int = 0
    file_checksum: Optional[str] = None
    score: Optional[float] = None
    feedback: str = ""
    graded_by: Optional[int] = None
    graded_at: Optional[datetime] = None
    submitted_at: datetime

    class Config:
        from_attributes = True


class AssignmentGradeUpdate(BaseModel):
    score: Optional[float] = Field(default=None, ge=0, le=100)
    feedback: str = ""
    graded_by: Optional[int] = None
