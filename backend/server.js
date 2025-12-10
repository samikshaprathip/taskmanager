import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import {connectDB} from './config/db.js'
import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js'
import collabRouter from './routes/collabRoute.js'
import { createServer } from 'http'
import { Server as IOServer } from 'socket.io'


const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for local development. Allow common Vite dev ports and allow
// overriding with FRONTEND_ORIGIN env var. In CI/production you should lock
// this to your real frontend origin.
// Allow common dev localhost ports OR an explicit FRONTEND_ORIGIN env var.
// In development we permit any http://localhost:<port> to simplify testing.
const allowed = [process.env.FRONTEND_ORIGIN, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']
    .filter(Boolean);
app.use(cors({ origin: (origin, cb) => {
        // allow non-browser tools (curl, Postman) which don't send an origin
        if (!origin) return cb(null, true);
        // allow exact configured origins
        if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
        // allow any localhost dev origin (http://localhost:XXXX)
        try{
            const u = new URL(origin);
            if(u.hostname === 'localhost' || u.hostname === '127.0.0.1') return cb(null, true);
        }catch(e){ /* ignore malformed origin */ }
        cb(new Error('CORS not allowed'))
}, credentials: true }));

// Simple request logger to help debug incoming requests from the frontend
app.use((req, res, next) => {
        console.log(new Date().toISOString(), req.method, req.originalUrl);
        next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global error handlers so crashes are visible in the terminal instead of
// silently exiting. This helps diagnose the "connection refused" case.
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason && reason.stack ? reason.stack : reason);
});

// Start server after DB connection so we avoid race conditions and can report
// connection problems clearly.
try{
    await connectDB();
        app.use("/api/user",userRouter);
        app.use("/api/tasks", taskRouter);
        app.use("/api/collab", collabRouter);

        // attach Socket.IO to the server for real-time collaboration events
        const httpServer = createServer(app)
        const io = new IOServer(httpServer, { cors: { origin: allowed } })
        io.on('connection', (socket) => {
            console.log('Socket connected', socket.id)
            socket.on('joinProject', (projectId) => { socket.join(`project_${projectId}`) })
            socket.on('leaveProject', (projectId) => { socket.leave(`project_${projectId}`) })
            socket.on('taskUpdated', (payload) => { io.to(`project_${payload.projectId}`).emit('taskUpdated', payload) })
            socket.on('disconnect', ()=>{ console.log('Socket disconnected', socket.id) })
        })

    app.get('/', (req, res) => {
            res.send('API WORKING');
    })

      const server = httpServer.listen(port, () => {
          console.log(`Server Started on http://localhost:${port}`)
      })
    // Optional: log server 'close' and 'error' events
    server.on('error', (err) => console.error('Server error:', err));
} catch (err) {
    console.error('Failed to start server:', err && err.message ? err.message : err);
    // Exit with non-zero so process managers know startup failed
    process.exit(1);
}

