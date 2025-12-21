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

const allowed = [process.env.FRONTEND_ORIGIN, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']
    .filter(Boolean);
app.use(cors({ origin: (origin, cb) => {
        
        if (!origin) return cb(null, true);
        if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
       
        try{
            const u = new URL(origin);
            if(u.hostname === 'localhost' || u.hostname === '127.0.0.1') return cb(null, true);
        }catch(e){ /* ignore malformed origin */ }
        cb(new Error('CORS not allowed'))
}, credentials: true }));


app.use((req, res, next) => {
        console.log(new Date().toISOString(), req.method, req.originalUrl);
        next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason && reason.stack ? reason.stack : reason);
});


try{
    await connectDB();
        app.use("/api/user",userRouter);
        app.use("/api/tasks", taskRouter);
        app.use("/api/collab", collabRouter);

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

    server.on('error', (err) => console.error('Server error:', err));
} catch (err) {
    console.error('Failed to start server:', err && err.message ? err.message : err);
    // Exit with non-zero so process managers know startup failed
    process.exit(1);
}

