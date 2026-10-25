import { Toast } from '@base-ui/react/toast'
import { Toaster } from './components/Toaster'
import { ApiHealthToast } from './screens/ApiHealthToast'
import { ReviewScreen } from './screens/ReviewScreen'

function App() {
  return (
    // No top bar: the screen is the whole page. The API's health is a toast in the bottom-left
    // corner, and theme and scheme are set from the URL (?theme=brand&scheme=dark).
    <Toast.Provider limit={1}>
      <ReviewScreen />
      {/* When the toast closes, focus goes to the question heading, never to <body>. */}
      <ApiHealthToast returnFocusTo={() => document.getElementById('page-title')} />
      <Toaster />
    </Toast.Provider>
  )
}

export default App
