import React from 'react';
import { Download } from 'lucide-react';

/**
 * PdfButtons
 *
 * Drop-in replacement for the old single "Download PDF" button.
 * Renders two buttons side-by-side:
 *   1. "Download PDF"           – tables-only, fast
 *   2. "Download with Charts"   – captures .chart-card images, slower
 */
const PdfButtons = ({
  onDownloadPdf,
  onDownloadWithCharts,
  pdfLoading      = false,
  chartPdfLoading = false,
  showCharts      = true,
}) => {
  const busy = pdfLoading || chartPdfLoading;

  return (
    <>
      <button
        className="pdf-download-btn"
        onClick={onDownloadPdf}
        type="button"
        disabled={busy}
        style={{ opacity: pdfLoading ? 0.7 : 1, cursor: pdfLoading ? 'wait' : 'pointer' }}
      >
        <Download size={15} />
        {pdfLoading ? 'Generating...' : 'Download PDF'}
      </button>

      {showCharts && onDownloadWithCharts && (
        <button
          className="pdf-download-btn"
          onClick={onDownloadWithCharts}
          type="button"
          disabled={busy}
          style={{
            opacity: chartPdfLoading ? 0.7 : 1,
            cursor: chartPdfLoading ? 'wait' : 'pointer',
            background: 'linear-gradient(135deg, #5a0000 0%, #800000 100%)',
          }}
        >
          <Download size={15} />
          {chartPdfLoading ? 'Capturing Charts...' : 'Download with Charts'}
        </button>
      )}
    </>
  );
};

export default PdfButtons;
