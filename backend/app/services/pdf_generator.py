"""
PDF generation — tries WeasyPrint (HTML→PDF), falls back to ReportLab.

Usage:
    path = generate_pdf(comparison_result, output_dir="./storage")
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.schemas import ComparisonResult

logger = logging.getLogger(__name__)


def generate_pdf(result: ComparisonResult, output_dir: str = "./storage") -> str:
    """
    Generate a PDF report from a ComparisonResult.

    Returns the absolute path to the generated file.
    """
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"tech_stack_report_{timestamp}.pdf"
    filepath = out / filename

    try:
        return _generate_weasyprint(result, str(filepath))
    except Exception as exc:
        logger.warning("WeasyPrint failed (%s) — falling back to ReportLab", exc)
        return _generate_reportlab(result, str(filepath))


# ── WeasyPrint implementation ─────────────────────────────────────────────────


def _build_html(result: ComparisonResult) -> str:
    """Build an HTML string from the comparison result."""
    rows = ""
    for cat_key, component in result.components.items():
        options_html = "<br>".join(
            f"<strong>{o.name}</strong> ({o.complexity}, {o.monthly_estimate_range}) — {', '.join(o.pros[:2])}"
            for o in component.options
        )
        rows += f"""
        <tr>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">{component.name}</td>
            <td style="padding:8px;border:1px solid #ddd;">{options_html}</td>
        </tr>"""

    explanations_html = ""
    for cat, text in result.explanations.items():
        explanations_html += f"<p><strong>{cat.title()}:</strong> {text}</p>\n"

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Tech Stack Report</title>
<style>
    body {{ font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #333; }}
    h1 {{ color: #1a1a2e; border-bottom: 2px solid #16213e; padding-bottom: 10px; }}
    h2 {{ color: #16213e; margin-top: 30px; }}
    table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
    th {{ background: #16213e; color: white; padding: 12px 8px; text-align: left; }}
    .badge {{ display: inline-block; padding: 4px 10px; border-radius: 4px;
              background: #e2e8f0; font-size: 0.85em; margin: 4px 2px; }}
    .best {{ background: #c6f6d5; }}
</style>
</head>
<body>
    <h1>Tech Stack Recommendation Report</h1>
    <p>Generated on {datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")}</p>

    <h2>Summary</h2>
    <p><span class="badge best">Best MVP:</span> {result.best_mvp}</p>
    <p><span class="badge best">Best for Scale:</span> {result.best_scale}</p>
    <p><span class="badge best">Best Budget:</span> {result.best_budget}</p>

    <h2>Comparison Table</h2>
    <table>
        <tr><th>Component</th><th>Options</th></tr>
        {rows}
    </table>

    <h2>Detailed Explanations</h2>
    {explanations_html}
</body>
</html>"""


def _generate_weasyprint(result: ComparisonResult, filepath: str) -> str:
    """Generate PDF via WeasyPrint (requires system Pango libs)."""
    from weasyprint import HTML  # type: ignore[import-untyped]

    html_str = _build_html(result)
    HTML(string=html_str).write_pdf(filepath)
    logger.info("PDF generated via WeasyPrint → %s", filepath)
    return str(Path(filepath).resolve())


# ── ReportLab fallback ────────────────────────────────────────────────────────


def _generate_reportlab(result: ComparisonResult, filepath: str) -> str:
    """Generate a simpler PDF via ReportLab."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    doc = SimpleDocTemplate(filepath, pagesize=A4)
    styles = getSampleStyleSheet()
    story: list = []

    # Title
    story.append(Paragraph("Tech Stack Recommendation Report", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Best MVP: {result.best_mvp}", styles["Normal"]))
    story.append(Paragraph(f"Best for Scale: {result.best_scale}", styles["Normal"]))
    story.append(Paragraph(f"Best Budget: {result.best_budget}", styles["Normal"]))
    story.append(Spacer(1, 20))

    # Table
    table_data = [["Component", "Options"]]
    for component in result.components.values():
        opts = " | ".join(o.name for o in component.options)
        table_data.append([component.name, opts])

    t = Table(table_data, colWidths=[120, 380])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))

    # Explanations
    story.append(Paragraph("Explanations", styles["Heading2"]))
    for cat, text in result.explanations.items():
        story.append(Paragraph(f"<b>{cat.title()}</b>: {text}", styles["Normal"]))
        story.append(Spacer(1, 6))

    doc.build(story)
    logger.info("PDF generated via ReportLab → %s", filepath)
    return str(Path(filepath).resolve())
