import express from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireMentor } from '../middleware/auth.js';
import { Student } from '../models/Student.js';
import { Session } from '../models/Session.js';
import { Attendance } from '../models/Attendance.js';
import { ImportBatch } from '../models/ImportBatch.js';
import { analyzeSheetStructure } from '../services/ai/analyzeSheetStructure.js';
import { inferMissingDates } from '../services/ai/inferMissingDates.js';
import { generateGapReport } from '../services/ai/generateGapReport.js';

const router = express.Router();

// ─── POST /api/mentor/attendance-import/analyze ─────────────────────────────
// Step 1: Send sheet snippets to the AI for field mapping.
router.post('/analyze', requireAuth, requireMentor, async (req, res) => {
  try {
    const { sheets } = req.body; // [{ sheetName, rows: [] }]
    if (!sheets?.length) {
      return res.status(400).json({ error: 'No sheet data provided' });
    }

    const analyses = [];
    for (const sheet of sheets) {
      const rows = (sheet.rows || []).slice(0, 10);
      const analysis = await analyzeSheetStructure(sheet.sheetName, rows);
      analyses.push({ sheetName: sheet.sheetName, analysis });
    }

    return res.json({ analyses });
  } catch (err) {
    console.error('[/analyze]', err);
    return res.status(500).json({ error: 'Analysis failed', message: err.message });
  }
});

// ─── POST /api/mentor/attendance-import/infer-dates ──────────────────────────
// Step 2 (optional): Infer dates for columns whose headers have no parseable date.
router.post('/infer-dates', requireAuth, requireMentor, async (req, res) => {
  try {
    const { undatedColumns, anchorSessions, daysOfWeek } = req.body;
    if (!undatedColumns?.length) {
      return res.json({ suggestions: [] });
    }
    const result = await inferMissingDates(
      undatedColumns,
      anchorSessions || [],
      daysOfWeek || []
    );
    return res.json(result);
  } catch (err) {
    console.error('[/infer-dates]', err);
    return res.status(500).json({ error: 'Date inference failed', message: err.message });
  }
});

// ─── POST /api/mentor/attendance-import/dry-run ──────────────────────────────
// Step 3: Validate + preview the full normalized dataset. Creates a draft ImportBatch.
router.post('/dry-run', requireAuth, requireMentor, async (req, res) => {
  try {
    const { filename, fileType, sheets, aiMapping } = req.body;
    // sheets: [{ sheetName, rows: [], mapping: { studentIdentifier, sessionColumns: [{ columnName, date }], presentValues, absentValues } }]

    if (!filename || !sheets?.length) {
      return res.status(400).json({ error: 'filename and sheets are required' });
    }

    // Fetch DB state for gap analysis
    const [dbStudents, dbSessions] = await Promise.all([
      Student.find({ isActive: true }).select('usn fullName email'),
      Session.find().select('date topic'),
    ]);

    const normalizedRows = [];
    const unknownStudentUsns = new Set();
    const conflictingRecords = [];
    const unmappedColumns = [];

    for (const sheet of sheets) {
      const { rows, mapping } = sheet;
      if (!mapping) continue;

      const { studentIdentifier, sessionColumns, presentValues, absentValues } = mapping;

      for (const row of rows) {
        // Find the student USN value in this row
        const rawId = row[studentIdentifier];
        if (!rawId) continue;
        const usn = String(rawId).trim().toUpperCase();

        for (const sc of sessionColumns) {
          if (!sc.date) {
            if (!unmappedColumns.includes(sc.columnName)) unmappedColumns.push(sc.columnName);
            continue;
          }
          const rawVal = row[sc.columnName];
          const strVal = String(rawVal).trim();
          const isPresent =
            presentValues.some(p => strVal.toLowerCase() === String(p).toLowerCase()) ||
            rawVal === true || rawVal === 1;
          const isAbsent =
            absentValues.some(a => strVal.toLowerCase() === String(a).toLowerCase()) ||
            rawVal === false || rawVal === 0;

          if (!isPresent && !isAbsent) continue; // truly unknown value — skip

          normalizedRows.push({
            usn,
            date: sc.date, // YYYY-MM-DD
            status: isPresent ? 'present' : 'absent',
            topic: sc.columnName,
            sheet: sheet.sheetName,
          });
        }
      }
    }

    // Identify students not in DB
    const dbUsnSet = new Set(dbStudents.map(s => s.usn.toUpperCase()));
    for (const row of normalizedRows) {
      if (!dbUsnSet.has(row.usn)) unknownStudentUsns.add(row.usn);
    }

    // Identify duplicates (existing DB records for same student × date)
    const datesToCheck = [...new Set(normalizedRows.map(r => r.date))];
    for (const dateStr of datesToCheck) {
      const sessionDate = new Date(dateStr);
      sessionDate.setUTCHours(0, 0, 0, 0);
      const session = await Session.findOne({ date: sessionDate });
      if (session) {
        const count = await Attendance.countDocuments({ sessionId: session._id });
        if (count > 0) {
          conflictingRecords.push({
            date: dateStr,
            topic: session.topic,
            existingCount: count,
          });
        }
      }
    }

    // Gap report
    const gapReport = generateGapReport(
      normalizedRows.filter(r => !unknownStudentUsns.has(r.usn)),
      dbStudents.map(s => ({ usn: s.usn, fullName: s.fullName })),
      dbSessions.map(s => ({ date: s.date, topic: s.topic }))
    );

    // Create draft ImportBatch (status: dry_run)
    const batch = new ImportBatch({
      uploadedBy: req.auth.user._id,
      filename,
      fileType: fileType || 'xlsx',
      sheetsProcessed: sheets.map(s => s.sheetName),
      status: 'dry_run',
      aiMapping: aiMapping || [],
      dryRunSummary: {
        totalRecords: normalizedRows.length,
        matched: normalizedRows.filter(r => dbUsnSet.has(r.usn)).length,
        conflicts: conflictingRecords.length,
        gaps: gapReport.missingStudents.length + gapReport.uncoveredSessions.length,
        unknownStudents: unknownStudentUsns.size,
        unmappedColumns,
      },
    });
    await batch.save();

    return res.json({
      batchDraftId: batch._id,
      normalizedRows,
      conflicts: conflictingRecords,
      unknownStudents: [...unknownStudentUsns],
      gapReport,
      unmappedColumns,
      summary: batch.dryRunSummary,
    });
  } catch (err) {
    console.error('[/dry-run]', err);
    return res.status(500).json({ error: 'Dry run failed', message: err.message });
  }
});

// ─── POST /api/mentor/attendance-import/commit ───────────────────────────────
// Step 4: Commit the dry-run batch to the database transactionally.
router.post('/commit', requireAuth, requireMentor, async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const { batchDraftId, normalizedRows, conflictResolution } = req.body;
    // conflictResolution: 'skip' | 'overwrite'

    if (!batchDraftId || !normalizedRows?.length) {
      return res.status(400).json({ error: 'batchDraftId and normalizedRows are required' });
    }

    const batch = await ImportBatch.findById(batchDraftId);
    if (!batch) return res.status(404).json({ error: 'Import batch not found' });
    if (batch.status !== 'dry_run') {
      return res.status(409).json({ error: 'Batch has already been committed or rolled back' });
    }

    let written = 0;
    let skipped = 0;
    let overwritten = 0;
    const warnings = [];
    const createdAttendanceIds = [];
    const createdSessionIds = [];

    for (const record of normalizedRows) {
      try {
        if (!record.usn || !record.date || !record.status) {
          skipped++;
          continue;
        }

        const student = await Student.findOne({
          usn: record.usn.toUpperCase(),
          isActive: true,
        }).session(dbSession);

        if (!student) {
          skipped++;
          warnings.push(`Student not found: ${record.usn}`);
          continue;
        }

        // Find or create session
        const sessionDate = new Date(record.date);
        sessionDate.setUTCHours(0, 0, 0, 0);

        let session = await Session.findOne({ date: sessionDate }).session(dbSession);
        if (!session) {
          [session] = await Session.create(
            [{
              date: sessionDate,
              topic: record.topic || 'Imported Session',
              monthNumber: sessionDate.getMonth() + 1,
              durationHours: 2,
              sessionType: 'offline',
              mentorId: req.auth.user._id,
              importBatchId: batch._id,
            }],
            { session: dbSession }
          );
          createdSessionIds.push(session._id);
        }

        // Handle existing attendance
        const existing = await Attendance.findOne({
          studentId: student._id,
          sessionId: session._id,
        }).session(dbSession);

        if (existing) {
          if (conflictResolution === 'overwrite') {
            existing.status = record.status;
            existing.markedBy = req.auth.user._id;
            existing.markedAt = new Date();
            existing.importBatchId = batch._id;
            await existing.save({ session: dbSession });
            overwritten++;
          } else {
            skipped++;
            warnings.push(`Skipped existing: ${record.usn} on ${record.date}`);
          }
          continue;
        }

        // Create new attendance record
        const [att] = await Attendance.create(
          [{
            studentId: student._id,
            sessionId: session._id,
            status: record.status,
            markedBy: req.auth.user._id,
            markedAt: new Date(),
            importBatchId: batch._id,
          }],
          { session: dbSession }
        );
        createdAttendanceIds.push(att._id);
        written++;
      } catch (err) {
        skipped++;
        warnings.push(`Error for ${record.usn} on ${record.date}: ${err.message}`);
      }
    }

    // Update the ImportBatch record
    batch.status = 'committed';
    batch.commitSummary = { written, skipped, overwritten, warnings };
    batch.createdAttendanceIds = createdAttendanceIds;
    batch.createdSessionIds = createdSessionIds;
    await batch.save({ session: dbSession });

    await dbSession.commitTransaction();

    return res.json({
      success: true,
      batchId: batch.batchId,
      written,
      skipped,
      overwritten,
      warnings,
    });
  } catch (err) {
    await dbSession.abortTransaction();
    console.error('[/commit]', err);
    return res.status(500).json({ error: 'Commit failed — all changes rolled back', message: err.message });
  } finally {
    dbSession.endSession();
  }
});

// ─── GET /api/mentor/attendance-import/batches ───────────────────────────────
// List all import batches for this mentor.
router.get('/batches', requireAuth, requireMentor, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [batches, total] = await Promise.all([
      ImportBatch.find({ uploadedBy: req.auth.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-createdAttendanceIds -createdSessionIds -aiMapping'),
      ImportBatch.countDocuments({ uploadedBy: req.auth.user._id }),
    ]);

    return res.json({
      batches,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (err) {
    console.error('[/batches]', err);
    return res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

// ─── POST /api/mentor/attendance-import/rollback/:batchId ───────────────────
// Atomically delete all attendance and sessions created by this batch.
router.post('/rollback/:batchId', requireAuth, requireMentor, async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const batch = await ImportBatch.findOne({
      _id: req.params.batchId,
      uploadedBy: req.auth.user._id,
    });

    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (batch.status !== 'committed') {
      return res.status(409).json({ error: 'Only committed batches can be rolled back' });
    }

    // Delete attendance created by this batch
    const attResult = await Attendance.deleteMany(
      { importBatchId: batch._id },
      { session: dbSession }
    );

    // Delete ONLY sessions that were created by this import AND have no other attendance
    let deletedSessions = 0;
    for (const sessionId of batch.createdSessionIds) {
      const otherAtt = await Attendance.countDocuments({
        sessionId,
        importBatchId: { $ne: batch._id },
      }).session(dbSession);

      if (otherAtt === 0) {
        await Session.deleteOne({ _id: sessionId }, { session: dbSession });
        deletedSessions++;
      }
      // If manual attendance exists, leave the session intact
    }

    batch.status = 'rolled_back';
    batch.rollbackAt = new Date();
    await batch.save({ session: dbSession });

    await dbSession.commitTransaction();

    return res.json({
      success: true,
      deletedAttendance: attResult.deletedCount,
      deletedSessions,
    });
  } catch (err) {
    await dbSession.abortTransaction();
    console.error('[/rollback]', err);
    return res.status(500).json({ error: 'Rollback failed', message: err.message });
  } finally {
    dbSession.endSession();
  }
});

export default router;
