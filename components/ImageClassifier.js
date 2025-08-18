import { useState } from 'react'

export default function ImageClassifier() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
      setError(null)

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      predictImage(file)
    }
  }

  const predictImage = async (file) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('Sending prediction request to FastAPI...')
      
      const response = await fetch('https://defijangle-will-jangle-eat.hf.space/api/predict', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('API response:', result)

      setResult({
        prediction: result.prediction,
        confidence: result.confidence,
        all_scores: result.all_scores,
        will_eat: result.will_eat
      })

    } catch (err) {
      console.error('Prediction error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getVerdict = (prediction) => {
    if (!prediction) return null

    switch (prediction) {
      case 'not_durian_edible':
        return {
          message: "Jangle will eat this! 🍽️",
          className: "will-eat"
        }
      case 'durian':
        return {
          message: "Jangle will NOT eat this! 🚫 (It's durian - he hates durian)",
          className: "will-not-eat"
        }
      case 'inedible':
        return {
          message: "Jangle will NOT eat this! 🚫 (Not food)",
          className: "will-not-eat"
        }
      default:
        return {
          message: "Hmm, I'm not sure about this one...",
          className: "will-not-eat"
        }
    }
  }

  return (
    <div className="upload-area">
      <div className="file-input-wrapper">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        <div className="file-input-button">
          {selectedFile ? 'Choose Different Image' : 'Choose an Image'}
        </div>
      </div>

      {previewUrl && (
        <div className="preview-container">
          <img src={previewUrl} alt="Preview" className="preview-image" />
        </div>
      )}

      {loading && (
        <div className="loading"></div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="result">
          <div className={`verdict ${getVerdict(result.prediction)?.className}`}>
            {getVerdict(result.prediction)?.message}
          </div>
          {result.confidence && (
            <div className="confidence">
              Confidence: {Math.round(result.confidence * 100)}%
            </div>
          )}
          {result.all_scores && (
            <div className="confidence">
              All scores: {JSON.stringify(result.all_scores, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}