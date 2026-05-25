import { useState } from 'react';
import { pdfApi } from '../api/api';

/**
 * usePdfDownload
 *
 * Returns two download handlers and their loading states for any analytics/data page.
 *
 * @param {string}   selectedYear  - currently selected school year, e.g. "2024-2025"
 * @param {string[]} chartLabels   - ordered labels matching the .chart-card elements on the page
 * @param {string}   type          - 'metrics' | 'classrooms' | 'enrollments' | 'teachers-seats'
 */
const usePdfDownload = (selectedYear, chartLabels = [], type = 'metrics') => {
  const [pdfLoading, setPdfLoading]           = useState(false);
  const [chartPdfLoading, setChartPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      await pdfApi.downloadMetrics(selectedYear, type);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadWithCharts = async () => {
    try {
      setChartPdfLoading(true);
      await pdfApi.downloadMetricsWithCharts(selectedYear, chartLabels, type);
    } catch (err) {
      console.error('Charts PDF download failed:', err);
      alert('Failed to generate PDF with charts. Please try again.');
    } finally {
      setChartPdfLoading(false);
    }
  };

  return {
    pdfLoading,
    chartPdfLoading,
    handleDownloadPDF,
    handleDownloadWithCharts,
    /** Convenience: both loading combined — use to disable all buttons */
    anyLoading: pdfLoading || chartPdfLoading,
  };
};

export default usePdfDownload;
