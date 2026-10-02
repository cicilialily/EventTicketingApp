import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  LoaderCircle,
  QrCode,
  ScanLine,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { checkInTicket } from "../../services/checkIn.service";
import "./CheckIn.css";

function CheckIn() {
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function stopScanner() {
    if (!scannerRef.current) return;

    try {
      if (isScannerRunning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (error) {
      console.error("Failed to stop QR scanner:", error);
    } finally {
      scannerRef.current = null;
      setIsScannerRunning(false);
    }
  }

  async function submitCheckIn(value) {
    const scannedCode = value?.trim();

    if (!scannedCode || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessData(null);
    setQrCode(scannedCode);

    try {
      const ticket = await checkInTicket(scannedCode);

      setSuccessData(ticket);
      await stopScanner();
    } catch (error) {
      console.error("Check-in failed:", error);

      setErrorMessage(
        error.message || "We couldn't check in this ticket.",
      );
    } finally {
      setIsSubmitting(false);
      isProcessingRef.current = false;
    }
  }

  async function startScanner() {
    setScannerError("");
    setErrorMessage("");
    setSuccessData(null);

    try {
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        setScannerError(
          "No camera was found. You can use the manual QR code option instead.",
        );
        return;
      }

      const scanner = new Html5Qrcode("ticket-qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        cameras[0].id,
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await submitCheckIn(decodedText);
        },
        () => {
          // QR scanning is continuously attempting to detect a code.
        },
      );

      setIsScannerRunning(true);
    } catch (error) {
      console.error("Unable to start QR scanner:", error);

      scannerRef.current = null;
      setIsScannerRunning(false);

      setScannerError(
        "Unable to access the camera. Please allow camera permission or use the manual option.",
      );
    }
  }

  async function handleManualCheckIn(event) {
    event.preventDefault();
    await submitCheckIn(qrCode);
  }

  function handleReset() {
    setQrCode("");
    setSuccessData(null);
    setErrorMessage("");
    setScannerError("");
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  const event = successData?.event;
  const ticketType = successData?.ticketType;

  return (
    <main className="check-in-page">
      <div className="check-in-container">
        <section className="check-in-header">
          <div>
            <span className="check-in-eyebrow">ORGANIZER TOOLS</span>

            <h1>Ticket Check-In</h1>

            <p>
              Scan an attendee's ticket QR code to validate their ticket and
              record their arrival.
            </p>
          </div>

          <div className="check-in-security-badge">
            <ShieldCheck size={20} />
            <span>Secure validation</span>
          </div>
        </section>

        <section className="check-in-grid">
          <div className="scanner-card">
            <div className="card-heading">
              <div className="card-heading-icon">
                <ScanLine size={21} />
              </div>

              <div>
                <h2>Scan Ticket</h2>
                <p>Use your device camera to scan the attendee's QR code.</p>
              </div>
            </div>

            <div
              id="ticket-qr-reader"
              className="ticket-qr-reader"
            />

            {!isScannerRunning ? (
              <button
                type="button"
                className="start-scanner-button"
                onClick={startScanner}
                disabled={isSubmitting}
              >
                <Camera size={19} />
                Start Camera Scanner
              </button>
            ) : (
              <button
                type="button"
                className="stop-scanner-button"
                onClick={stopScanner}
                disabled={isSubmitting}
              >
                Stop Scanner
              </button>
            )}

            {scannerError && (
              <div className="check-in-message error">
                <XCircle size={18} />
                <span>{scannerError}</span>
              </div>
            )}
          </div>

          <div className="manual-card">
            <div className="card-heading">
              <div className="card-heading-icon">
                <QrCode size={21} />
              </div>

              <div>
                <h2>Manual Check-In</h2>
                <p>Paste the QR payload when a camera isn't available.</p>
              </div>
            </div>

            <form
              className="manual-check-in-form"
              onSubmit={handleManualCheckIn}
            >
              <label htmlFor="ticket-qr-code">
                QR Code Payload
              </label>

              <textarea
                id="ticket-qr-code"
                value={qrCode}
                onChange={(event) => {
                  setQrCode(event.target.value);
                  setErrorMessage("");
                  setSuccessData(null);
                }}
                placeholder="Paste the ticket QR code value here..."
                rows={6}
                disabled={isSubmitting}
              />

              <button
                type="submit"
                className="manual-check-in-button"
                disabled={!qrCode.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="check-in-spinner"
                    />
                    Checking Ticket...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={19} />
                    Validate Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {isSubmitting && (
          <section className="checking-ticket-card">
            <LoaderCircle
              size={24}
              className="check-in-spinner"
            />

            <div>
              <strong>Validating ticket...</strong>
              <p>Please wait while we verify the ticket.</p>
            </div>
          </section>
        )}

        {errorMessage && !isSubmitting && (
          <section className="check-in-result error-result">
            <div className="result-icon">
              <XCircle size={30} />
            </div>

            <div>
              <span className="result-label">CHECK-IN FAILED</span>

              <h2>Ticket could not be validated</h2>

              <p>{errorMessage}</p>
            </div>

            <button
              type="button"
              className="result-reset-button"
              onClick={handleReset}
            >
              Try Another Ticket
            </button>
          </section>
        )}

        {successData && !isSubmitting && (
          <section className="check-in-result success-result">
            <div className="result-icon">
              <CheckCircle2 size={30} />
            </div>

            <div className="success-result-content">
              <span className="result-label">CHECK-IN SUCCESSFUL</span>

              <h2>Attendee checked in</h2>

              <div className="checked-ticket-details">
                <div>
                  <span>Ticket Number</span>
                  <strong>{successData.ticketNumber}</strong>
                </div>

                <div>
                  <span>Ticket Type</span>
                  <strong>{ticketType?.name || "Ticket"}</strong>
                </div>

                <div>
                  <span>Event</span>
                  <strong>{event?.title || "Event"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{successData.status}</strong>
                </div>
              </div>

              <p>
                Checked in at{" "}
                {successData.checkedInAt
                  ? new Date(
                      successData.checkedInAt,
                    ).toLocaleString("en-NG")
                  : "just now"}
                .
              </p>
            </div>

            <button
              type="button"
              className="result-reset-button"
              onClick={handleReset}
            >
              Scan Another Ticket
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

export default CheckIn;