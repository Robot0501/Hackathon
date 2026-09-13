"""
Richfield Connect - Professional Networking & Employability Platform
Full-stack backend: auth, profiles, network, feed, jobs, applications,
messaging, notifications, AI (GPT-5.6-terra), CV parsing, admin.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header, Query, WebSocket, WebSocketDisconnect, Response
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os, uuid, logging, json, asyncio, bcrypt, jwt, requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'chelseamudadisi@gmail.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Admin@2026Richfield')

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "richfield-connect"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logger = logging.getLogger("rfconnect")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Richfield Connect API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

INSTITUTIONAL_DOMAINS = {"richfield.ac.za", "aaa.ac.za"}
ROLES = {"student", "alumni", "employer", "admin"}

# ============================ Storage ============================
storage_key = None
def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ============================ Utils ============================
def now_iso():
    return datetime.now(timezone.utc).isoformat()

def new_id():
    return str(uuid.uuid4())

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def make_token(user_id: str, role: str) -> str:
    payload = {"sub": user_id, "role": role, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = decode_token(creds.credentials)
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(401, "User not found")
    if user.get("status") == "suspended":
        raise HTTPException(403, "Account suspended")
    return user

def require_roles(*roles):
    async def _dep(user: dict = Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(403, "Forbidden: insufficient role")
        return user
    return _dep

async def audit(actor_id: str, action: str, target: str = "", meta: dict = None):
    await db.audit_logs.insert_one({
        "id": new_id(), "actor_id": actor_id, "action": action,
        "target": target, "meta": meta or {}, "at": now_iso()
    })

def public_user(u: dict) -> dict:
    if not u:
        return None
    return {k: u.get(k) for k in ["id", "email", "role", "first_name", "last_name",
                                   "status", "verified", "avatar_url", "headline",
                                   "created_at"]}

# ============================ Models ============================
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str
    # alumni fields
    graduation_year: Optional[int] = None
    qualification: Optional[str] = None
    institution: Optional[str] = None
    student_number: Optional[str] = None
    # employer fields
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_industry: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdateIn(BaseModel):
    model_config = ConfigDict(extra="allow")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    institution: Optional[str] = None
    qualification: Optional[str] = None
    year_of_study: Optional[str] = None
    graduation_year: Optional[int] = None
    current_position: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    career_interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    work_experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    # employer
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None
    company_logo_url: Optional[str] = None
    contact_email: Optional[str] = None

class PostIn(BaseModel):
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None  # image|video

class CommentIn(BaseModel):
    content: str

class JobIn(BaseModel):
    title: str
    description: str
    requirements: str
    qualifications: str
    skills: List[str] = []
    location: str
    work_mode: str  # remote|hybrid|onsite
    employment_type: str  # full-time|part-time|internship|graduate
    salary_range: Optional[str] = None
    application_deadline: Optional[str] = None
    industry: Optional[str] = None
    experience_level: Optional[str] = None

class ApplicationIn(BaseModel):
    cover_letter: Optional[str] = None

class MessageIn(BaseModel):
    recipient_id: str
    content: str

class ReportIn(BaseModel):
    target_type: str  # post|user|job|message
    target_id: str
    category: str
    reason: Optional[str] = None

class AnnouncementIn(BaseModel):
    title: str
    body: str

class AIChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None

class RecommendationIn(BaseModel):
    recipient_id: str
    relationship: str
    content: str

class EndorseIn(BaseModel):
    user_id: str
    skill: str

# ============================ Auth ============================
@api_router.post("/auth/register")
async def register(body: RegisterIn):
    role = body.role.lower().strip()
    if role not in {"student", "alumni", "employer"}:
        raise HTTPException(400, "Invalid role for registration")
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    domain = email.split("@")[-1]
    if role == "student":
        if domain not in INSTITUTIONAL_DOMAINS:
            raise HTTPException(400, f"Student registration requires an institutional email ({', '.join(INSTITUTIONAL_DOMAINS)})")
    verified = role == "student"  # students auto-verified by domain
    status = "active"
    if role == "alumni":
        status = "pending_verification"
    elif role == "employer":
        status = "pending_approval"
    user_id = new_id()
    user = {
        "id": user_id, "email": email, "password": hash_pw(body.password),
        "role": role, "first_name": body.first_name, "last_name": body.last_name,
        "status": status, "verified": verified, "avatar_url": None,
        "headline": "", "bio": "", "skills": [], "certifications": [],
        "projects": [], "work_experience": [], "education": [],
        "created_at": now_iso(),
    }
    if role == "student":
        user.update({"institution": body.institution or "", "qualification": body.qualification or "",
                     "year_of_study": "", "career_interests": [], "github": "", "linkedin": "",
                     "portfolio": "", "cv_path": None})
    elif role == "alumni":
        user.update({
            "graduation_year": body.graduation_year, "qualification": body.qualification or "",
            "institution": body.institution or "", "student_number": body.student_number or "",
            "current_position": "", "company": "", "industry": "",
            "github": "", "linkedin": "", "cv_path": None,
        })
    elif role == "employer":
        user.update({
            "company_name": body.company_name or "", "company_website": body.company_website or "",
            "company_industry": body.company_industry or "", "company_description": "",
            "company_logo_url": None, "location": "", "contact_email": email,
        })
    await db.users.insert_one(user)
    await audit(user_id, "register", user_id, {"role": role})
    token = make_token(user_id, role)
    return {"token": token, "user": public_user(user)}

@api_router.post("/auth/login")
async def login(body: LoginIn):
    email = body.email.lower().strip()
    u = await db.users.find_one({"email": email})
    if not u or not verify_pw(body.password, u["password"]):
        raise HTTPException(401, "Invalid credentials")
    if u.get("status") == "suspended":
        raise HTTPException(403, "Account suspended")
    token = make_token(u["id"], u["role"])
    return {"token": token, "user": public_user(u)}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return u

# ============================ Users / Profiles ============================
def profile_completion(u: dict) -> dict:
    checks = []
    if u["role"] == "student":
        checks = [
            ("Profile photo", bool(u.get("avatar_url"))),
            ("Headline", bool(u.get("headline"))),
            ("Biography", bool(u.get("bio"))),
            ("Institution & qualification", bool(u.get("institution")) and bool(u.get("qualification"))),
            ("At least 3 skills", len(u.get("skills") or []) >= 3),
            ("A project", len(u.get("projects") or []) >= 1),
            ("Certification", len(u.get("certifications") or []) >= 1),
            ("CV uploaded", bool(u.get("cv_path"))),
            ("GitHub or portfolio", bool(u.get("github")) or bool(u.get("portfolio"))),
            ("Career interests", len(u.get("career_interests") or []) >= 1),
        ]
    elif u["role"] == "alumni":
        checks = [
            ("Profile photo", bool(u.get("avatar_url"))),
            ("Headline", bool(u.get("headline"))),
            ("Biography", bool(u.get("bio"))),
            ("Current position", bool(u.get("current_position"))),
            ("Company", bool(u.get("company"))),
            ("Skills (3+)", len(u.get("skills") or []) >= 3),
            ("Work experience", len(u.get("work_experience") or []) >= 1),
            ("LinkedIn", bool(u.get("linkedin"))),
        ]
    elif u["role"] == "employer":
        checks = [
            ("Company logo", bool(u.get("company_logo_url"))),
            ("Company description", bool(u.get("company_description"))),
            ("Website", bool(u.get("company_website"))),
            ("Industry", bool(u.get("company_industry"))),
            ("Location", bool(u.get("location"))),
        ]
    total = len(checks) or 1
    completed = sum(1 for _, ok in checks if ok)
    pct = int(100 * completed / total)
    missing = [name for name, ok in checks if not ok]
    return {"percentage": pct, "missing": missing, "completed": completed, "total": total}

@api_router.get("/profiles/{user_id}")
async def get_profile(user_id: str, viewer: dict = Depends(get_current_user)):
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not u:
        raise HTTPException(404, "User not found")
    # increment views (not self)
    if viewer["id"] != user_id:
        await db.profile_views.insert_one({"id": new_id(), "profile_id": user_id, "viewer_id": viewer["id"], "at": now_iso()})
    u["completion"] = profile_completion(u)
    return u

@api_router.put("/profiles/me")
async def update_my_profile(body: ProfileUpdateIn, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    u["completion"] = profile_completion(u)
    return u

@api_router.get("/users/search")
async def search_users(q: str = "", role: Optional[str] = None, limit: int = 30, user: dict = Depends(get_current_user)):
    query: Dict[str, Any] = {"status": {"$ne": "suspended"}, "id": {"$ne": user["id"]}}
    if role:
        query["role"] = role
    if q:
        query["$or"] = [
            {"first_name": {"$regex": q, "$options": "i"}},
            {"last_name": {"$regex": q, "$options": "i"}},
            {"headline": {"$regex": q, "$options": "i"}},
            {"company_name": {"$regex": q, "$options": "i"}},
            {"skills": {"$regex": q, "$options": "i"}},
        ]
    users = await db.users.find(query, {"_id": 0, "password": 0}).limit(limit).to_list(limit)
    return [public_user(u) | {"headline": u.get("headline", ""), "company_name": u.get("company_name")} for u in users]

@api_router.get("/users/suggested")
async def suggested(user: dict = Depends(get_current_user)):
    # connections
    conns = await db.connections.find({"$or": [{"a": user["id"]}, {"b": user["id"]}]}).to_list(500)
    connected_ids = set()
    for c in conns:
        connected_ids.add(c["a"]); connected_ids.add(c["b"])
    exclude = list(connected_ids | {user["id"]})
    query = {"id": {"$nin": exclude}, "status": {"$ne": "suspended"}}
    users = await db.users.find(query, {"_id": 0, "password": 0}).limit(12).to_list(12)
    return [public_user(u) | {"headline": u.get("headline", ""), "company_name": u.get("company_name")} for u in users]

# ============================ Uploads (Avatar / CV / Video) ============================
@api_router.post("/uploads/avatar")
async def upload_avatar(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    if ext not in {"png", "jpg", "jpeg", "webp"}:
        raise HTTPException(400, "Unsupported image type")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(400, "Max 5MB")
    path = f"{APP_NAME}/avatars/{user['id']}/{new_id()}.{ext}"
    res = put_object(path, data, file.content_type or "image/jpeg")
    await db.users.update_one({"id": user["id"]}, {"$set": {"avatar_url": res["path"]}})
    return {"path": res["path"]}

@api_router.post("/uploads/media")
async def upload_media(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    kind = None
    if ext in {"png", "jpg", "jpeg", "webp", "gif"}:
        kind = "image"; limit = 8 * 1024 * 1024
    elif ext in {"mp4", "webm", "mov"}:
        kind = "video"; limit = 40 * 1024 * 1024
    else:
        raise HTTPException(400, "Unsupported media type")
    data = await file.read()
    if len(data) > limit:
        raise HTTPException(400, f"Max {limit // (1024*1024)}MB")
    path = f"{APP_NAME}/media/{user['id']}/{new_id()}.{ext}"
    res = put_object(path, data, file.content_type or "application/octet-stream")
    await db.media.insert_one({
        "id": new_id(), "path": res["path"], "owner_id": user["id"], "kind": kind,
        "content_type": file.content_type, "size": res["size"], "is_deleted": False,
        "created_at": now_iso(),
    })
    return {"path": res["path"], "kind": kind}

@api_router.post("/uploads/cv")
async def upload_cv(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    if ext not in {"pdf", "docx", "txt"}:
        raise HTTPException(400, "CV must be PDF, DOCX, or TXT")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(400, "Max 8MB")
    path = f"{APP_NAME}/cvs/{user['id']}/{new_id()}.{ext}"
    ct = "application/pdf" if ext == "pdf" else ("application/vnd.openxmlformats-officedocument.wordprocessingml.document" if ext == "docx" else "text/plain")
    res = put_object(path, data, ct)
    await db.users.update_one({"id": user["id"]}, {"$set": {"cv_path": res["path"], "cv_filename": file.filename}})
    return {"path": res["path"], "filename": file.filename}

@api_router.get("/files/{path:path}")
async def download_file(path: str, user: dict = Depends(get_current_user)):
    data, ct = get_object(path)
    return Response(content=data, media_type=ct)

# ============================ Connections ============================
def conn_key(a: str, b: str):
    return sorted([a, b])

@api_router.post("/connections/request/{target_id}")
async def send_request(target_id: str, user: dict = Depends(get_current_user)):
    if target_id == user["id"]:
        raise HTTPException(400, "Cannot connect with yourself")
    target = await db.users.find_one({"id": target_id})
    if not target:
        raise HTTPException(404, "User not found")
    a, b = conn_key(user["id"], target_id)
    existing = await db.connections.find_one({"a": a, "b": b})
    if existing:
        raise HTTPException(400, f"Connection already {existing['status']}")
    doc = {"id": new_id(), "a": a, "b": b, "status": "pending",
           "requested_by": user["id"], "created_at": now_iso()}
    await db.connections.insert_one(doc)
    await push_notification(target_id, "connection_request",
                            f"{user['first_name']} {user['last_name']} sent you a connection request",
                            {"from_user_id": user["id"]})
    return {"ok": True}

@api_router.post("/connections/{target_id}/accept")
async def accept_conn(target_id: str, user: dict = Depends(get_current_user)):
    a, b = conn_key(user["id"], target_id)
    c = await db.connections.find_one({"a": a, "b": b, "status": "pending"})
    if not c:
        raise HTTPException(404, "Request not found")
    if c["requested_by"] == user["id"]:
        raise HTTPException(400, "Cannot accept your own request")
    await db.connections.update_one({"id": c["id"]}, {"$set": {"status": "accepted", "accepted_at": now_iso()}})
    await push_notification(c["requested_by"], "connection_accepted",
                            f"{user['first_name']} {user['last_name']} accepted your connection request",
                            {"from_user_id": user["id"]})
    return {"ok": True}

@api_router.post("/connections/{target_id}/reject")
async def reject_conn(target_id: str, user: dict = Depends(get_current_user)):
    a, b = conn_key(user["id"], target_id)
    await db.connections.delete_one({"a": a, "b": b, "status": "pending"})
    return {"ok": True}

@api_router.delete("/connections/{target_id}")
async def remove_conn(target_id: str, user: dict = Depends(get_current_user)):
    a, b = conn_key(user["id"], target_id)
    await db.connections.delete_one({"a": a, "b": b})
    return {"ok": True}

@api_router.get("/connections")
async def list_connections(status: str = "accepted", user: dict = Depends(get_current_user)):
    cs = await db.connections.find({"$or": [{"a": user["id"]}, {"b": user["id"]}], "status": status}).to_list(500)
    out = []
    for c in cs:
        other_id = c["b"] if c["a"] == user["id"] else c["a"]
        other = await db.users.find_one({"id": other_id}, {"_id": 0, "password": 0})
        if other:
            out.append({"connection_id": c["id"], "status": c["status"],
                       "requested_by": c["requested_by"], "user": public_user(other) | {"headline": other.get("headline", ""), "company_name": other.get("company_name")}})
    return out

# ============================ Feed (Posts/Comments/Reactions) ============================
@api_router.post("/posts")
async def create_post(body: PostIn, user: dict = Depends(get_current_user)):
    p = {"id": new_id(), "author_id": user["id"], "content": body.content,
         "media_url": body.media_url, "media_type": body.media_type,
         "likes": [], "comments_count": 0, "created_at": now_iso(),
         "is_deleted": False, "reports_count": 0}
    await db.posts.insert_one(p)
    return p

@api_router.get("/posts")
async def list_posts(limit: int = 30, user: dict = Depends(get_current_user)):
    posts = await db.posts.find({"is_deleted": False}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    author_ids = list({p["author_id"] for p in posts})
    authors = {u["id"]: public_user(u) | {"headline": u.get("headline", "")} for u in await db.users.find({"id": {"$in": author_ids}}).to_list(len(author_ids))}
    for p in posts:
        p["author"] = authors.get(p["author_id"])
        p["liked_by_me"] = user["id"] in (p.get("likes") or [])
        p["likes_count"] = len(p.get("likes") or [])
    return posts

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, user: dict = Depends(get_current_user)):
    p = await db.posts.find_one({"id": post_id})
    if not p:
        raise HTTPException(404, "Post not found")
    if user["id"] in (p.get("likes") or []):
        await db.posts.update_one({"id": post_id}, {"$pull": {"likes": user["id"]}})
        return {"liked": False}
    await db.posts.update_one({"id": post_id}, {"$addToSet": {"likes": user["id"]}})
    return {"liked": True}

@api_router.post("/posts/{post_id}/comments")
async def comment_post(post_id: str, body: CommentIn, user: dict = Depends(get_current_user)):
    p = await db.posts.find_one({"id": post_id})
    if not p:
        raise HTTPException(404, "Post not found")
    c = {"id": new_id(), "post_id": post_id, "author_id": user["id"],
         "content": body.content, "created_at": now_iso()}
    await db.comments.insert_one(c)
    await db.posts.update_one({"id": post_id}, {"$inc": {"comments_count": 1}})
    return c

@api_router.get("/posts/{post_id}/comments")
async def list_comments(post_id: str, user: dict = Depends(get_current_user)):
    cs = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    aids = list({c["author_id"] for c in cs})
    authors = {u["id"]: public_user(u) for u in await db.users.find({"id": {"$in": aids}}).to_list(len(aids))}
    for c in cs:
        c["author"] = authors.get(c["author_id"])
    return cs

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user: dict = Depends(get_current_user)):
    p = await db.posts.find_one({"id": post_id})
    if not p:
        raise HTTPException(404, "Not found")
    if p["author_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(403, "Forbidden")
    await db.posts.update_one({"id": post_id}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ============================ Skills & Endorsements ============================
@api_router.post("/endorsements")
async def endorse(body: EndorseIn, user: dict = Depends(get_current_user)):
    if body.user_id == user["id"]:
        raise HTTPException(400, "Cannot endorse yourself")
    a, b = conn_key(user["id"], body.user_id)
    conn = await db.connections.find_one({"a": a, "b": b, "status": "accepted"})
    if not conn:
        raise HTTPException(403, "You can only endorse your connections")
    doc = {"id": new_id(), "endorser_id": user["id"], "user_id": body.user_id,
           "skill": body.skill, "created_at": now_iso()}
    await db.endorsements.update_one(
        {"endorser_id": user["id"], "user_id": body.user_id, "skill": body.skill},
        {"$setOnInsert": doc}, upsert=True)
    return {"ok": True}

@api_router.get("/endorsements/{user_id}")
async def get_endorsements(user_id: str, user: dict = Depends(get_current_user)):
    es = await db.endorsements.find({"user_id": user_id}, {"_id": 0}).to_list(500)
    counts: Dict[str, int] = {}
    for e in es:
        counts[e["skill"]] = counts.get(e["skill"], 0) + 1
    return {"skill_counts": counts, "total": len(es)}

# ============================ Recommendations ============================
@api_router.post("/recommendations")
async def create_rec(body: RecommendationIn, user: dict = Depends(get_current_user)):
    doc = {"id": new_id(), "author_id": user["id"], "recipient_id": body.recipient_id,
           "relationship": body.relationship, "content": body.content, "created_at": now_iso()}
    await db.recommendations.insert_one(doc)
    await push_notification(body.recipient_id, "recommendation",
                            f"{user['first_name']} {user['last_name']} wrote you a recommendation", {})
    return doc

@api_router.get("/recommendations/{user_id}")
async def list_recs(user_id: str, user: dict = Depends(get_current_user)):
    rs = await db.recommendations.find({"recipient_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    aids = list({r["author_id"] for r in rs})
    authors = {u["id"]: public_user(u) for u in await db.users.find({"id": {"$in": aids}}).to_list(len(aids))}
    for r in rs:
        r["author"] = authors.get(r["author_id"])
    return rs

# ============================ Jobs ============================
@api_router.post("/jobs")
async def create_job(body: JobIn, user: dict = Depends(require_roles("employer"))):
    if user.get("status") != "active":
        raise HTTPException(403, "Employer not yet approved")
    j = body.model_dump()
    j.update({"id": new_id(), "employer_id": user["id"], "status": "pending",
              "created_at": now_iso(), "views": 0})
    await db.jobs.insert_one(j)
    return j

@api_router.get("/jobs")
async def list_jobs(q: str = "", employment_type: Optional[str] = None,
                    work_mode: Optional[str] = None, location: Optional[str] = None,
                    status: str = "approved", user: dict = Depends(get_current_user)):
    query: Dict[str, Any] = {}
    if user["role"] == "employer":
        query["employer_id"] = user["id"]
    elif user["role"] == "admin":
        if status:
            query["status"] = status
    else:
        query["status"] = "approved"
    if employment_type:
        query["employment_type"] = employment_type
    if work_mode:
        query["work_mode"] = work_mode
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"skills": {"$regex": q, "$options": "i"}},
        ]
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    eids = list({j["employer_id"] for j in jobs})
    emps = {u["id"]: {"company_name": u.get("company_name"), "company_logo_url": u.get("company_logo_url")}
            for u in await db.users.find({"id": {"$in": eids}}).to_list(len(eids))}
    for j in jobs:
        j["employer"] = emps.get(j["employer_id"])
    return jobs

@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str, user: dict = Depends(get_current_user)):
    j = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not j:
        raise HTTPException(404, "Job not found")
    emp = await db.users.find_one({"id": j["employer_id"]}, {"_id": 0, "password": 0})
    j["employer"] = {"id": emp["id"], "company_name": emp.get("company_name"), "company_logo_url": emp.get("company_logo_url"),
                     "company_description": emp.get("company_description"), "company_website": emp.get("company_website")}
    await db.jobs.update_one({"id": job_id}, {"$inc": {"views": 1}})
    return j

@api_router.put("/jobs/{job_id}")
async def update_job(job_id: str, body: JobIn, user: dict = Depends(require_roles("employer"))):
    j = await db.jobs.find_one({"id": job_id})
    if not j or j["employer_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    await db.jobs.update_one({"id": job_id}, {"$set": body.model_dump()})
    return await db.jobs.find_one({"id": job_id}, {"_id": 0})

@api_router.post("/jobs/{job_id}/close")
async def close_job(job_id: str, user: dict = Depends(require_roles("employer"))):
    j = await db.jobs.find_one({"id": job_id})
    if not j or j["employer_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    await db.jobs.update_one({"id": job_id}, {"$set": {"status": "closed"}})
    return {"ok": True}

# ============================ Applications ============================
@api_router.post("/jobs/{job_id}/apply")
async def apply(job_id: str, body: ApplicationIn, user: dict = Depends(require_roles("student", "alumni"))):
    j = await db.jobs.find_one({"id": job_id})
    if not j or j["status"] != "approved":
        raise HTTPException(404, "Job not available")
    existing = await db.applications.find_one({"job_id": job_id, "applicant_id": user["id"]})
    if existing:
        raise HTTPException(400, "Already applied")
    a = {"id": new_id(), "job_id": job_id, "applicant_id": user["id"],
         "employer_id": j["employer_id"], "cover_letter": body.cover_letter or "",
         "status": "applied", "created_at": now_iso(), "updated_at": now_iso()}
    await db.applications.insert_one(a)
    await push_notification(j["employer_id"], "application",
                            f"New application for '{j['title']}' from {user['first_name']} {user['last_name']}",
                            {"job_id": job_id, "application_id": a["id"]})
    return a

@api_router.get("/applications/mine")
async def my_applications(user: dict = Depends(get_current_user)):
    apps = await db.applications.find({"applicant_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    jids = list({a["job_id"] for a in apps})
    jobs = {j["id"]: j for j in await db.jobs.find({"id": {"$in": jids}}, {"_id": 0}).to_list(len(jids))}
    for a in apps:
        a["job"] = jobs.get(a["job_id"])
    return apps

@api_router.get("/jobs/{job_id}/applications")
async def job_applications(job_id: str, user: dict = Depends(require_roles("employer", "admin"))):
    j = await db.jobs.find_one({"id": job_id})
    if not j:
        raise HTTPException(404, "Job not found")
    if user["role"] == "employer" and j["employer_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    apps = await db.applications.find({"job_id": job_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    aids = list({a["applicant_id"] for a in apps})
    applicants = {u["id"]: u for u in await db.users.find({"id": {"$in": aids}}, {"_id": 0, "password": 0}).to_list(len(aids))}
    for a in apps:
        u = applicants.get(a["applicant_id"])
        a["applicant"] = public_user(u) | {"skills": (u.get("skills") or [])[:8], "headline": u.get("headline", "")}
    return apps

@api_router.put("/applications/{app_id}/status")
async def update_app_status(app_id: str, status: str = Query(...), user: dict = Depends(require_roles("employer", "admin"))):
    if status not in {"applied", "under_review", "shortlisted", "interview", "accepted", "rejected"}:
        raise HTTPException(400, "Invalid status")
    a = await db.applications.find_one({"id": app_id})
    if not a:
        raise HTTPException(404, "Application not found")
    if user["role"] == "employer" and a["employer_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    await db.applications.update_one({"id": app_id}, {"$set": {"status": status, "updated_at": now_iso()}})
    await push_notification(a["applicant_id"], "application_update",
                            f"Your application status changed to '{status.replace('_', ' ').title()}'",
                            {"application_id": app_id, "status": status})
    return {"ok": True}

# ============================ AI (GPT-5.6-terra via Emergent) ============================
def build_llm(session_id: str, system_message: str):
    from emergentintegrations.llm.chat import LlmChat
    return LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=system_message).with_model("openai", "gpt-5.6-terra")

def profile_summary_for_ai(u: dict) -> str:
    parts = [f"Role: {u['role']}", f"Name: {u.get('first_name')} {u.get('last_name')}",
             f"Headline: {u.get('headline','(none)')}", f"Bio: {u.get('bio','(none)')}"]
    if u["role"] in {"student", "alumni"}:
        parts += [f"Institution: {u.get('institution','')}", f"Qualification: {u.get('qualification','')}",
                  f"Skills: {', '.join(u.get('skills') or []) or '(none)'}",
                  f"Certifications: {len(u.get('certifications') or [])}",
                  f"Projects: {len(u.get('projects') or [])}",
                  f"Work experience: {len(u.get('work_experience') or [])} entries"]
    if u["role"] == "student":
        parts += [f"Career interests: {', '.join(u.get('career_interests') or []) or '(none)'}"]
    return "\n".join(parts)

@api_router.post("/ai/chat")
async def ai_chat(body: AIChatIn, user: dict = Depends(get_current_user)):
    from emergentintegrations.llm.chat import UserMessage, TextDelta, StreamDone
    sid = body.session_id or f"chat-{user['id']}"
    profile = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    system = ("You are Richfield Connect's professional career and employability assistant. "
              "You help students, alumni, and employers with profile improvements, skill development, "
              "career pathways, and job search advice. Be concise, encouraging, professional. "
              "Never invent qualifications, jobs, or achievements not present in the user's profile. "
              "Use the profile context below to personalize advice.\n\n"
              f"USER PROFILE:\n{profile_summary_for_ai(profile)}")
    chat = build_llm(sid, system)
    await db.ai_messages.insert_one({"id": new_id(), "session_id": sid, "user_id": user["id"],
                                     "role": "user", "content": body.message, "at": now_iso()})
    async def gen():
        full = []
        try:
            async for ev in chat.stream_message(UserMessage(text=body.message)):
                if isinstance(ev, TextDelta):
                    full.append(ev.content)
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("AI chat error")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return
        text = "".join(full)
        await db.ai_messages.insert_one({"id": new_id(), "session_id": sid, "user_id": user["id"],
                                         "role": "assistant", "content": text, "at": now_iso()})
        yield f"data: {json.dumps({'done': True})}\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

@api_router.post("/ai/profile-review")
async def ai_profile_review(user: dict = Depends(get_current_user)):
    from emergentintegrations.llm.chat import UserMessage
    profile = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    comp = profile_completion(profile)
    system = ("You are a professional career coach. Return a JSON object with keys: "
              "'strengths' (array of strings), 'gaps' (array of strings), "
              "'skill_suggestions' (array), 'certification_suggestions' (array), "
              "'action_plan' (array of strings). No extra prose, JSON only.")
    prompt = (f"Analyse this profile (completion {comp['percentage']}%). Missing: {', '.join(comp['missing']) or 'nothing critical'}.\n\n"
              f"{profile_summary_for_ai(profile)}\n\nReturn STRICT JSON, no markdown fences.")
    chat = build_llm(f"review-{user['id']}-{new_id()}", system)
    resp = await chat.send_message(UserMessage(text=prompt))
    text = resp.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    try:
        parsed = json.loads(text)
    except Exception:
        parsed = {"strengths": [], "gaps": [text[:400]], "skill_suggestions": [],
                  "certification_suggestions": [], "action_plan": []}
    parsed["completion"] = comp
    return parsed

@api_router.post("/ai/employability-score")
async def ai_employability(user: dict = Depends(get_current_user)):
    profile = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    comp = profile_completion(profile)
    # deterministic base score
    skills = len(profile.get("skills") or [])
    projects = len(profile.get("projects") or [])
    certs = len(profile.get("certifications") or [])
    exp = len(profile.get("work_experience") or [])
    score = min(100, int(0.4 * comp["percentage"] + 6 * min(skills, 10) + 5 * min(projects, 5) + 5 * min(certs, 5) + 4 * min(exp, 5)))
    return {
        "score": score,
        "breakdown": {
            "profile_completion": comp["percentage"],
            "skills_count": skills, "projects_count": projects,
            "certifications_count": certs, "experience_count": exp,
        },
        "suggestions": comp["missing"][:6],
    }

@api_router.post("/ai/cv-extract")
async def ai_cv_extract(user: dict = Depends(get_current_user)):
    from emergentintegrations.llm.chat import UserMessage
    profile = await db.users.find_one({"id": user["id"]})
    if not profile.get("cv_path"):
        raise HTTPException(400, "Upload a CV first")
    try:
        raw, ct = get_object(profile["cv_path"])
    except Exception as e:
        raise HTTPException(500, f"Could not read CV: {e}")
    text = ""
    if ct.startswith("text/"):
        text = raw.decode("utf-8", errors="ignore")
    else:
        try:
            text = raw.decode("utf-8", errors="ignore")
        except Exception:
            text = ""
    # Ask LLM to extract; if binary and unreadable, pass placeholder note
    prompt_text = text[:8000] if text.strip() else "[Binary CV content – produce a plausible skeleton from filename if possible, otherwise return empty arrays.]"
    system = ("Extract structured CV information. Return STRICT JSON only, no markdown fences. Keys: "
              "'name' (string), 'skills' (array of strings), 'education' (array of {institution, qualification, year}), "
              "'work_experience' (array of {company, role, from, to, description}), "
              "'certifications' (array of {name, issuer, year}), 'projects' (array of {name, description}).")
    chat = build_llm(f"cv-{user['id']}-{new_id()}", system)
    resp = await chat.send_message(UserMessage(text=prompt_text))
    txt = resp.strip()
    if txt.startswith("```"):
        txt = txt.strip("`")
        if txt.lower().startswith("json"):
            txt = txt[4:]
    try:
        parsed = json.loads(txt)
    except Exception:
        parsed = {"name": "", "skills": [], "education": [], "work_experience": [],
                  "certifications": [], "projects": []}
    return parsed

class ConfirmCVIn(BaseModel):
    skills: Optional[List[str]] = None
    education: Optional[List[Dict[str, Any]]] = None
    work_experience: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None

@api_router.post("/ai/cv-apply")
async def ai_cv_apply(body: ConfirmCVIn, user: dict = Depends(get_current_user)):
    upd: Dict[str, Any] = {}
    if body.skills:
        current = set(user.get("skills") or [])
        current.update([s for s in body.skills if s])
        upd["skills"] = list(current)
    for f in ("education", "work_experience", "certifications", "projects"):
        val = getattr(body, f)
        if val:
            existing = user.get(f) or []
            upd[f] = existing + val
    if upd:
        await db.users.update_one({"id": user["id"]}, {"$set": upd})
    return {"ok": True, "updated": list(upd.keys())}

def job_match_score(user: dict, job: dict) -> dict:
    user_skills = {s.lower() for s in (user.get("skills") or [])}
    job_skills = {s.lower() for s in (job.get("skills") or [])}
    matched = user_skills & job_skills
    missing = job_skills - user_skills
    skill_score = int(100 * len(matched) / max(1, len(job_skills))) if job_skills else 60
    qual_score = 80 if (user.get("qualification") and user["qualification"].lower() in (job.get("qualifications") or "").lower()) else 55
    exp_score = min(100, 40 + 15 * len(user.get("work_experience") or []))
    total = int(0.6 * skill_score + 0.25 * qual_score + 0.15 * exp_score)
    reasons = []
    for s in list(matched)[:5]:
        reasons.append(f"Skill matched: {s}")
    if user.get("qualification"):
        reasons.append(f"Qualification: {user['qualification']}")
    return {"score": total, "matched_skills": list(matched), "missing_skills": list(missing), "reasons": reasons}

@api_router.get("/ai/job-matches")
async def job_matches(limit: int = 12, user: dict = Depends(require_roles("student", "alumni"))):
    jobs = await db.jobs.find({"status": "approved"}, {"_id": 0}).sort("created_at", -1).limit(80).to_list(80)
    scored = []
    for j in jobs:
        m = job_match_score(user, j)
        j["match"] = m
        scored.append(j)
    scored.sort(key=lambda x: x["match"]["score"], reverse=True)
    top = scored[:limit]
    eids = list({j["employer_id"] for j in top})
    emps = {u["id"]: {"company_name": u.get("company_name"), "company_logo_url": u.get("company_logo_url")}
            for u in await db.users.find({"id": {"$in": eids}}).to_list(len(eids))}
    for j in top:
        j["employer"] = emps.get(j["employer_id"])
    return top

@api_router.get("/career-paths")
async def career_paths(user: dict = Depends(get_current_user)):
    return CAREER_PATHS

# ============================ Messages / Conversations ============================
async def get_or_create_conv(a: str, b: str) -> str:
    key = "-".join(sorted([a, b]))
    conv = await db.conversations.find_one({"key": key})
    if conv:
        return conv["id"]
    cid = new_id()
    await db.conversations.insert_one({"id": cid, "key": key, "participants": [a, b],
                                        "last_message": "", "updated_at": now_iso()})
    return cid

@api_router.post("/messages")
async def send_message(body: MessageIn, user: dict = Depends(get_current_user)):
    if body.recipient_id == user["id"]:
        raise HTTPException(400, "Cannot message yourself")
    recipient = await db.users.find_one({"id": body.recipient_id})
    if not recipient:
        raise HTTPException(404, "Recipient not found")
    cid = await get_or_create_conv(user["id"], body.recipient_id)
    m = {"id": new_id(), "conversation_id": cid, "sender_id": user["id"],
         "recipient_id": body.recipient_id, "content": body.content,
         "read": False, "created_at": now_iso()}
    await db.messages.insert_one(m)
    await db.conversations.update_one({"id": cid}, {"$set": {"last_message": body.content[:120], "updated_at": now_iso()}})
    await push_notification(body.recipient_id, "message",
                            f"New message from {user['first_name']} {user['last_name']}",
                            {"conversation_id": cid, "from_user_id": user["id"]})
    return m

@api_router.get("/conversations")
async def list_conversations(user: dict = Depends(get_current_user)):
    convs = await db.conversations.find({"participants": user["id"]}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    other_ids = [p for c in convs for p in c["participants"] if p != user["id"]]
    others = {u["id"]: public_user(u) for u in await db.users.find({"id": {"$in": other_ids}}).to_list(len(other_ids))}
    for c in convs:
        oid = next((p for p in c["participants"] if p != user["id"]), None)
        c["other"] = others.get(oid)
        c["unread"] = await db.messages.count_documents({"conversation_id": c["id"], "recipient_id": user["id"], "read": False})
    return convs

@api_router.get("/conversations/{cid}/messages")
async def conv_messages(cid: str, user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one({"id": cid})
    if not conv or user["id"] not in conv["participants"]:
        raise HTTPException(403, "Forbidden")
    await db.messages.update_many({"conversation_id": cid, "recipient_id": user["id"], "read": False},
                                   {"$set": {"read": True}})
    msgs = await db.messages.find({"conversation_id": cid}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return msgs

# ============================ Notifications (WebSocket + REST) ============================
class WSManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}
    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(user_id, []).append(ws)
    def disconnect(self, user_id: str, ws: WebSocket):
        if user_id in self.active:
            self.active[user_id] = [w for w in self.active[user_id] if w is not ws]
    async def send(self, user_id: str, payload: dict):
        for ws in list(self.active.get(user_id, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                self.disconnect(user_id, ws)

ws_mgr = WSManager()

async def push_notification(user_id: str, ntype: str, message: str, data: dict):
    n = {"id": new_id(), "user_id": user_id, "type": ntype, "message": message,
         "data": data, "read": False, "created_at": now_iso()}
    await db.notifications.insert_one(n)
    await ws_mgr.send(user_id, {"kind": "notification", "notification": {k: v for k, v in n.items() if k != "_id"}})

@app.websocket("/api/ws/{token}")
async def ws_endpoint(websocket: WebSocket, token: str):
    try:
        payload = decode_token(token)
        user_id = payload["sub"]
    except Exception:
        await websocket.close(code=4401); return
    await ws_mgr.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_mgr.disconnect(user_id, websocket)

@api_router.get("/notifications")
async def list_notifs(user: dict = Depends(get_current_user)):
    ns = await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    return ns

@api_router.post("/notifications/read-all")
async def read_all(user: dict = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"], "read": False}, {"$set": {"read": True}})
    return {"ok": True}

# ============================ Reports ============================
@api_router.post("/reports")
async def create_report(body: ReportIn, user: dict = Depends(get_current_user)):
    doc = {"id": new_id(), "reporter_id": user["id"], "target_type": body.target_type,
           "target_id": body.target_id, "category": body.category, "reason": body.reason or "",
           "status": "open", "created_at": now_iso()}
    await db.reports.insert_one(doc)
    if body.target_type == "post":
        await db.posts.update_one({"id": body.target_id}, {"$inc": {"reports_count": 1}})
    return {"ok": True}

# ============================ Admin ============================
@api_router.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_roles("admin"))):
    counts = {}
    for role in ("student", "alumni", "employer"):
        counts[role] = await db.users.count_documents({"role": role})
    counts["users_total"] = sum(counts.values())
    counts["pending_alumni"] = await db.users.count_documents({"role": "alumni", "status": "pending_verification"})
    counts["pending_employers"] = await db.users.count_documents({"role": "employer", "status": "pending_approval"})
    counts["pending_jobs"] = await db.jobs.count_documents({"status": "pending"})
    counts["applications_total"] = await db.applications.count_documents({})
    counts["reports_open"] = await db.reports.count_documents({"status": "open"})
    counts["posts_total"] = await db.posts.count_documents({"is_deleted": False})
    return counts

@api_router.get("/admin/users")
async def admin_users(role: Optional[str] = None, status: Optional[str] = None,
                      q: str = "", user: dict = Depends(require_roles("admin"))):
    query: Dict[str, Any] = {}
    if role: query["role"] = role
    if status: query["status"] = status
    if q:
        query["$or"] = [{"email": {"$regex": q, "$options": "i"}},
                        {"first_name": {"$regex": q, "$options": "i"}},
                        {"last_name": {"$regex": q, "$options": "i"}}]
    us = await db.users.find(query, {"_id": 0, "password": 0}).sort("created_at", -1).limit(200).to_list(200)
    return us

@api_router.post("/admin/users/{uid}/approve")
async def approve_user(uid: str, user: dict = Depends(require_roles("admin"))):
    u = await db.users.find_one({"id": uid})
    if not u:
        raise HTTPException(404, "Not found")
    await db.users.update_one({"id": uid}, {"$set": {"status": "active", "verified": True}})
    await push_notification(uid, "approval", f"Your {u['role']} account was approved", {})
    await audit(user["id"], f"approve_{u['role']}", uid)
    return {"ok": True}

@api_router.post("/admin/users/{uid}/reject")
async def reject_user(uid: str, user: dict = Depends(require_roles("admin"))):
    await db.users.update_one({"id": uid}, {"$set": {"status": "rejected"}})
    await push_notification(uid, "rejection", "Your account request was rejected", {})
    await audit(user["id"], "reject_user", uid)
    return {"ok": True}

@api_router.post("/admin/users/{uid}/suspend")
async def suspend_user(uid: str, user: dict = Depends(require_roles("admin"))):
    await db.users.update_one({"id": uid}, {"$set": {"status": "suspended"}})
    await audit(user["id"], "suspend_user", uid)
    return {"ok": True}

@api_router.post("/admin/jobs/{jid}/approve")
async def approve_job(jid: str, user: dict = Depends(require_roles("admin"))):
    j = await db.jobs.find_one({"id": jid})
    if not j:
        raise HTTPException(404, "Not found")
    await db.jobs.update_one({"id": jid}, {"$set": {"status": "approved"}})
    await push_notification(j["employer_id"], "job_approved", f"Your job '{j['title']}' was approved", {"job_id": jid})
    await audit(user["id"], "approve_job", jid)
    return {"ok": True}

@api_router.post("/admin/jobs/{jid}/reject")
async def reject_job(jid: str, user: dict = Depends(require_roles("admin"))):
    j = await db.jobs.find_one({"id": jid})
    await db.jobs.update_one({"id": jid}, {"$set": {"status": "rejected"}})
    if j:
        await push_notification(j["employer_id"], "job_rejected", f"Your job '{j['title']}' was not approved", {"job_id": jid})
    await audit(user["id"], "reject_job", jid)
    return {"ok": True}

@api_router.get("/admin/reports")
async def admin_reports(user: dict = Depends(require_roles("admin"))):
    return await db.reports.find({}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)

@api_router.post("/admin/reports/{rid}/resolve")
async def resolve_report(rid: str, user: dict = Depends(require_roles("admin"))):
    await db.reports.update_one({"id": rid}, {"$set": {"status": "resolved", "resolved_at": now_iso()}})
    return {"ok": True}

@api_router.post("/admin/announcements")
async def create_announcement(body: AnnouncementIn, user: dict = Depends(require_roles("admin"))):
    doc = {"id": new_id(), "author_id": user["id"], "title": body.title, "body": body.body, "created_at": now_iso()}
    await db.announcements.insert_one(doc)
    # broadcast to all users
    users = await db.users.find({"status": {"$ne": "suspended"}}, {"id": 1}).to_list(10000)
    for u in users:
        await push_notification(u["id"], "announcement", body.title, {"announcement_id": doc["id"]})
    return doc

@api_router.get("/announcements")
async def list_announcements(user: dict = Depends(get_current_user)):
    return await db.announcements.find({}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)

@api_router.get("/admin/audit-logs")
async def admin_audit(user: dict = Depends(require_roles("admin"))):
    return await db.audit_logs.find({}, {"_id": 0}).sort("at", -1).limit(200).to_list(200)

@api_router.get("/admin/timeseries/users")
async def user_timeseries(user: dict = Depends(require_roles("admin"))):
    us = await db.users.find({}, {"created_at": 1, "role": 1, "_id": 0}).to_list(10000)
    from collections import defaultdict
    buckets = defaultdict(lambda: {"date": "", "students": 0, "alumni": 0, "employers": 0})
    for u in us:
        d = (u.get("created_at") or "")[:10]
        buckets[d]["date"] = d
        role = u.get("role")
        if role == "student": buckets[d]["students"] += 1
        elif role == "alumni": buckets[d]["alumni"] += 1
        elif role == "employer": buckets[d]["employers"] += 1
    return sorted(buckets.values(), key=lambda x: x["date"])

# ============================ Dashboard analytics ============================
@api_router.get("/dashboard/student")
async def dashboard_student(user: dict = Depends(require_roles("student", "alumni"))):
    profile = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    comp = profile_completion(profile)
    views = await db.profile_views.count_documents({"profile_id": user["id"]})
    apps = await db.applications.find({"applicant_id": user["id"]}, {"_id": 0}).to_list(500)
    by_status: Dict[str, int] = {}
    for a in apps:
        by_status[a["status"]] = by_status.get(a["status"], 0) + 1
    conns = await db.connections.count_documents({"$or": [{"a": user["id"]}, {"b": user["id"]}], "status": "accepted"})
    # 7-day views timeseries
    from collections import defaultdict
    vseries = defaultdict(int)
    async for v in db.profile_views.find({"profile_id": user["id"]}, {"at": 1, "_id": 0}):
        d = (v.get("at") or "")[:10]
        vseries[d] += 1
    return {
        "completion": comp, "profile_views": views, "connections": conns,
        "applications_by_status": by_status,
        "views_series": sorted([{"date": k, "views": v} for k, v in vseries.items()], key=lambda x: x["date"])[-14:],
    }

@api_router.get("/dashboard/employer")
async def dashboard_employer(user: dict = Depends(require_roles("employer"))):
    jobs = await db.jobs.find({"employer_id": user["id"]}, {"_id": 0}).to_list(200)
    active = [j for j in jobs if j["status"] == "approved"]
    pending = [j for j in jobs if j["status"] == "pending"]
    apps = await db.applications.find({"employer_id": user["id"]}, {"_id": 0}).to_list(1000)
    by_status: Dict[str, int] = {}
    for a in apps:
        by_status[a["status"]] = by_status.get(a["status"], 0) + 1
    apps_per_job = []
    for j in jobs[:8]:
        apps_per_job.append({"job": j["title"], "count": sum(1 for a in apps if a["job_id"] == j["id"])})
    return {
        "active_jobs": len(active), "pending_jobs": len(pending),
        "total_applications": len(apps), "applications_by_status": by_status,
        "applications_per_job": apps_per_job,
        "recent_jobs": jobs[:10],
    }

# ============================ Career paths static seed ============================
CAREER_PATHS = [
    {"id": "swe", "title": "Software Engineering",
     "description": "From foundational programming to leading engineering teams building modern software products.",
     "steps": [
        {"level": "Qualification", "title": "Diploma / Degree in IT or Computer Science", "skills": ["Programming", "Algorithms", "Databases"]},
        {"level": "Internship", "title": "Software Engineering Intern", "skills": ["Git", "Testing", "Problem solving"]},
        {"level": "Junior Role", "title": "Junior Software Developer", "skills": ["Python/JS", "REST APIs", "SQL"]},
        {"level": "Mid-Level Role", "title": "Software Engineer", "skills": ["System design", "CI/CD", "Cloud"]},
        {"level": "Senior Role", "title": "Senior Software Engineer", "skills": ["Architecture", "Mentoring", "Performance"]},
        {"level": "Leadership", "title": "Engineering Lead / Manager", "skills": ["Team leadership", "Roadmapping", "Delivery"]},
     ]},
    {"id": "data", "title": "Data & Analytics",
     "description": "Turn raw data into decisions — from analytics through ML.",
     "steps": [
        {"level": "Qualification", "title": "Diploma / Degree in Data Science or Statistics", "skills": ["SQL", "Statistics", "Python"]},
        {"level": "Internship", "title": "Data Intern", "skills": ["Excel", "SQL", "Reporting"]},
        {"level": "Junior Role", "title": "Data Analyst", "skills": ["Dashboards", "Pandas", "Storytelling"]},
        {"level": "Mid-Level Role", "title": "Data Scientist", "skills": ["ML", "Feature eng", "Experiments"]},
        {"level": "Senior Role", "title": "Senior Data Scientist", "skills": ["MLOps", "Modelling", "Impact"]},
        {"level": "Leadership", "title": "Head of Analytics", "skills": ["Strategy", "Team", "Governance"]},
     ]},
    {"id": "cyber", "title": "Cybersecurity",
     "description": "Defend the digital economy — from analyst to security leadership.",
     "steps": [
        {"level": "Qualification", "title": "Diploma / Degree in Networks or Cyber", "skills": ["Networking", "Linux", "Security fundamentals"]},
        {"level": "Internship", "title": "SOC / Security Intern", "skills": ["Logs", "Incident triage", "Tooling"]},
        {"level": "Junior Role", "title": "Security Analyst", "skills": ["SIEM", "Threat hunting", "IR"]},
        {"level": "Mid-Level Role", "title": "Security Engineer", "skills": ["Cloud sec", "IAM", "Detection"]},
        {"level": "Senior Role", "title": "Senior Security Engineer", "skills": ["Threat modelling", "Zero-trust", "Architecture"]},
        {"level": "Leadership", "title": "CISO / Security Manager", "skills": ["Risk", "Compliance", "Program"]},
     ]},
    {"id": "biz", "title": "Business & Project Management",
     "description": "Deliver value through people, process, and product.",
     "steps": [
        {"level": "Qualification", "title": "Diploma / Degree in Business", "skills": ["Communication", "Excel", "Project basics"]},
        {"level": "Internship", "title": "Business / Project Intern", "skills": ["Documentation", "Stakeholders", "Reporting"]},
        {"level": "Junior Role", "title": "Junior Project Coordinator", "skills": ["Scheduling", "Risk", "Meetings"]},
        {"level": "Mid-Level Role", "title": "Project Manager", "skills": ["PMBOK/Agile", "Delivery", "Budget"]},
        {"level": "Senior Role", "title": "Senior PM / Programme Manager", "skills": ["Portfolios", "Change", "Vendors"]},
        {"level": "Leadership", "title": "Head of Delivery", "skills": ["Strategy", "PMO", "Executive comms"]},
     ]},
]

# ============================ Startup ============================
@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.warning(f"Storage init failed (non-fatal): {e}")
    # seed admin
    admin_email = ADMIN_EMAIL.lower().strip()
    admin = await db.users.find_one({"email": admin_email})
    if not admin:
        await db.users.insert_one({
            "id": new_id(), "email": admin_email, "password": hash_pw(ADMIN_PASSWORD),
            "role": "admin", "first_name": "Chelsea", "last_name": "Mudadisi",
            "status": "active", "verified": True, "avatar_url": None,
            "headline": "Platform Administrator", "bio": "", "skills": [],
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    # seed demo users
    demos = [
        {"email": "sipho.student@richfield.ac.za", "password": "Student@2026", "role": "student",
         "first_name": "Sipho", "last_name": "Ndlovu", "status": "active", "verified": True,
         "institution": "Richfield", "qualification": "Diploma in IT",
         "headline": "Aspiring software developer • Richfield IT student",
         "bio": "Passionate about building web apps and learning modern stacks.",
         "skills": ["Python", "JavaScript", "SQL", "HTML", "CSS"], "career_interests": ["Software Engineering", "Cybersecurity"],
         "year_of_study": "Year 2", "github": "", "linkedin": "", "portfolio": "", "cv_path": None,
         "certifications": [], "projects": [{"name": "Portfolio Site", "description": "Personal portfolio using React"}],
         "work_experience": [], "education": []},
        {"email": "thandi.alumni@richfield.ac.za", "password": "Alumni@2026", "role": "alumni",
         "first_name": "Thandi", "last_name": "Khumalo", "status": "active", "verified": True,
         "graduation_year": 2022, "qualification": "BSc IT", "institution": "Richfield",
         "current_position": "Software Engineer", "company": "Acme Systems", "industry": "Technology",
         "headline": "Software Engineer at Acme • Richfield Class of 2022",
         "bio": "Full-stack engineer helping Richfield students break into tech.",
         "skills": ["Python", "React", "AWS", "Node.js", "PostgreSQL"],
         "linkedin": "", "github": "", "cv_path": None,
         "certifications": [{"name": "AWS Certified Developer", "issuer": "AWS", "year": 2023}],
         "projects": [], "work_experience": [{"company": "Acme Systems", "role": "Software Engineer", "from": "2022", "to": "Present", "description": "Building SaaS features."}],
         "education": []},
        {"email": "recruiter@techcorp.co.za", "password": "Employer@2026", "role": "employer",
         "first_name": "Nomsa", "last_name": "van der Merwe", "status": "active", "verified": True,
         "company_name": "TechCorp SA", "company_website": "https://techcorp.example",
         "company_industry": "Technology", "company_description": "Leading South African tech consultancy.",
         "location": "Johannesburg", "contact_email": "recruiter@techcorp.co.za",
         "company_logo_url": None, "headline": "Talent Lead at TechCorp SA", "bio": "", "skills": []},
    ]
    for d in demos:
        if not await db.users.find_one({"email": d["email"]}):
            pw = d.pop("password")
            d["id"] = new_id(); d["password"] = hash_pw(pw); d["created_at"] = now_iso()
            d.setdefault("avatar_url", None)
            await db.users.insert_one(d)
            logger.info(f"Seeded {d['role']}: {d['email']}")
    # seed a job
    employer = await db.users.find_one({"email": "recruiter@techcorp.co.za"})
    if employer and await db.jobs.count_documents({"employer_id": employer["id"]}) == 0:
        await db.jobs.insert_one({
            "id": new_id(), "employer_id": employer["id"],
            "title": "Junior Full-Stack Developer", "description": "Join our engineering team building modern web apps for enterprise clients.",
            "requirements": "1+ year experience or strong portfolio. Team player, growth mindset.",
            "qualifications": "Diploma or degree in IT/CS", "skills": ["Python", "React", "SQL", "Git"],
            "location": "Johannesburg", "work_mode": "hybrid", "employment_type": "full-time",
            "salary_range": "R25k - R35k", "application_deadline": None,
            "industry": "Technology", "experience_level": "Junior",
            "status": "approved", "created_at": now_iso(), "views": 0,
        })
        await db.jobs.insert_one({
            "id": new_id(), "employer_id": employer["id"],
            "title": "Software Engineering Intern", "description": "6-month internship for final-year students.",
            "requirements": "Currently studying IT/CS. Familiar with programming fundamentals.",
            "qualifications": "In final year of IT diploma/degree", "skills": ["Python", "Git", "HTML", "CSS"],
            "location": "Cape Town", "work_mode": "onsite", "employment_type": "internship",
            "salary_range": "R8k stipend", "industry": "Technology", "experience_level": "Entry",
            "status": "approved", "created_at": now_iso(), "views": 0,
        })

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True,
                   allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])

@app.on_event("shutdown")
async def shutdown():
    client.close()
