import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { legalRequestService } from '../../services/legalRequest.service';
import type { LegalRequest } from '../../services/legalRequest.service';
import { REQUEST_STATUS_LABELS } from '../../config/constants';

export default function LegalRequestsPage() {
  const [requests, setRequests] = useState<LegalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await legalRequestService.getRequests();
      setRequests(data);
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft request?')) return;
    setDeletingId(id);
    try {
      await legalRequestService.deleteRequest(id);
      setRequests(r => r.filter(req => req.id !== id));
    } catch { alert('Could not delete. Only draft requests can be deleted.'); }
    finally { setDeletingId(null); }
  };

  if (isLoading) return <div className="dashboard-loading"><div className="dash-spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Legal Requests</h1>
          <p>Manage your legal requirements and track their progress.</p>
        </div>
        <Link to="/startup/requests/new" className="btn-primary">+ New Request</Link>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No legal requests</h3>
          <p>Create a legal request to start finding matched counsel for your startup.</p>
          <Link to="/startup/requests/new" className="btn-primary">Create Your First Request</Link>
        </div>
      ) : (
        <div className="requests-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Matter Type</th>
                <th>Jurisdiction</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>
                    <Link to={`/startup/requests/${req.id}`} className="table-link">{req.title}</Link>
                  </td>
                  <td className="text-gray">{req.matterType}</td>
                  <td className="text-gray">{req.jurisdiction}</td>
                  <td className="text-gray">{req.currency} {req.budgetMin.toLocaleString()}–{req.budgetMax.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>
                      {REQUEST_STATUS_LABELS[req.status] || req.status}
                    </span>
                  </td>
                  <td className="text-gray">{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="table-actions">
                    <Link to={`/startup/requests/${req.id}`} className="action-link">View</Link>
                    {req.status === 'DRAFT' && (
                      <button
                        className="action-link action-link--danger"
                        onClick={() => handleDelete(req.id)}
                        disabled={deletingId === req.id}
                      >
                        {deletingId === req.id ? '…' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
