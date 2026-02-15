const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // Fix path if needed

// Get dashboard stats
router.get('/', async (req, res) => {
    try {
        // Count Teachers (Faculty)
        const { count: teacherCount, error: teacherError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'faculty');

        if (teacherError) throw teacherError;

        // Count Students
        const { count: studentCount, error: studentError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student');

        if (studentError) throw studentError;

        res.json({
            teachers: teacherCount || 0,
            students: studentCount || 0
        });
    } catch (error) {
        console.error('❌ Stats error:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
});

module.exports = router;
