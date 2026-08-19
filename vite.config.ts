import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@material-ui/core',
      '@material-ui/core/styles',
      '@material-ui/icons/Menu',
      '@material-ui/icons/NotificationsNone',
      '@material-ui/icons/MoreVert',
      '@material-ui/icons/AssessmentOutlined',
      '@material-ui/icons/FolderOutlined',
      '@material-ui/icons/FilterList',
      '@material-ui/icons/QueueOutlined',
      '@material-ui/icons/CloudOutlined',
      '@material-ui/icons/MoreHorizOutlined',
      '@material-ui/icons/Close',
      '@material-ui/icons/DragHandle',
      '@material-ui/icons/ReportProblem',
    ],
  },
  resolve: {
    dedupe: [
      '@fullcalendar/core',
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
    ],
  },
})
