import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export a session's attendance as CSV
 */
export async function exportSessionCSV(session, classStudents, className) {
  const rows = [];
  rows.push(['Roll Number', 'Student Name', 'Status', 'Time Marked', 'Confidence']);

  const attendedIds = new Set((session.attendance || []).map(a => a.student_id));

  classStudents.forEach(student => {
    const attendanceRecord = (session.attendance || []).find(a => a.student_id === student.id);
    const isPresent = attendedIds.has(student.id);

    rows.push([
      student.roll_number,
      student.name,
      isPresent ? 'Present' : 'Absent',
      isPresent && attendanceRecord ? new Date(attendanceRecord.marked_at).toLocaleTimeString() : '—',
      isPresent && attendanceRecord?.confidence ? `${Math.round((1 - attendanceRecord.confidence) * 100)}%` : '—',
    ]);
  });

  const csvContent = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_${className}_${new Date(session.started_at).toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export a session's attendance as PDF
 */
export async function exportSessionPDF(session, classStudents, className) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance Report', 14, 22);

  // Class info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Class: ${className}`, 14, 32);
  doc.text(`Date: ${new Date(session.started_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`, 14, 39);

  const startTime = new Date(session.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endTime = session.ended_at 
    ? new Date(session.ended_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : 'Ongoing';
  doc.text(`Time: ${startTime} — ${endTime}`, 14, 46);

  const attendedIds = new Set((session.attendance || []).map(a => a.student_id));
  const presentCount = attendedIds.size;
  const totalCount = classStudents.length;
  const absentCount = totalCount - presentCount;

  doc.text(`Present: ${presentCount} / ${totalCount}  |  Absent: ${absentCount}`, 14, 53);

  // Table
  const tableBody = classStudents.map(student => {
    const attendanceRecord = (session.attendance || []).find(a => a.student_id === student.id);
    const isPresent = attendedIds.has(student.id);

    return [
      student.roll_number,
      student.name,
      isPresent ? 'Present' : 'Absent',
      isPresent && attendanceRecord ? new Date(attendanceRecord.marked_at).toLocaleTimeString() : '—',
    ];
  });

  autoTable(doc, {
    startY: 60,
    head: [['Roll No.', 'Name', 'Status', 'Time Marked']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      2: {
        fontStyle: 'bold',
        cellWidth: 30,
      },
    },
    didParseCell: (data) => {
      if (data.column.index === 2 && data.section === 'body') {
        if (data.cell.raw === 'Present') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  doc.save(`attendance_${className}_${new Date(session.started_at).toISOString().split('T')[0]}.pdf`);
}
