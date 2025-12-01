from flask import Blueprint, request, jsonify # type: ignore
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_current_user # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
from api.models import db, User, Plate, PlateStatus, PlateScan, CheckHistory
import secrets
from datetime import datetime, timedelta
from .utils.email_utils import send_email

api = Blueprint("api", __name__)


# ===================== REGISTER ======================
@api.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username or not password or not email:
        return jsonify({"error": "Missing required fields: username, password, email"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    # Primer usuario = admin, resto = user
    role = "admin" if not User.query.filter_by(role="admin").first() else "user"

    user = User(
        username=username,
        password=generate_password_hash(password),
        email=email,
        role=role,
        active=True
    )
    db.session.add(user)
    db.session.commit()

    return jsonify(user.serialize()), 201


# ===================== LOGIN ======================
@api.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token})


# ========== CHECK PLATE (ENDPOINT PRINCIPAL) ==========
@api.route("/plates/check", methods=["POST"])
@jwt_required()
def check_plate():
    data = request.get_json() or {}
    raw_plate = data.get("plate", "").strip().upper()

    if not raw_plate:
        return jsonify({"error": "Missing plate"}), 400

    # Buscar o crear placa
    plate = Plate.query.filter_by(plate=raw_plate).first()
    if not plate:
        plate = Plate(plate=raw_plate, exists_in_system=False)
        db.session.add(plate)
        db.session.commit()
        status_text = "Normal"
    else:
        last_status = (
            PlateStatus.query.filter_by(plate_id=plate.id)
            .order_by(PlateStatus.reported_at.desc())
            .first()
        )
        status_text = last_status.status if last_status else "Normal"

    user_id = get_jwt_identity()

    # Registrar historial
    history = CheckHistory(
        plate=raw_plate,
        user_id=user_id,
        status=status_text
    )
    db.session.add(history)

    # Registrar escaneo opcional
    raw_text = data.get("raw_text", "")
    confidence = float(data.get("confidence", 0.0))
    image_path = data.get("image_path")

    scan = PlateScan(
        plate_id=plate.id,
        raw_text=raw_text,
        confidence=confidence,
        image_path=image_path,
        scanned_by=user_id,
        scanned_at=datetime.utcnow()
    )
    db.session.add(scan)

    db.session.commit()

    return jsonify({
        "plate": plate.plate,
        "status": status_text
    })


# ============== ADMIN: ACTUALIZAR ESTADO DE UNA PLACA ==============
@api.route("/plates/<int:plate_id>/status", methods=["PUT"])
@jwt_required()
def set_plate_status(plate_id):
    user = User.query.get(get_jwt_identity())
    if user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json() or {}
    status_text = data.get("status")
    reason = data.get("reason", "")

    if not status_text:
        return jsonify({"error": "Missing status"}), 400

    plate = Plate.query.get(plate_id)
    if not plate:
        return jsonify({"error": "Plate not found"}), 404

    new_status = PlateStatus(
        plate_id=plate.id,
        status=status_text,
        reason=reason,
        reported_by=user.id,
        reported_at=datetime.utcnow()
    )

    db.session.add(new_status)
    db.session.commit()

    return jsonify({"message": "Status updated"})


# ================= HISTORIAL (USER & ADMIN) ==================
@api.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    user = User.query.get(get_jwt_identity())

    if user.role == "admin":
        history = CheckHistory.query.order_by(CheckHistory.checked_at.desc()).all()
    else:
        history = CheckHistory.query.filter_by(user_id=user.id)\
                                    .order_by(CheckHistory.checked_at.desc())\
                                    .all()

    return jsonify([h.serialize() for h in history])
