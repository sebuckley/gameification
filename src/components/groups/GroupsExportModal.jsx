import { useState } from "react";
import usePeople from "../store/usePeopleStore";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function GroupsExportModal({ onClose }) {
  const groupsHistory = usePeople((s) => s.groupsHistory);
  const [copied, setCopied] = useState(null);

  /* -------------------------------------------------------
     GLOBAL LONGEST NAME → CONSISTENT COLUMN WIDTH
  ------------------------------------------------------- */
  const longestName = groupsHistory
    .flatMap((session) => session.groups.flatMap((g) => g))
    .reduce((max, p) => {
      const name = p.fullName || p.name || "";
      return name.length > max ? name.length : max;
    }, 0);

  const colWidth = Math.min(Math.max(longestName * 9, 140), 320);

  /* -------------------------------------------------------
     MULTI-PAGE SPLITTING
  ------------------------------------------------------- */
  const splitIntoPages = (session) => {
    const { groups } = session;
    const maxRows = Math.max(...groups.map((g) => g.length));
    const rowsPerPage = 20;

    const pages = [];
    for (let start = 0; start < maxRows; start += rowsPerPage) {
      pages.push({ start, end: start + rowsPerPage });
    }
    return pages;
  };

  /* -------------------------------------------------------
     BUILD POWERPOINT HTML FOR ONE SESSION (MULTI-PAGE)
     - Solid colour group headers using first person's color
  ------------------------------------------------------- */
  const buildSessionHtml = (session) => {
    const { sessionName, groups } = session;
    const pages = splitIntoPages(session);

    return pages
      .map(({ start, end }) => {
        const totalCols = groups.length * 2 - 1; // no trailing spacer

        return `
<table style="border-collapse: collapse; width: 100%; font-family: Arial; margin-bottom: 40px;">
  <thead>
    <!-- Title row -->
    <tr>
      <th colspan="${totalCols}" 
          style="padding: 12px 0 16px 0; font-size: 20px; font-weight: bold; text-align: center;">
        ${sessionName || "Session"}
      </th>
    </tr>

    <!-- Spacer row -->
    <tr><td colspan="${totalCols}" style="height: 10px;"></td></tr>

    <!-- Group headers -->
    <tr>
      ${groups
        .map((group, i) => {
          const isLast = i === groups.length - 1;
          const firstPerson = group[0];
          const headerColor = firstPerson?.color || "#4F46E5";

          return `
            <th style="
              border: 1px solid #ccc;
              padding: 8px;
              width: ${colWidth}px;
              background: ${headerColor};
              color: #ffffff;
              font-weight: bold;
              text-align: center;
            ">
              Group ${i + 1}
            </th>
            ${isLast ? "" : `<th style="width: 20px;"></th>`}
          `;
        })
        .join("")}
    </tr>
  </thead>

  <tbody>
    ${Array.from({ length: end - start })
      .map((_, rowOffset) => {
        const rowIndex = start + rowOffset;

        // Skip row if ALL groups have no person here
        const rowIsEmpty = groups.every((group) => !group[rowIndex]);
        if (rowIsEmpty) return "";

        return `
        <tr>
          ${groups
            .map((group, i) => {
              const person = group[rowIndex];
              const isLast = i === groups.length - 1;

              return `
                <td style="border: 1px solid #ccc; padding: 8px; width: ${colWidth}px;">
                  ${person ? person.fullName || person.name : ""}
                </td>
                ${isLast ? "" : `<td style="width: 20px;"></td>`}
              `;
            })
            .join("")}
        </tr>
      `;
      })
      .join("")}
  </tbody>
</table>
`;
      })
      .join("\n");
  };

  /* -------------------------------------------------------
     COPY HTML (PER SESSION)
  ------------------------------------------------------- */
  const copyHtml = (html, id) => {
    navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([html], { type: "text/plain" }),
      }),
    ]);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  /* -------------------------------------------------------
     DOWNLOAD FILE (HTML)
  ------------------------------------------------------- */
  const downloadHtml = (content, filename) => {
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* -------------------------------------------------------
     EXPORT EXCEL (XLSX) — ONE SHEET PER SESSION
     Sheet name = sessionName
  ------------------------------------------------------- */
  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    groupsHistory.forEach((session, index) => {
      const { sessionName, groups } = session;
      const sheetName = sessionName || `Session ${index + 1}`;

      // Build rows: [Group, Name]
      const rows = [["Group", "Name"]];

      groups.forEach((group, gIndex) => {
        group.forEach((p) => {
          rows.push([
            `Group ${gIndex + 1}`,
            p.fullName || p.name || "",
          ]);
        });
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, "groups-sessions.xlsx");
  };

  /* -------------------------------------------------------
     EXPORT PDF — SIMPLE TEXT LAYOUT
  ------------------------------------------------------- */
const exportPdf = () => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 40;
  const rightMargin = 40;
  const maxWidth = pageWidth - leftMargin - rightMargin;

  groupsHistory.forEach((session, sIndex) => {
    const { sessionName, groups } = session;

    if (sIndex > 0) {
      doc.addPage();
    }

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(sessionName || `Session ${sIndex + 1}`, leftMargin, 40);

    // Build table rows
    const maxRows = Math.max(...groups.map((g) => g.length));
    const rows = [];

    for (let i = 0; i < maxRows; i++) {
      const row = groups.map((group) => {
        const person = group[i];
        return person ? person.fullName || person.name : "";
      });
      rows.push(row);
    }

    // Build table headers with colours
    const headers = groups.map((group, gIndex) => {
      const firstPerson = group[0];
      const headerColor = firstPerson?.color || "#4F46E5";

      return {
        content: `Group ${gIndex + 1}`,
        styles: {
          fillColor: headerColor,
          textColor: "#FFFFFF",
          halign: "center",
          fontStyle: "bold",
        },
      };
    });

    // AutoTable (NO PAGE BREAKS)
    autoTable(doc, {
      startY: 70,
      head: [headers],
      body: rows,
      styles: {
        font: "helvetica",
        fontSize: 11,
        cellPadding: 6,
        lineColor: "#000000",
        lineWidth: 0.5,
        overflow: "linebreak", // wrap text instead of splitting pages
      },
      columnStyles: Object.fromEntries(
        headers.map((_, i) => [
          i,
          { cellWidth: "wrap", minCellWidth: 120, maxCellWidth: 200 },
        ])
      ),
      margin: { left: leftMargin, right: leftMargin },
      theme: "grid",
      pageBreak: "avoid", // NEVER split across pages
      tableWidth: "wrap", // shrink table to fit page
      didDrawPage: (data) => {
        // Force everything to stay on one page
        data.settings.pageBreak = "avoid";
      },
    });
  });

  doc.save("groups-sessions.pdf");
};



  /* -------------------------------------------------------
     RENDER MODAL
  ------------------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl space-y-6 border overflow-y-auto max-h-[90vh]">

        <h2 className="text-2xl font-bold text-center">
          Export Groups
        </h2>

        {/* Excel / PDF Actions */}
        <div className="space-y-2">
          <div className="font-semibold text-gray-700">File Exports</div>
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
            >
              Export Excel (XLSX)
            </button>
            <button
              onClick={exportPdf}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* PowerPoint (PER SESSION, MULTI-PAGE) */}
        <div className="space-y-4">
          <div className="font-semibold text-gray-700">
            PowerPoint Table (Per Session)
          </div>

          {groupsHistory.map((session, index) => {
            const html = buildSessionHtml(session);

            return (
              <div key={index} className="border rounded p-3 space-y-2">
                <div className="font-medium text-gray-800">
                  {session.sessionName || `Session ${index + 1}`}
                </div>

                <textarea
                  className="border rounded p-3 w-full h-32 text-xs bg-gray-50"
                  readOnly
                  value={html}
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => copyHtml(html, `html-${index}`)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
                  >
                    {copied === `html-${index}` ? "Copied!" : "Copy Table"}
                  </button>

                  <button
                    onClick={() =>
                      downloadHtml(
                        html,
                        `${session.sessionName || `session-${index + 1}`}-table.html`
                      )
                    }
                    className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 w-full"
                  >
                    Download HTML
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
