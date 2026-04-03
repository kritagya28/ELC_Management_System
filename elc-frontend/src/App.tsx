import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  FormEvent,
  FC,
} from "react";

// --- TYPE DEFINITIONS ---
type Role = "Student" | "Teacher" | "DOAA" | "Technician" | "HOD";
type Status =
  | "Pending HOD"
  | "Pending DOAA"
  | "Pending Approval"
  | "Approved"
  | "Rejected";

interface User {
  email: string;
  name: string;
  role: Role;
}

interface Activity {
  id: number;
  title: string;
  teacher: string;
  teacherEmail: string;
  venue: string;
  time: string;
  description: string;
  materialRequest?: string;
  softwareRequirements?: string;
  status: Status;
  attendance: string[];
  materialsArranged: boolean;
}

interface Notification {
  id: number;
  recipientEmail: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface Venue {
  id: number;
  name: string;
}
interface ActivityTemplate {
  id: number;
  title: string;
  description_template: string;
}
interface Toast
  extends Omit<Notification, "recipientEmail" | "read" | "timestamp"> {
  timestamp?: any;
}

// --- STYLES ---
const styles: any = {
  app: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "sans-serif",
    color: "#333",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    padding: "1rem 2rem",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  title: { color: "#2563eb", fontSize: "1.5rem", fontWeight: 700, margin: 0 },
  userInfo: { display: "flex", alignItems: "center", gap: "1rem" },
  logoutButton: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#dc2626",
    color: "#fff",
    fontWeight: 500,
  },
  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  dashboardTitle: { fontSize: "1.5rem", fontWeight: 600 },
  button: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  deleteButton: {
    padding: "0.5rem",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.8rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: { fontSize: "1.25rem", fontWeight: 700, margin: 0, flex: 1 },
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    marginLeft: "0.5rem",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flex: "1 1 auto",
    color: "#4b5563",
  },
  cardDetail: { fontSize: "0.95rem", margin: 0 },
  strong: { fontWeight: 600, color: "#374151" },
  cardFooter: {
    marginTop: "auto",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  approveButton: { backgroundColor: "#16a34a" },
  rejectButton: { backgroundColor: "#dc2626" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  formGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: { fontWeight: 600, fontSize: "0.9rem" },
  input: {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  modalActions: {
    marginTop: "1rem",
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
  },
  cancelButton: { backgroundColor: "#9ca3af" },
  loginContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
  },
  loginBox: {
    width: "100%",
    maxWidth: "400px",
    padding: "2.5rem",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  },
  loginTitle: {
    textAlign: "center",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#2563eb",
    marginBottom: "2rem",
  },
  errorMessage: {
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    padding: "0.75rem",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "1rem",
  },
  toastContainer: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  toast: {
    backgroundColor: "#fff",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    borderLeft: "4px solid #2563eb",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontWeight: 500,
  },
  notificationPanel: {
    position: "absolute",
    top: "100%",
    right: 0,
    width: "350px",
    maxHeight: "400px",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1100,
    border: "1px solid #e5e7eb",
    marginTop: "10px",
  },
  notificationItem: { padding: "1rem", borderBottom: "1px solid #e5e7eb" },
  notificationMessage: { fontSize: "0.9rem" },
  notificationTimestamp: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "0.25rem",
  },
};

// --- HELPER FUNCTIONS ---
const getStatusStyle = (status: Status) => {
  switch (status) {
    case "Approved":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    case "Pending DOAA":
      return { backgroundColor: "#e0f2fe", color: "#0369a1" };
    case "Pending HOD":
      return { backgroundColor: "#fef9c3", color: "#854d0e" };
    case "Rejected":
      return { backgroundColor: "#fee2e2", color: "#991b1b" };
    default:
      return {};
  }
};

const formatDateTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return "Invalid Date";
  }
};

// --- UPDATED MOCK MAP ---
const MOCK_USERS_MAP: User[] = [
  { email: "alex.j@thapar.edu", name: "Alex Johnson", role: "Student" },
  { email: "ellie.s@thapar.edu", name: "Dr. Ellie Sattler", role: "Teacher" },
  { email: "john.h@thapar.edu", name: "Dr. John Hammond", role: "DOAA" },
  { email: "ray.a@thapar.edu", name: "Ray Arnold", role: "Technician" },
  { email: "hod@thapar.edu", name: "Dr. Henry Wu (HOD)", role: "HOD" },
];

// --- COMPONENTS ---
const ActivityCard: React.FC<any> = ({
  activity,
  currentUser,
  onStatusChange,
  onMarkAttendance,
  onScan,
  isScanned,
  onViewAttendance,
  onMarkMaterialsArranged,
  onDelete,
}) => {
  const isStudentPresent = activity.attendance.includes(currentUser.email);
  const role = currentUser.role;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{activity.title}</h3>
        {/* Teacher Delete Button */}
        {role === "Teacher" && (
          <button
            onClick={() => onDelete(activity.id)}
            style={styles.deleteButton}
            title="Delete Activity"
          >
            🗑️
          </button>
        )}
        {role !== "Student" && role !== "Teacher" && (
          <span
            style={{
              ...styles.statusBadge,
              ...getStatusStyle(activity.status),
            }}
          >
            {activity.status}
          </span>
        )}
        {role === "Teacher" && (
          <span
            style={{
              ...styles.statusBadge,
              ...getStatusStyle(activity.status),
            }}
          >
            {activity.status}
          </span>
        )}
      </div>
      <div style={styles.cardBody}>
        {role !== "Teacher" && (
          <p style={styles.cardDetail}>
            <strong style={styles.strong}>Teacher:</strong> {activity.teacher}
          </p>
        )}
        <p style={styles.cardDetail}>
          <strong style={styles.strong}>Venue:</strong> {activity.venue}
        </p>
        <p style={styles.cardDetail}>
          <strong style={styles.strong}>Time:</strong>{" "}
          {formatDateTime(activity.time)}
        </p>
        <p style={styles.cardDetail}>
          <strong style={styles.strong}>Description:</strong>{" "}
          {activity.description}
        </p>
        {activity.softwareRequirements && (
          <p style={styles.cardDetail}>
            <strong style={styles.strong}>Prerequisites:</strong>{" "}
            {activity.softwareRequirements}
          </p>
        )}
        {(role === "DOAA" || role === "Technician" || role === "HOD") &&
          activity.materialRequest && (
            <p style={styles.cardDetail}>
              <strong style={styles.strong}>Material Request:</strong>{" "}
              {activity.materialRequest}
            </p>
          )}
        {role === "Teacher" && activity.materialRequest && (
          <p style={styles.cardDetail}>
            <strong style={styles.strong}>Materials Status:</strong>{" "}
            {activity.materialsArranged
              ? "✅ Confirmed"
              : "⏳ Pending Technician"}
          </p>
        )}
      </div>
      <div style={styles.cardFooter}>
        {role === "HOD" && activity.status === "Pending HOD" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <button
              onClick={() => onStatusChange(activity.id, "Rejected")}
              style={{ ...styles.button, ...styles.rejectButton }}
            >
              Reject
            </button>
            <button
              onClick={() => onStatusChange(activity.id, "Pending DOAA")}
              style={{ ...styles.button, ...styles.approveButton }}
            >
              Approve & Send to DOAA
            </button>
          </div>
        )}

        {role === "DOAA" && activity.status === "Pending DOAA" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <button
              onClick={() => onStatusChange(activity.id, "Rejected")}
              style={{ ...styles.button, ...styles.rejectButton }}
            >
              Reject
            </button>
            <button
              onClick={() => onStatusChange(activity.id, "Approved")}
              style={{ ...styles.button, ...styles.approveButton }}
            >
              Final Approve
            </button>
          </div>
        )}

        {role === "Student" &&
          activity.status === "Approved" &&
          (isStudentPresent ? (
            <div
              style={{
                ...styles.button,
                ...styles.approveButton,
                cursor: "default",
                justifyContent: "center",
              }}
            >
              ✅ Marked Present
            </div>
          ) : (
            <>
              <button
                onClick={() => onScan(activity.id)}
                style={{
                  ...styles.button,
                  backgroundColor: "#4b5563",
                  justifyContent: "center",
                }}
              >
                Scan QR Code
              </button>
              <button
                onClick={() => onMarkAttendance(activity.id)}
                style={{
                  ...styles.button,
                  ...styles.approveButton,
                  justifyContent: "center",
                  opacity: isScanned ? 1 : 0.5,
                  cursor: isScanned ? "pointer" : "not-allowed",
                }}
                disabled={!isScanned}
              >
                Mark Present
              </button>
            </>
          ))}
        {role === "Teacher" && (
          <button
            onClick={() => onViewAttendance(activity)}
            style={{
              ...styles.button,
              width: "100%",
              justifyContent: "center",
            }}
          >
            View Attendance ({activity.attendance.length})
          </button>
        )}
        {role === "Technician" &&
          (activity.materialsArranged ? (
            <div
              style={{
                ...styles.button,
                ...styles.approveButton,
                cursor: "default",
                justifyContent: "center",
              }}
            >
              ✅ Arranged
            </div>
          ) : (
            <button
              onClick={() => onMarkMaterialsArranged(activity.id)}
              style={{
                ...styles.button,
                ...styles.approveButton,
                width: "100%",
                justifyContent: "center",
              }}
            >
              Mark Arranged
            </button>
          ))}
      </div>
    </div>
  );
};

const LoginPage: FC<{ onLoginSuccess: (user: User) => void }> = ({
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const user: User = await response.json();
        onLoginSuccess(user);
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <h1 style={styles.loginTitle}>ELC Management System</h1>
        {error && <p style={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              ...styles.button,
              width: "100%",
              marginTop: "1rem",
              justifyContent: "center",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const CreateActivityModal = ({ isOpen, onClose, onAddActivity }: any) => {
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [materialRequest, setMaterialRequest] = useState("");
  const [softwareRequirements, setSoftwareRequirements] = useState("");

  const [venues, setVenues] = useState<Venue[]>([]);
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:3000/venues")
        .then((res) => res.json())
        .then((data) => setVenues(data));
      fetch("http://localhost:3000/templates")
        .then((res) => res.json())
        .then((data) => setTemplates(data));
    }
  }, [isOpen]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const temp = templates.find((t) => t.title === e.target.value);
    if (temp) {
      setTitle(temp.title);
      setDescription(temp.description_template);
    }
  };

  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddActivity({
      title,
      venue,
      time,
      description,
      materialRequest,
      softwareRequirements,
    });
    onClose();
  };

  const inputStyle = { ...styles.input, width: "100%" };
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Create New Activity</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Template</label>
            <select
              style={inputStyle}
              onChange={handleTemplateChange}
              defaultValue=""
            >
              <option value="" disabled>
                Select Template
              </option>
              {templates.map((t) => (
                <option key={t.id} value={t.title}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Venue</label>
            <select
              style={inputStyle}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Venue
              </option>
              {venues.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Time</label>
            <input
              type="datetime-local"
              min={minDateTime}
              style={inputStyle}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              rows={3}
              style={inputStyle}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Material Request</label>
            <textarea
              rows={2}
              style={inputStyle}
              value={materialRequest}
              onChange={(e) => setMaterialRequest(e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Software Req.</label>
            <textarea
              rows={2}
              style={inputStyle}
              value={softwareRequirements}
              onChange={(e) => setSoftwareRequirements(e.target.value)}
            />
          </div>
          <div style={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              Cancel
            </button>
            <button type="submit" style={styles.button}>
              Request Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AttendanceModal = ({ isOpen, onClose, activity }: any) => {
  if (!isOpen || !activity) return null;
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Attendance: {activity.title}</h2>
        <ul style={{ paddingLeft: "1.5rem" }}>
          {activity.attendance.length === 0 ? (
            <p>No students marked present.</p>
          ) : (
            activity.attendance.map((email: string, idx: number) => (
              <li key={idx}>
                {MOCK_USERS_MAP.find((u) => u.email === email)?.name || email}
              </li>
            ))
          )}
        </ul>
        <div style={styles.modalActions}>
          <button
            onClick={onClose}
            style={{ ...styles.button, ...styles.cancelButton }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationPanel = ({
  notifications,
  onClose,
}: {
  notifications: Notification[];
  onClose: () => void;
}) => {
  return (
    <div style={styles.notificationPanel}>
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid #eee",
          fontWeight: "bold",
        }}
      >
        Notifications
      </div>
      {notifications.length === 0 ? (
        <p style={{ padding: "1rem" }}>No notifications.</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} style={styles.notificationItem}>
            <p style={styles.notificationMessage}>{n.message}</p>
            <p style={styles.notificationTimestamp}>
              {new Date(n.timestamp).toLocaleString()}
            </p>
          </div>
        ))
      )}
      <div
        style={{
          padding: "0.5rem",
          textAlign: "center",
          cursor: "pointer",
          color: "blue",
        }}
        onClick={onClose}
      >
        Close
      </div>
    </div>
  );
};

const ToastContainer: FC<{
  toasts: Toast[];
  onClose: (id: number) => void;
}> = ({ toasts, onClose }) => (
  <div style={styles.toastContainer}>
    {toasts.map((t) => (
      <div key={t.id} style={styles.toast}>
        <span>{t.message}</span>
      </div>
    ))}
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedActivities, setScannedActivities] = useState<Set<number>>(
    new Set()
  );
  const [viewingAttendanceFor, setViewingAttendanceFor] =
    useState<Activity | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchActivities = async () => {
    try {
      const res = await fetch("http://localhost:3000/activities");
      const data = await res.json();
      const transformed: Activity[] = data.map((apiAct: any) => ({
        id: apiAct.id,
        title: apiAct.title,
        teacher: apiAct.teacher_name,
        teacherEmail: apiAct.teacher_email,
        venue: apiAct.venue,
        time: apiAct.time,
        description: apiAct.description,
        materialRequest: apiAct.material_request,
        softwareRequirements: apiAct.software_requirements,
        status: apiAct.status,
        attendance: apiAct.attendance || [],
        materialsArranged: !!apiAct.materials_arranged,
      }));
      setActivities(transformed);
    } catch (error) {
      showToast("Error connecting to server");
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(
        `http://localhost:3000/notifications?email=${currentUser.email}`
      );
      const data = await res.json();
      setNotifications(data);
    } catch (e) {}
  };

  useEffect(() => {
    if (currentUser) {
      fetchActivities();
      fetchNotifications();
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message: msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const handleAddActivity = async (data: any) => {
    const isoTime = new Date(data.time).toISOString();
    const payload = {
      title: data.title,
      teacher_email: currentUser?.email,
      venue: data.venue,
      time: isoTime,
      description: data.description,
      material_request: data.materialRequest,
      software_requirements: data.softwareRequirements,
    };

    const res = await fetch("http://localhost:3000/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast("Request Sent to HOD");
      fetchActivities();
    }
  };

  const handleStatus = async (id: number, status: string) => {
    await fetch(`http://localhost:3000/activities/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchActivities();
    showToast(`Activity Updated: ${status}`);
  };

  const handleAttendance = async (id: number) => {
    await fetch(`http://localhost:3000/activities/${id}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_email: currentUser?.email }),
    });
    fetchActivities();
    showToast("Marked Present!");
  };

  const handleMaterials = async (id: number) => {
    await fetch(`http://localhost:3000/activities/${id}/materials`, {
      method: "PUT",
    });
    fetchActivities();
    showToast("Materials Confirmed");
  };

  // --- NEW DELETE FUNCTION ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this activity?"))
      return;
    try {
      const res = await fetch(`http://localhost:3000/activities/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Activity Deleted");
        fetchActivities();
      } else {
        showToast("Failed to delete");
      }
    } catch (e) {
      showToast("Server Error");
    }
  };

  const filteredActivities = useMemo(() => {
    if (!currentUser) return [];
    const sorted = [...activities].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    switch (currentUser.role) {
      case "Student":
        return sorted.filter((act) => act.status === "Approved");
      case "Teacher":
        return sorted.filter((act) => act.teacherEmail === currentUser.email);
      case "HOD":
        return sorted.filter((act) => act.status === "Pending HOD");
      case "DOAA":
        return sorted.filter((act) => act.status === "Pending DOAA");
      case "Technician":
        return sorted.filter(
          (act) => act.status === "Approved" && act.materialRequest
        );
      default:
        return [];
    }
  }, [currentUser, activities]);

  const getDashboardTitle = () => {
    if (!currentUser) return "";
    switch (currentUser.role) {
      case "Student":
        return "Upcoming ELC Activities";
      case "Teacher":
        return "My ELC Activities";
      case "HOD":
        return "HOD Approvals";
      case "DOAA":
        return "Final DOAA Approvals";
      case "Technician":
        return "Material Requests";
    }
  };

  if (!currentUser) return <LoginPage onLoginSuccess={setCurrentUser} />;

  return (
    <div style={styles.app}>
      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
      />
      <header style={styles.header}>
        <h1 style={styles.title}>ELC Management System</h1>
        <div style={styles.userInfo}>
          <span>
            Welcome, <strong>{currentUser.name}</strong> ({currentUser.role})
          </span>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                fetchNotifications();
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              🔔{" "}
              {notifications.length > 0 && (
                <span style={{ color: "red" }}>•</span>
              )}
            </button>
            {showNotifs && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifs(false)}
              />
            )}
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        <div style={styles.dashboardHeader}>
          <h2 style={styles.dashboardTitle}>{getDashboardTitle()}</h2>
          {currentUser.role === "Teacher" && (
            <button style={styles.button} onClick={() => setIsModalOpen(true)}>
              + Create Activity
            </button>
          )}
        </div>

        {filteredActivities.length > 0 ? (
          <div style={styles.grid}>
            {filteredActivities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                currentUser={currentUser}
                onStatusChange={handleStatus}
                onMarkAttendance={() => handleAttendance(act.id)}
                onMarkMaterialsArranged={() => handleMaterials(act.id)}
                onScan={() => {
                  showToast("QR Scanned");
                  setScannedActivities((p) => new Set(p).add(act.id));
                }}
                isScanned={scannedActivities.has(act.id)}
                onViewAttendance={setViewingAttendanceFor}
                onDelete={handleDelete} // Pass the delete function!
              />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#666", marginTop: "2rem" }}>
            No activities found for your role.
          </p>
        )}
      </main>

      <CreateActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddActivity={handleAddActivity}
        currentUser={currentUser}
      />
      <AttendanceModal
        isOpen={!!viewingAttendanceFor}
        onClose={() => setViewingAttendanceFor(null)}
        activity={viewingAttendanceFor}
      />
    </div>
  );
};

export default App;
