import { useEffect, useState } from "react";
import { BadgeCheck, Download, FileUp, Files, Upload } from "lucide-react";
import Layout, { PageHeader } from "../components/Layout";
import api, { formatApiError, getCsrfToken } from "../services/api";

const TEMPLATE_BATCH_SIZE = 5;

function UploadCertificate() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [zipFile, setZipFile] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateResult, setTemplateResult] = useState(null);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  useEffect(() => {
    api.get("/accounts/students/").then((response) => setStudents(response.data));
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!studentId || !file) return;

    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("certificate_file", file);

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      await getCsrfToken();
      const response = await api.post("/certificates/upload/", formData);
      setResult(response.data);
      setMessage("Certificate uploaded and QR code generated");

      setStudentId("");
      setFile(null);

     const fileInput = document.querySelector(
  'input[type="file"]'
);

if (fileInput) {
  fileInput.value = "";
}
    } catch (err) {
      setMessage(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (event) => {
    event.preventDefault();
    if (!bulkFiles.length && !zipFile) return;

    const formData = new FormData();
    bulkFiles.forEach((certificateFile) => {
      formData.append("certificate_files", certificateFile);
    });
    if (zipFile) {
      formData.append("zip_file", zipFile);
    }

    setBulkLoading(true);
    setBulkMessage("");
    setBulkResult(null);

    try {
      await getCsrfToken();
      const response = await api.post("/certificates/bulk-upload/", formData);
      setBulkResult(response.data);
      setBulkMessage(
        `${response.data.created_count} certificates uploaded, ${response.data.skipped_count} skipped`
      );
      setBulkFiles([]);
      setZipFile(null);
    } catch (err) {
      setBulkMessage(err.response?.data?.error || "Bulk upload failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleTemplateGenerate = async (event) => {
    event.preventDefault();
    if (!templateFile) return;
    if (!students.length) {
      setTemplateMessage("Upload students first before generating certificates.");
      return;
    }

    setTemplateLoading(true);
    setTemplateMessage("");
    setTemplateResult(null);

    const aggregated = {
      created: [],
      skipped: [],
      created_count: 0,
      skipped_count: 0,
    };

    try {
      await getCsrfToken();

      const studentIds = students.map((student) => student.student_id);
      for (let index = 0; index < studentIds.length; index += TEMPLATE_BATCH_SIZE) {
        const batch = studentIds.slice(index, index + TEMPLATE_BATCH_SIZE);
        const formData = new FormData();
        formData.append("template_file", templateFile);
        formData.append("issue_date", issueDate);
        batch.forEach((studentId) => formData.append("student_ids", studentId));

        setTemplateMessage(`Generating certificates ${Math.min(index + batch.length, studentIds.length)} of ${studentIds.length}...`);

        const response = await api.post("/certificates/generate-from-template/", formData);
        aggregated.created.push(...(response.data.created || []));
        aggregated.skipped.push(...(response.data.skipped || []));
        aggregated.created_count += response.data.created_count || 0;
        aggregated.skipped_count += response.data.skipped_count || 0;
      }

      setTemplateResult(aggregated);
      setTemplateMessage(
        `${aggregated.created_count} certificates generated, ${aggregated.skipped_count} skipped`
      );
      setTemplateFile(null);
    } catch (err) {
      if (aggregated.created_count > 0) {
        setTemplateResult(aggregated);
        setTemplateMessage(
          `${aggregated.created_count} generated before failure. ${formatApiError(err, "Template generation failed")}`
        );
      } else {
        setTemplateMessage(formatApiError(err, "Template generation failed"));
      }
    } finally {
      setTemplateLoading(false);
    }
  };

  return (
    <Layout role="admin">
      <PageHeader title="Upload Certificate" eyebrow="Certificate Management" />
      <div className="mb-5 grid gap-4 md:grid-cols-3">

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm text-slate-500">
            Total Students
          </h3>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {students.length}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm text-slate-500">
            Single Upload
          </h3>
          <p className="mt-2 text-lg font-semibold text-emerald-600">
            Available
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm text-slate-500">
            Template Generate
          </h3>
          <p className="mt-2 text-lg font-semibold text-cyan-600">
            Supported
          </p>
        </div>

      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <form onSubmit={handleUpload} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-950">
              <FileUp size={20} />
              <h3 className="font-semibold">Single Certificate Upload</h3>
            </div>

            <label className="mb-4 block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Student</span>
              <select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-cyan-600"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.student_id} - {student.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mb-5 block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Certificate File
              </span>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
              />

              {file && (
                <p className="mt-2 text-sm text-slate-500">
                  Selected File: {file.name}
                </p>
              )}
            </label>

            <button
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
            >
              <FileUp size={18} />
              {loading ? "Uploading..." : "Upload and Generate QR"}
            </button>

            {message && <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p>}
          </form>

          <form onSubmit={handleBulkUpload} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-950">
              <Files size={20} />
              <h3 className="font-semibold">Bulk Certificate Upload</h3>
            </div>

            <div className="mb-4 rounded-lg bg-cyan-50 p-4 text-sm text-cyan-900">
              Name each certificate with the student ID, for example <strong>TSC001.pdf</strong>,
              <strong> TSC002.png</strong>, or <strong>course_TSC003.jpg</strong>. You can upload
              many files together or one ZIP containing all certificates.
            </div>

            <label className="mb-4 block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Certificate Files</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(event) => setBulkFiles(Array.from(event.target.files || []))}
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-1 block text-sm font-medium text-slate-700">ZIP File</span>
              <input
                type="file"
                accept=".zip"
                onChange={(event) => setZipFile(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
              />
            </label>

            <button
              disabled={bulkLoading || (!bulkFiles.length && !zipFile)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
            >
              <Upload size={18} />
              {bulkLoading ? "Uploading certificates..." : "Upload Bulk Certificates"}
            </button>

            {bulkMessage && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{bulkMessage}</p>
            )}
          </form>

          <form onSubmit={handleTemplateGenerate} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-950">
              <BadgeCheck size={20} />
              <h3 className="font-semibold">Generate Certificates from Template</h3>
            </div>

            <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
              Upload one blank JPG/PNG certificate template. The system will write each student's name,
              ID, course, issue date, and QR code onto a separate certificate.
            </div>

            <label className="mb-4 block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Blank Certificate Template</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(event) => setTemplateFile(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
              />
              {templateFile && (
                <p className="mt-2 text-sm text-slate-500">Selected Template: {templateFile.name}</p>
              )}
            </label>

            <label className="mb-5 block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Issue Date</span>
              <input
                type="date"
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-cyan-600"
              />
            </label>

            <button
              disabled={templateLoading || !templateFile}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
            >
              <BadgeCheck size={18} />
              {templateLoading ? "Generating certificates..." : "Generate for All Students"}
            </button>

            {templateMessage && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{templateMessage}</p>
            )}
          </form>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-semibold">
              Generated QR Code
            </h3>

            <p className="text-sm text-slate-500">
              Scan to verify certificate
            </p>
          </div>
          {result?.qr ? (
            <div>

              <img
                src={result.qr}
                alt="Generated certificate QR code"
                className="mx-auto h-56 w-56 rounded-lg border border-slate-200 object-contain p-3"
              />

              <a
                href={result.download_url}
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800"
              >
                <Download size={17} />
                Download Certificate
              </a>

              {result?.verification_url && (
                <a
                  href={result.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block text-center font-medium text-cyan-600 hover:underline"
                >
                  Open Verification Page
                </a>
              )}

            </div>
          ) : (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              Upload a certificate to preview the generated QR code and download link.
            </p>
          )}
        </aside>
      </section>

      {bulkResult && (
        <section className="mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h3 className="font-semibold text-slate-950">Bulk Upload Result</h3>
            <p className="text-sm text-slate-500">
              {bulkResult.created_count} uploaded successfully, {bulkResult.skipped_count} skipped.
            </p>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-emerald-700">Uploaded</h4>
              <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
                {bulkResult.created.length ? (
                  bulkResult.created.map((item) => (
                    <div key={`${item.student_id}-${item.file}`} className="flex items-center justify-between gap-3 border-b border-slate-100 p-3 text-sm last:border-b-0">
                      <div>
                        <p className="font-semibold text-slate-950">{item.student_id} - {item.student_name}</p>
                        <p className="text-slate-500">{item.file}</p>
                      </div>
                      <a href={item.download_url} rel="noreferrer" className="rounded-lg bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
                        Download
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-sm text-slate-500">No certificates uploaded.</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-red-700">Skipped</h4>
              <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
                {bulkResult.skipped.length ? (
                  bulkResult.skipped.map((item) => (
                    <div key={`${item.file}-${item.reason}`} className="border-b border-slate-100 p-3 text-sm last:border-b-0">
                      <p className="font-semibold text-slate-950">{item.file}</p>
                      <p className="text-red-700">{item.reason}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-sm text-slate-500">Nothing skipped.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {templateResult && (
        <section className="mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h3 className="font-semibold text-slate-950">Template Generation Result</h3>
            <p className="text-sm text-slate-500">
              {templateResult.created_count} generated successfully, {templateResult.skipped_count} skipped.
            </p>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-emerald-700">Generated</h4>
              <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
                {templateResult.created.length ? (
                  templateResult.created.map((item) => (
                    <div key={`${item.student_id}-template`} className="flex items-center justify-between gap-3 border-b border-slate-100 p-3 text-sm last:border-b-0">
                      <div>
                        <p className="font-semibold text-slate-950">{item.student_id} - {item.student_name}</p>
                        <a href={item.verification_url} target="_blank" rel="noreferrer" className="text-cyan-700 hover:underline">
                          Verification Page
                        </a>
                      </div>
                      <a href={item.download_url} rel="noreferrer" className="rounded-lg bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
                        Download
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-sm text-slate-500">No certificates generated.</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-red-700">Skipped</h4>
              <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
                {templateResult.skipped.length ? (
                  templateResult.skipped.map((item) => (
                    <div key={`${item.student_id}-${item.reason}`} className="border-b border-slate-100 p-3 text-sm last:border-b-0">
                      <p className="font-semibold text-slate-950">{item.student_id} - {item.student_name}</p>
                      <p className="text-red-700">{item.reason}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-sm text-slate-500">Nothing skipped.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

export default UploadCertificate;
