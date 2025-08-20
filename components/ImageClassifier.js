import { useState } from 'react'

export default function ImageClassifier() {
  const [imageUrl, setImageUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleUrlSubmit = async (e) => {
    e.preventDefault()
    if (!imageUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    setResult(null)
    setError(null)
    setPreviewUrl(imageUrl)
    
    await predictImageFromUrl(imageUrl)
  }

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value)
    if (error) setError(null)
  }

  const predictImageFromUrl = async (imageUrl) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Loading Gradio client...')
      
      // Dynamic import to load Gradio client
      const { client } = await import('@gradio/client')
      
      console.log('Fetching image from URL:', imageUrl)
      
      // Fetch the image as blob
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`)
      }
      const imageBlob = await imageResponse.blob()

      console.log('Connecting to Gradio app...')
      
      // Connect to Gradio app
      const app = await client("https://defijangle-will-jangle-eat.hf.space/--replicas/pgkvd/")
      
      console.log('Making prediction request...')
      
      // Make prediction
      const result = await app.predict("/predict", [imageBlob])
      
      console.log('API response:', result)

      // Extract data from result
      if (result && result.data && result.data.length > 0) {
        const data = result.data[0]
        setResult({
          prediction: data.prediction || 'unknown',
          confidence: data.confidence || 0,
          all_scores: data.all_scores || {},
          will_eat: data.will_eat || false
        })
      } else {
        throw new Error('Unexpected response format from API')
      }

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
      <form onSubmit={handleUrlSubmit} className="url-form">
        <div className="url-input-wrapper">
          <input
            type="url"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
            className="url-input"
            disabled={loading}
          />
          <button type="submit" className="submit-button" disabled={loading || !imageUrl.trim()}>
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </div>
      </form>
      
      {/* Example button for quick testing */}
      <button 
        type="button" 
        onClick={() => {
          const busUrl = "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
          setImageUrl(busUrl)
          setPreviewUrl(busUrl)
          predictImageFromUrl(busUrl)
        }}
        className="example-button"
        disabled={loading}
      >
        Test with Bus Image
      </button>

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