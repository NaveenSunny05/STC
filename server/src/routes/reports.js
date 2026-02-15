const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const PDFDocument = require('pdfkit');

// Generate PDF Report
router.get('/generate-pdf', async (req, res) => {
    try {
        // 1. Get last report date
        // For simplicity, we might store this in a 'config' table or just default to 1 month ago if not found.
        // Or we can pass 'startDate' and 'endDate' as query params.
        // Let's assume we fetch all activities for now or use a query param.

        // const { startDate, endDate } = req.query; 

        // Fetch activities (events, projects, etc.)
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: false });

        if (eventsError) throw eventsError;

        // Create PDF
        const doc = new PDFDocument();

        // Stream to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=activity_report.pdf');

        doc.pipe(res);

        // Title
        doc.fontSize(25).text('Science & Tech Club - Activity Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Events Section
        doc.fontSize(18).text('Events/Activities', { underline: true });
        doc.moveDown();

        if (events && events.length > 0) {
            events.forEach((event, index) => {
                doc.fontSize(14).text(`${index + 1}. ${event.title}`);
                doc.fontSize(10).text(`   Date: ${new Date(event.date).toLocaleDateString()}`);
                doc.fontSize(10).text(`   Location: ${event.location || 'N/A'}`);
                doc.fontSize(10).text(`   Description: ${event.description || 'No description'}`);
                doc.moveDown();
            });
        } else {
            doc.fontSize(12).text('No recent events found.');
        }

        doc.end();

    } catch (error) {
        console.error('❌ Report generation error:', error);
        res.status(500).json({ message: 'Failed to generate report' });
    }
});

module.exports = router;
