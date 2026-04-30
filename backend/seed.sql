-- No seed data - students are added by mentors via the API
-- Sessions can be added via the API or manually if needed
(4, 'ReAct Agent Pattern Slides', 'slides', 'https://docs.google.com/presentation/d/...'),
(6, 'pgvector RAG Code', 'link', 'https://github.com/...'),
(8, 'Multi-Agent Frameworks', 'document', 'https://docs.google.com/document/d/...');

-- 4. Insert Attendance (Sample for first 3 sessions)
-- Will use a script or procedural block if needed, but doing simple inserts
INSERT INTO public.attendance (student_id, session_id, present)
SELECT id, 1, (random() > 0.2) FROM public.students;

INSERT INTO public.attendance (student_id, session_id, present)
SELECT id, 2, (random() > 0.1) FROM public.students;

INSERT INTO public.attendance (student_id, session_id, present)
SELECT id, 3, (random() > 0.3) FROM public.students;
