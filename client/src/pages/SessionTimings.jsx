import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Mirrors session_timings.php (table view) + edit_session.php (inline edit
// per day, rather than a separate page, since it's the same small form).
const SessionTimings = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]); // grouped by day, as returned by API
  const [editingDay, setEditingDay] = useState(null);
  const [draft, setDraft] = useState({ startTime1: '', endTime1: '', startTime2: '', endTime2: '' });
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(`/doctors/${user._id}/sessions`)
      .then((res) => setSessions(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user._id]);

  const startEdit = (day) => {
    const dayEntry = sessions.find((d) => d.dayOfWeek === day);
    const s1 = dayEntry?.sessions.find((s) => s.sessionNumber === 1) || {};
    const s2 = dayEntry?.sessions.find((s) => s.sessionNumber === 2) || {};
    setDraft({
      startTime1: s1.startTime || '',
      endTime1: s1.endTime || '',
      startTime2: s2.startTime || '',
      endTime2: s2.endTime || '',
    });
    setEditingDay(day);
    setNotice('');
  };

  const saveEdit = async () => {
    try {
      const res = await api.put(`/doctors/${user._id}/sessions/${editingDay}`, draft);
      setNotice(res.data.message);
      setEditingDay(null);
      load();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="dashboard-container wide">
      <h2>Your Session Timings</h2>
      {notice && <p className="hint">{notice}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Session 1</th>
              <th>Session 2</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const dayEntry = sessions.find((d) => d.dayOfWeek === day);
              const s1 = dayEntry?.sessions.find((s) => s.sessionNumber === 1);
              const s2 = dayEntry?.sessions.find((s) => s.sessionNumber === 2);
              const isEditing = editingDay === day;

              return (
                <React.Fragment key={day}>
                  <tr>
                    <td>{day}</td>
                    <td>{s1 ? `${s1.startTime} - ${s1.endTime}` : '—'}</td>
                    <td>{s2 ? `${s2.startTime} - ${s2.endTime}` : '—'}</td>
                    <td>
                      <button onClick={() => (isEditing ? setEditingDay(null) : startEdit(day))}>
                        {isEditing ? 'Close' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                  {isEditing && (
                    <tr>
                      <td colSpan={4}>
                        <div className="inline-edit">
                          <label>Session 1 Start</label>
                          <input
                            type="time"
                            value={draft.startTime1}
                            onChange={(e) => setDraft({ ...draft, startTime1: e.target.value })}
                          />
                          <label>Session 1 End</label>
                          <input
                            type="time"
                            value={draft.endTime1}
                            onChange={(e) => setDraft({ ...draft, endTime1: e.target.value })}
                          />
                          <label>Session 2 Start</label>
                          <input
                            type="time"
                            value={draft.startTime2}
                            onChange={(e) => setDraft({ ...draft, startTime2: e.target.value })}
                          />
                          <label>Session 2 End</label>
                          <input
                            type="time"
                            value={draft.endTime2}
                            onChange={(e) => setDraft({ ...draft, endTime2: e.target.value })}
                          />
                          <button onClick={saveEdit}>Update Timings</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}

      <br />
      <Link to="/doctor">Back to Dashboard</Link>
    </div>
  );
};

export default SessionTimings;
