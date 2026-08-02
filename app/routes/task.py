from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Task

task_bp = Blueprint('task', __name__, url_prefix='/api/tasks')

# 1. CREATE A TASK
@task_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title')
    description = data.get('description', '')
    priority = data.get('priority', 'Medium')

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    new_task = Task(
        title=title,
        description=description,
        priority=priority,
        user_id=current_user_id
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify({
        'message': 'Task created successfully',
        'task': {
            'id': new_task.id,
            'title': new_task.title,
            'description': new_task.description,
            'status': new_task.status,
            'priority': new_task.priority,
            'created_at': new_task.created_at
        }
    }), 201

# 2. GET ALL TASKS FOR CURRENT USER
@task_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user_id = int(get_jwt_identity())
    
    # Optional status filter (?status=completed)
    status_filter = request.args.get('status')
    
    query = Task.query.filter_by(user_id=current_user_id)
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    tasks = query.all()

    tasks_data = [{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'created_at': task.created_at
    } for task in tasks]

    return jsonify({'tasks': tasks_data}), 200

# 3. UPDATE A TASK
@task_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    data = request.get_json() or {}
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.priority = data.get('priority', task.priority)

    db.session.commit()

    return jsonify({
        'message': 'Task updated successfully',
        'task': {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status,
            'priority': task.priority
        }
    }), 200

# 4. DELETE A TASK
@task_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted successfully'}), 200