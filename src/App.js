import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Navigation from './components/Navigation/index.js'
import sipackerStore from './store'
import { Provider } from 'react-redux'
import Container from './components/Container'
import 'dayjs/locale/ru'

import NotFound404 from 'components/NotFound404'
import ContextMenuProvider from 'components/ContextMenu'

const Dashboard = lazy(() => import('./routes/Dashboard'))
const NewPack = lazy(() => import('./routes/NewPack'))
const Pack = lazy(() => import('./routes/Pack'))

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4248fb',
    },
  },
  components: {
    MuiDialog: {
      defaultProps: {
        disableRestoreFocus: true,
      },
    },
  },
})

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  )
}

export default function App() {
  return (
    <Provider store={sipackerStore}>
      <ThemeProvider theme={darkTheme}>
        <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
          <ContextMenuProvider>
            <Container>
              <Navigation />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path='/' element={<Dashboard />} />
                  <Route path='/create' element={<NewPack />} />
                  <Route path='/pack/:packUUID/*' element={<Pack />} />
                  <Route path='*' element={<NotFound404 />} />
                </Routes>
              </Suspense>
            </Container>
          </ContextMenuProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
