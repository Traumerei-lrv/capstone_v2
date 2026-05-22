-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  points integer DEFAULT 0,
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  scope USER-DEFINED NOT NULL,
  course_id uuid,
  section_id uuid,
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT announcements_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id),
  CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.assessment_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  assessment_id uuid,
  user_id uuid,
  score integer DEFAULT 0,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_attempts_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id),
  CONSTRAINT assessment_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.assessments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  topic_id uuid,
  mission_id uuid,
  title text NOT NULL,
  type USER-DEFINED NOT NULL,
  total_points integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assessments_pkey PRIMARY KEY (id),
  CONSTRAINT assessments_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id),
  CONSTRAINT assessments_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id),
  CONSTRAINT assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.challenge_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  challenge_id uuid,
  user_id uuid,
  completed boolean DEFAULT false,
  score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT challenge_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_attempts_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT challenge_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  topic_id uuid,
  title text NOT NULL,
  description text,
  reward_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id)
);
CREATE TABLE public.choices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question_id uuid,
  label text NOT NULL,
  is_correct boolean DEFAULT false,
  CONSTRAINT choices_pkey PRIMARY KEY (id),
  CONSTRAINT choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.course_enrollments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  course_id uuid,
  role_in_course USER-DEFINED NOT NULL DEFAULT 'student'::user_role,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT course_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  instructor_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  topic_id uuid,
  mission_id uuid,
  title text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materials_pkey PRIMARY KEY (id),
  CONSTRAINT materials_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id),
  CONSTRAINT materials_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id),
  CONSTRAINT materials_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.mission_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  mission_id uuid,
  user_id uuid,
  score integer NOT NULL DEFAULT 0,
  completed boolean DEFAULT false,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT mission_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT mission_attempts_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id),
  CONSTRAINT mission_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.missions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  topic_id uuid,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  CONSTRAINT missions_pkey PRIMARY KEY (id),
  CONSTRAINT missions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role USER-DEFINED NOT NULL DEFAULT 'student'::user_role,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  assessment_id uuid,
  prompt text NOT NULL,
  difficulty integer DEFAULT 1,
  question_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id)
);
CREATE TABLE public.section_enrollments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  section_id uuid,
  role_in_section USER-DEFINED NOT NULL DEFAULT 'student'::user_role,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT section_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT section_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT section_enrollments_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id)
);
CREATE TABLE public.sections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  course_id uuid,
  name text NOT NULL,
  instructor_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sections_pkey PRIMARY KEY (id),
  CONSTRAINT sections_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT sections_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.topics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  CONSTRAINT topics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  achievement_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);
CREATE TABLE public.user_points (
  user_id uuid NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_points_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  mission_id uuid,
  status text DEFAULT 'not_started'::text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_progress_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id)
);