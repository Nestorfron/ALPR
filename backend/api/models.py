from flask_sqlalchemy import SQLAlchemy  # type: ignore
from config import Config
from datetime import datetime

db = SQLAlchemy(engine_options=Config.SQLALCHEMY_ENGINE_OPTIONS)


# ------------------- User -------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128), index=True, unique=True)
    password = db.Column(db.String(512))
    email = db.Column(db.String(128), unique=True)
    active = db.Column(db.Boolean(), default=True)
    role = db.Column(db.String(32), default="user")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reported_plates = db.relationship("PlateStatus", backref="reporter", lazy=True)
    scans = db.relationship("PlateScan", backref="scanner", lazy=True)
    history = db.relationship("CheckHistory", backref="user", lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"
    
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "active": self.active,
            "role": self.role
        }


# ------------------- Plate -------------------
class Plate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plate = db.Column(db.String(10), unique=True, nullable=False, index=True)
    exists_in_system = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    statuses = db.relationship("PlateStatus", backref="plate_obj", lazy=True)
    scans = db.relationship("PlateScan", backref="plate_obj", lazy=True)

    def __repr__(self):
        return f"<Plate {self.plate}>"

    def serialize(self):
        return {
            "id": self.id,
            "plate": self.plate,
            "exists_in_system": self.exists_in_system
        }


# ------------------- Plate Status -------------------
class PlateStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plate_id = db.Column(db.Integer, db.ForeignKey("plate.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # Normal, Requerida, Robada, etc.
    reason = db.Column(db.String(255))
    reported_by = db.Column(db.Integer, db.ForeignKey("user.id"))
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<PlateStatus {self.status} for {self.plate_obj.plate}>"

    def serialize(self):
        return {
            "id": self.id,
            "plate_id": self.plate_id,
            "status": self.status,
            "reason": self.reason,
            "reported_by": self.reported_by,
            "reported_at": self.reported_at.isoformat()
        }


# ------------------- Plate Scan -------------------
class PlateScan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plate_id = db.Column(db.Integer, db.ForeignKey("plate.id"))
    raw_text = db.Column(db.Text)
    confidence = db.Column(db.Float)
    image_path = db.Column(db.String(255))
    scanned_by = db.Column(db.Integer, db.ForeignKey("user.id"))
    scanned_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<PlateScan {self.plate_obj.plate if self.plate_obj else 'Unknown'}>"

    def serialize(self):
        return {
            "id": self.id,
            "plate_id": self.plate_id,
            "raw_text": self.raw_text,
            "confidence": self.confidence,
            "image_path": self.image_path,
            "scanned_by": self.scanned_by,
            "scanned_at": self.scanned_at.isoformat()
        }


# ------------------- Check History -------------------
class CheckHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plate = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    checked_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<CheckHistory {self.plate} by User {self.user_id}>"

    def serialize(self):
        return {
            "id": self.id,
            "plate": self.plate,
            "user_id": self.user_id,
            "status": self.status,
            "checked_at": self.checked_at.isoformat()
        }
