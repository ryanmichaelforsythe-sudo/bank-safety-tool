/**
 * NewlyCharteredNotice — contextual banner for institutions with limited history.
 * Shows when quartersAvailable < 4.
 */

interface NewlyCharteredNoticeProps {
  quartersAvailable: number;
}

export function NewlyCharteredNotice({ quartersAvailable }: NewlyCharteredNoticeProps) {
  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-sm font-semibold text-blue-800">
        Limited History
      </h2>
      <p className="mt-1 text-xs text-blue-700">
        This institution was chartered recently. Only {quartersAvailable} quarter
        {quartersAvailable !== 1 ? "s" : ""} of financial data{" "}
        {quartersAvailable === 1 ? "is" : "are"} available. Trend comparisons
        may be limited.
      </p>
    </div>
  );
}
