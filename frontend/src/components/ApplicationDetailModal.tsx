import { useState, type FormEvent } from "react";
import { ErrorDisplay } from "./StateDisplay";
import { getErrorMessage } from "../hooks/useAsync";
import { toDateInputValue, toIsoUtcStartOfDay } from "../lib/date";
import type { Application, ApplicationStatus } from "../types";
import { STATUSES } from "../types";
import type { ApplicationInput } from "../lib/api";

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onUpdate: (id: string, payload: Partial<ApplicationInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ApplicationDetailModal = ({
  application,
  onClose,
  onUpdate,
  onDelete
}: ApplicationDetailModalProps) => {
  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role);
  const [jdLink, setJdLink] = useState(application.jdLink);
  const [notes, setNotes] = useState(application.notes);
  const [dateApplied, setDateApplied] = useState(toDateInputValue(application.dateApplied));
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [salaryRange, setSalaryRange] = useState(application.salaryRange);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(toDateInputValue(application.nextFollowUpDate));
  const [followUpNote, setFollowUpNote] = useState(application.followUpNote ?? "");
  const [isFollowUpCompleted, setIsFollowUpCompleted] = useState(Boolean(application.followUpCompletedAt));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onUpdate(application._id, {
        company,
        role,
        jdLink,
        notes,
        dateApplied: toIsoUtcStartOfDay(dateApplied),
        status,
        salaryRange,
        nextFollowUpDate: nextFollowUpDate ? toIsoUtcStartOfDay(nextFollowUpDate) : null,
        followUpNote: followUpNote.trim(),
        followUpCompletedAt: isFollowUpCompleted ? new Date().toISOString() : null
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onDelete(application._id);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/25 p-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-[linear-gradient(155deg,#ffffff_0%,#f8fbff_52%,#f4f7ff_100%)] p-6 shadow-2xl shadow-slate-900/10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-500">Edit Application</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800">Application Details</h2>
          </div>
          <button
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorDisplay
              message={error}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSave}>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company"
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role"
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            value={jdLink}
            onChange={(e) => setJdLink(e.target.value)}
            placeholder="JD link"
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            placeholder="Salary range"
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            type="date"
            value={dateApplied}
            onChange={(e) => setDateApplied(e.target.value)}
          />
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <textarea
            className="md:col-span-2 min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
          />

          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
            placeholder="Next follow-up"
          />

          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400"
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            placeholder="Follow-up note"
          />

          <label className="md:col-span-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isFollowUpCompleted}
              onChange={(e) => setIsFollowUpCompleted(e.target.checked)}
            />
            Mark follow-up completed
          </label>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-600">Resume Suggestions</p>
            {application.resumeSuggestions.length === 0 ? (
              <p className="text-sm text-slate-500">No suggestions saved on this application.</p>
            ) : (
              <div className="space-y-2">
                {application.resumeSuggestions.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-sm text-slate-700">{item}</p>
                    <button
                      type="button"
                      className="ml-auto rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100"
                      onClick={() => navigator.clipboard.writeText(item)}
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex justify-between">
            <button
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
              onClick={handleDelete}
              disabled={deleting}
              type="button"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button
              className="rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold text-white transition hover:bg-fuchsia-600 disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
