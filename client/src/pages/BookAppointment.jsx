import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [sessionsByDay, setSessionsByDay] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSession, setSelectedSession] = useState(null); // { dayOfWeek, startTime }
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/doctors').then((res) => setDoctors(res.data));
  }, []);

  const loadSessions = async (id) => {
    setDoctorId(id);
    setSessionsByDay([]);
    setSelectedSession(null);
    if (!id) return;
    const res = await api.get(`/doctors/${id}/sessions`);
    setSessionsByDay(res.data);
  };

  const today = new Date().toISOString().split('T')[0];

  const selectedDayName = useMemo(() => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate + 'T00:00:00');
    return DAYS[d.getDay()];
  }, [selectedDate]);

  const sessionsForSelectedDay = useMemo(() => {
    if (!selectedDayName) return [];
    const dayEntry = sessionsByDay.find((d) => d.dayOfWeek === selectedDayName);
    return dayEntry ? dayEntry.sessions : [];
  }, [sessionsByDay, selectedDayName]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setMessage(null);
    if (!doctorId || !selectedDate || !selectedSession) {
      setError('Please choose a doctor, date, and session.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/appointments', {
        doctorId,
        dayOfWeek: selectedDayName,
        startTime: selectedSession.startTime,
        selectedDate,
      });
      setMessage(res.data.message);
      setSelectedSession(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page wide">
      <div className="form-container wide">
        <h2>Book an Appointment</h2>

        <label>Choose Doctor:</label>
        <select value={doctorId} onChange={(e) => loadSessions(e.target.value)}>
          <option value="">-- Select Doctor --</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.name} ({doc.specialization})
            </option>
          ))}
        </select>

        {doctorId && (
          <>
            <label style={{ marginTop: 20 }}>Select Appointment Date:</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSession(null);
              }}
            />

            <p className="hint">
              {selectedDate
                ? `Showing sessions for: ${selectedDayName}`
                : 'Please select a date to view matching sessions.'}
            </p>

            {selectedDate && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsForSelectedDay.length === 0 && (
                    <tr>
                      <td colSpan={4}>No sessions configured for {selectedDayName}.</td>
                    </tr>
                  )}
                  {sessionsForSelectedDay.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <input
                          type="radio"
                          name="session"
                          checked={selectedSession?.startTime === s.startTime}
                          onChange={() =>
                            setSelectedSession({ dayOfWeek: selectedDayName, startTime: s.startTime })
                          }
                        />
                      </td>
                      <td>{selectedDayName}</td>
                      <td>{s.startTime}</td>
                      <td>{s.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            <button onClick={handleBook} disabled={submitting} style={{ marginTop: 15 }}>
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </>
        )}

        <br />
        <Link to="/patient">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default BookAppointment;
