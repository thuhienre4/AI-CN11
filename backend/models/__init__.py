from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    Float,
    ForeignKey,
    Enum as SQLEnum,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class UserRole(str, enum.Enum):
    """User roles in the system."""
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
    MODERATOR = "moderator"


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default=UserRole.STUDENT.value)
    student_class = Column(String(50), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    courses = relationship("UserCourse", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    lesson_progress = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")
    learning_events = relationship("LearningEvent", back_populates="user", cascade="all, delete-orphan")
    reference_materials = relationship("ReferenceMaterial", back_populates="uploader_user")
    classroom_posts = relationship("ClassroomPost", back_populates="author_user")
    assignment_submissions = relationship(
        "AssignmentSubmission",
        back_populates="student_user",
        foreign_keys="AssignmentSubmission.student_user_id",
    )

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"


class Course(Base):
    """Course model."""
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    content = Column(Text)
    thumbnail_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    user_courses = relationship("UserCourse", back_populates="course", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Course(id={self.id}, title={self.title})>"


class UserCourse(Base):
    """User-Course association (enrollment)."""
    __tablename__ = "user_courses"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_user_course"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    progress = Column(Float, default=0.0)  # 0-100
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="courses")
    course = relationship("Course", back_populates="user_courses")

    def __repr__(self):
        return f"<UserCourse(user_id={self.user_id}, course_id={self.course_id})>"


class Lesson(Base):
    """Lesson model."""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    content = Column(Text)
    model_3d_url = Column(String(500))  # URL to 3D model file
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="lessons")
    questions = relationship("Question", back_populates="lesson", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="lesson", cascade="all, delete-orphan")
    progress_records = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")
    learning_events = relationship("LearningEvent", back_populates="lesson", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Lesson(id={self.id}, course_id={self.course_id}, title={self.title})>"


class Question(Base):
    """Question model for quizzes."""
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    text = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice")  # multiple_choice, true_false, text
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    points = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lesson = relationship("Lesson", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    results = relationship("QuizResult", back_populates="question", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Question(id={self.id}, lesson_id={self.lesson_id})>"


class QuestionOption(Base):
    """Options for multiple choice questions."""
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    # Relationships
    question = relationship("Question", back_populates="options")

    def __repr__(self):
        return f"<QuestionOption(id={self.id}, question_id={self.question_id})>"


class QuizAttempt(Base):
    """One quiz session/attempt for a user and lesson."""
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    total_points = Column(Float, default=0.0)
    points_earned = Column(Float, default=0.0)
    score_percent = Column(Float, default=0.0)
    time_spent_seconds = Column(Integer, default=0)
    status = Column(String(30), default="submitted")
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    submitted_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="quiz_attempts")
    lesson = relationship("Lesson", back_populates="quiz_attempts")
    results = relationship("QuizResult", back_populates="attempt", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<QuizAttempt(id={self.id}, user_id={self.user_id}, lesson_id={self.lesson_id})>"


class QuizResult(Base):
    """User quiz results."""
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(Text)  # For text answers or stored option ID
    is_correct = Column(Boolean, default=False)
    points_earned = Column(Float, default=0.0)
    time_spent_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="quiz_results")
    attempt = relationship("QuizAttempt", back_populates="results")
    question = relationship("Question", back_populates="results")

    def __repr__(self):
        return f"<QuizResult(id={self.id}, user_id={self.user_id}, question_id={self.question_id})>"


class ChatHistory(Base):
    """Chat history with AI chatbot."""
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    session_id = Column(String(64), nullable=True, index=True)
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text)
    response_mode = Column(String(30), default="fallback")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chat_history")

    def __repr__(self):
        return f"<ChatHistory(id={self.id}, user_id={self.user_id})>"


class LessonProgress(Base):
    """Per-student progress for each lesson."""
    __tablename__ = "lesson_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_lesson_progress_user_lesson"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    status = Column(String(30), default="not_started")  # not_started, in_progress, completed, needs_review
    progress_percent = Column(Float, default=0.0)
    view_count = Column(Integer, default=0)
    simulation_count = Column(Integer, default=0)
    assistant_question_count = Column(Integer, default=0)
    quiz_attempt_count = Column(Integer, default=0)
    best_quiz_score = Column(Float, default=0.0)
    average_quiz_score = Column(Float, default=0.0)
    time_spent_seconds = Column(Integer, default=0)
    last_activity_type = Column(String(50))
    last_accessed_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress_records")

    def __repr__(self):
        return f"<LessonProgress(user_id={self.user_id}, lesson_id={self.lesson_id}, status={self.status})>"


class LearningEvent(Base):
    """Fine-grained activity log for personalization."""
    __tablename__ = "learning_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True, index=True)
    client_event_id = Column(String(80), nullable=True, unique=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    duration_seconds = Column(Integer, default=0)
    score = Column(Float, nullable=True)
    payload = Column(JSON, nullable=True)
    occurred_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="learning_events")
    lesson = relationship("Lesson", back_populates="learning_events")

    def __repr__(self):
        return f"<LearningEvent(user_id={self.user_id}, event_type={self.event_type})>"


class ReferenceMaterial(Base):
    """Teacher-uploaded reference files shared by all users."""
    __tablename__ = "reference_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, default="")
    course_id = Column(Integer, nullable=True, index=True)
    lesson_id = Column(Integer, nullable=True, index=True)
    file_name = Column(String(255), nullable=False)
    stored_file_name = Column(String(255), nullable=False, unique=True)
    file_type = Column(String(150), default="")
    file_size = Column(Integer, default=0)
    file_checksum = Column(String(64), nullable=True, index=True)
    uploader = Column(String(100), default="Giáo viên")
    uploader_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    uploader_user = relationship("User", back_populates="reference_materials")

    def __repr__(self):
        return f"<ReferenceMaterial(id={self.id}, title={self.title})>"


class ClassroomPost(Base):
    """Shared classroom announcement or discussion post."""
    __tablename__ = "classroom_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    post_type = Column(String(30), default="announcement")
    status = Column(String(30), default="published", index=True)
    course_id = Column(Integer, nullable=True, index=True)
    author = Column(String(100), default="Giáo viên")
    author_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    author_user = relationship("User", back_populates="classroom_posts")


class Assignment(Base):
    """Task assigned to students."""
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    course_id = Column(Integer, nullable=True, index=True)
    lesson_id = Column(Integer, nullable=True, index=True)
    status = Column(String(30), default="published", index=True)
    due_at = Column(DateTime, nullable=True)
    created_by = Column(String(100), default="Giáo viên")
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    submissions = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan")


class AssignmentSubmission(Base):
    """Student assignment submission."""
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False, index=True)
    student_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    student_name = Column(String(100), default="Học sinh")
    content = Column(Text, default="")
    file_name = Column(String(255), nullable=True)
    stored_file_name = Column(String(255), nullable=True, unique=True)
    file_type = Column(String(150), default="")
    file_size = Column(Integer, default=0)
    file_checksum = Column(String(64), nullable=True, index=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, default="")
    graded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    graded_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow, index=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student_user = relationship(
        "User",
        back_populates="assignment_submissions",
        foreign_keys=[student_user_id],
    )
