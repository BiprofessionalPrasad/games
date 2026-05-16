import ChessGame from './components/ChessGame'
import './App.css'

function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#e3f2fd', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ChessGame />
    </div>
  )
}

export default App
