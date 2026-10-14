from ai_tutor import AITutorError
from test_learning_workflow import api


def test_workspace_requires_auth_and_teacher_role(api):
    client, _, _, headers = api
    body = {"lesson_id": 110101, "task": "assessment", "request": "Tạo đề"}
    assert client.get('/api/ai-workspace/lessons').status_code == 401
    assert client.post('/api/ai-workspace/generate', json=body, headers=headers['student']).status_code == 403
    body['task'] = 'unknown'
    assert client.post('/api/ai-workspace/generate', json=body, headers=headers['teacher']).status_code == 422


def test_workspace_uses_authenticated_identity_without_changing_progress(api, monkeypatch):
    client, Session, identities, headers = api
    captured = {}

    async def fake_reply(message, **kwargs):
        captured.update(kwargs)
        return 'Nội dung AI'

    monkeypatch.setattr('routes.ai_workspace.generate_ai_tutor_reply', fake_reply)
    for role, task, draft in [('student', 'practice', False), ('teacher', 'lesson_plan', True)]:
        response = client.post('/api/ai-workspace/generate', json={
            'lesson_id': 110101, 'task': task, 'request': 'Hỗ trợ bài học',
        }, headers=headers[role])
        assert response.status_code == 200
        assert response.json()['is_draft'] is draft
        assert response.json()['context']['lesson_id'] == 110101
        assert captured['user'].id == identities[role]
        assert captured['lesson'].id == 110101
    from models import LessonProgress
    with Session() as db:
        assert db.query(LessonProgress).count() == 0


def test_workspace_reports_provider_failure_and_missing_lesson(api, monkeypatch):
    client, _, _, headers = api

    async def unavailable(*args, **kwargs):
        raise AITutorError('private provider details')

    monkeypatch.setattr('routes.ai_workspace.generate_ai_tutor_reply', unavailable)
    body = {'lesson_id': 110101, 'task': 'explain', 'request': 'Giải thích'}
    response = client.post('/api/ai-workspace/generate', json=body, headers=headers['student'])
    assert response.status_code == 503
    assert 'private provider details' not in response.text
    body['lesson_id'] = -1
    assert client.post('/api/ai-workspace/generate', json=body, headers=headers['student']).status_code == 404
    body['request'] = '   '
    assert client.post('/api/ai-workspace/generate', json=body, headers=headers['student']).status_code == 422
